/**
 * Restaurant Controller - Enhanced with QR Code & Member Number Generation
 * Handles restaurant CRUD operations with automatic QR code and member number generation
 */

import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/bcrypt';
import { sendWelcomeKvkkEmail } from '../lib/email/sendWelcomeKvkk';
import logger from '../utils/logger';
import {
  generateMemberNo,
  generateUniqueSlug,
  isSlugAvailable,
  generateQRCodeString,
  generateQRCodeImage,
  calculateMembershipStatus,
} from '../utils/restaurant.utils';

// PostgreSQL UserRole enum values
const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN' as const,
  CUSTOMER: 'CUSTOMER' as const,
};

// PostgreSQL BusinessType enum values
const BusinessType = {
  RESTORAN: 'RESTORAN' as const,
  KAFE: 'KAFE' as const,
  OTEL: 'OTEL' as const,
  DIGER: 'DIGER' as const,
};

/**
 * Get all restaurants (Super Admin only)
 */
export const getAllRestaurants = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        qrCodes: {
          select: {
            id: true,
            code: true,
            scanCount: true,
          },
          take: 1,
        },
        _count: {
          select: {
            categories: true,
            qrCodes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, restaurants);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single restaurant details
 */
export const getRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        qrCodes: {
          select: {
            id: true,
            code: true,
            imageData: true,
            imageUrl: true,
            scanCount: true,
            lastScannedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    sendSuccess(res, restaurant);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new restaurant with owner, QR code, and member number (Super Admin only)
 * Creates restaurant, owner user, and QR code in a single transaction
 */
export const createRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      // Business info
      businessType = 'RESTORAN',
      name,
      slug: providedSlug,
      description,
      phone,
      email,
      googleMapsUrl,
      workingHours,
      instagramUrl,
      facebookUrl,
      fullAddress,
      city,
      district,
      neighborhood,
      internalNote,
      themeColor,
      
      // Membership dates
      membershipStartDate,
      membershipEndDate,
      
      // Owner info
      ownerName,
      ownerEmail,
      ownerPassword,
    } = req.body;

    // Validation
    if (!name || !ownerName || !ownerEmail || !ownerPassword) {
      throw new ApiError(400, 'Restoran adı, sahip adı, email ve şifre zorunludur');
    }

    if (!membershipStartDate || !membershipEndDate) {
      throw new ApiError(400, 'Üyelik başlangıç ve bitiş tarihleri zorunludur');
    }

    // Parse and validate dates
    const startDate = new Date(membershipStartDate);
    const endDate = new Date(membershipEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ApiError(400, 'Geçersiz tarih formatı');
    }

    if (endDate <= startDate) {
      throw new ApiError(400, 'Bitiş tarihi başlangıç tarihinden sonra olmalı');
    }

    // Password validation
    if (ownerPassword.length < 6) {
      throw new ApiError(400, 'Şifre en az 6 karakter olmalı');
    }

    // Validate businessType
    if (!Object.keys(BusinessType).includes(businessType)) {
      throw new ApiError(400, 'Geçersiz işletme tipi');
    }

    // Generate or validate slug
    let finalSlug: string;
    if (providedSlug) {
      const slugAvailable = await isSlugAvailable(providedSlug);
      if (!slugAvailable) {
        throw new ApiError(400, 'Bu slug zaten kullanılıyor. Lütfen başka bir slug seçin.');
      }
      finalSlug = providedSlug;
    } else {
      finalSlug = await generateUniqueSlug(name);
    }

    // Generate unique member number
    const memberNo = await generateMemberNo();

    // Check if owner email already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existingOwner) {
      throw new ApiError(400, 'Bu email adresi zaten kullanılıyor. Lütfen farklı bir email girin.');
    }

    // Generate QR code
    const qrCode = await generateQRCodeString();
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const menuUrl = `${frontendUrl}/menu/${finalSlug}`;
    const qrImageData = await generateQRCodeImage(menuUrl);

    // Calculate membership status
    const membershipStatus = calculateMembershipStatus(startDate, endDate, true);

    // Process working hours
    let workingHoursStr: string | null = null;
    if (workingHours) {
      if (typeof workingHours === 'string') {
        workingHoursStr = workingHours;
      } else if (typeof workingHours === 'object') {
        workingHoursStr = JSON.stringify(workingHours);
      }
    }

    // Create restaurant, owner, and QR code in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create owner user
      const hashedPassword = await hashPassword(ownerPassword);
      const owner = await tx.user.create({
        data: {
          email: ownerEmail,
          name: ownerName,
          password: hashedPassword,
          role: UserRole.RESTAURANT_ADMIN,
          isActive: true,
        },
      });

      // 2. Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          businessType: businessType as any,
          memberNo,
          name,
          slug: finalSlug,
          description,
          phone,
          email,
          googleMapsUrl,
          workingHours: workingHoursStr,
          instagramUrl,
          facebookUrl,
          fullAddress,
          city,
          district,
          neighborhood,
          internalNote,
          themeColor: themeColor || '#3B82F6',
          membershipStartDate: startDate,
          membershipEndDate: endDate,
          membershipStatus: membershipStatus as any,
          isActive: true,
          ownerId: owner.id,
        },
      });

      // 3. Create QR code
      const qrCodeRecord = await tx.qRCode.create({
        data: {
          code: qrCode,
          imageData: qrImageData,
          restaurantId: restaurant.id,
          isActive: true,
        },
      });

      return { restaurant, owner, qrCode: qrCodeRecord };
    });

    // Send welcome email (non-blocking)
    try {
      const loginUrl = `${frontendUrl}/login`;
      const emailResult = await sendWelcomeKvkkEmail({
        to: result.owner.email,
        name: result.owner.name,
        loginEmail: result.owner.email,
        loginUrl,
        tempPassword: ownerPassword,
        includePassword: true,
        restaurantName: result.restaurant.name,
      });

      if (emailResult.success) {
        logger.info(`✅ Welcome email sent to ${result.owner.email}`);
      } else {
        logger.warn(`⚠️ Welcome email failed: ${emailResult.error}`);
      }
    } catch (emailError: any) {
      logger.error(`❌ Welcome email error:`, emailError.message);
    }

    // Return complete data
    const responseData = {
      restaurant: {
        ...result.restaurant,
        owner: {
          id: result.owner.id,
          name: result.owner.name,
          email: result.owner.email,
        },
      },
      qrCode: {
        id: result.qrCode.id,
        code: result.qrCode.code,
        imageData: result.qrCode.imageData,
        menuUrl,
      },
      menuUrl,
    };

    sendSuccess(res, responseData, 'Restoran başarıyla oluşturuldu', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update restaurant
 */
export const updateRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      businessType,
      name,
      slug,
      description,
      address,
      city,
      district,
      neighborhood,
      fullAddress,
      phone,
      email,
      logo,
      workingHours,
      themeColor,
      themeSettings,
      headerImage,
      instagramUrl,
      facebookUrl,
      googleMapsUrl,
      internalNote,
      membershipStartDate,
      membershipEndDate,
      isActive,
    } = req.body;

    // Check restaurant exists
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    // Authorization check
    if (req.user?.role === UserRole.RESTAURANT_ADMIN && restaurant.ownerId !== req.user.userId) {
      throw new ApiError(403, 'Bu restoranı güncelleme yetkiniz yok');
    }

    // Slug uniqueness check
    if (slug && slug !== restaurant.slug) {
      const slugAvailable = await isSlugAvailable(slug, id);
      if (!slugAvailable) {
        throw new ApiError(400, 'Bu slug URL zaten kullanılıyor');
      }
    }

    // Parse dates if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    if (membershipStartDate) {
      startDate = new Date(membershipStartDate);
      if (isNaN(startDate.getTime())) {
        throw new ApiError(400, 'Geçersiz başlangıç tarihi formatı');
      }
    }
    if (membershipEndDate) {
      endDate = new Date(membershipEndDate);
      if (isNaN(endDate.getTime())) {
        throw new ApiError(400, 'Geçersiz bitiş tarihi formatı');
      }
    }

    // Calculate new membership status if dates changed
    let membershipStatus: any;
    if (startDate || endDate || isActive !== undefined) {
      membershipStatus = calculateMembershipStatus(
        startDate || restaurant.membershipStartDate,
        endDate || restaurant.membershipEndDate,
        isActive !== undefined ? isActive : restaurant.isActive
      );
    }

    // Process theme settings
    const themeSettingsString = themeSettings
      ? typeof themeSettings === 'string' ? themeSettings : JSON.stringify(themeSettings)
      : undefined;

    // Process working hours
    let workingHoursStr: string | undefined;
    if (workingHours !== undefined) {
      if (typeof workingHours === 'string') {
        workingHoursStr = workingHours;
      } else if (typeof workingHours === 'object') {
        workingHoursStr = JSON.stringify(workingHours);
      }
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(businessType && { businessType: businessType as any }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(address && { address }),
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(fullAddress !== undefined && { fullAddress }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(logo !== undefined && { logo }),
        ...(headerImage !== undefined && { headerImage }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(internalNote !== undefined && { internalNote }),
        ...(workingHoursStr !== undefined && { workingHours: workingHoursStr }),
        ...(themeColor && { themeColor }),
        ...(themeSettingsString !== undefined && { themeSettings: themeSettingsString }),
        ...(startDate && { membershipStartDate: startDate }),
        ...(endDate && { membershipEndDate: endDate }),
        ...(isActive !== undefined && { isActive }),
        ...(membershipStatus && { membershipStatus: membershipStatus as any }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        qrCodes: {
          select: {
            id: true,
            code: true,
            imageData: true,
            scanCount: true,
          },
          take: 1,
        },
      },
    });

    sendSuccess(res, updatedRestaurant, 'Restoran başarıyla güncellendi');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete restaurant (Super Admin only)
 */
export const deleteRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    await prisma.restaurant.delete({ where: { id } });

    sendSuccess(res, null, 'Restoran başarıyla silindi');
  } catch (error) {
    next(error);
  }
};

/**
 * Get my restaurant (Restaurant Admin)
 */
export const getMyRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
      include: {
        categories: {
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        qrCodes: {
          select: {
            id: true,
            code: true,
            imageData: true,
            scanCount: true,
          },
          take: 1,
        },
        _count: {
          select: {
            qrCodes: true,
            categories: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    sendSuccess(res, restaurant);
  } catch (error) {
    next(error);
  }
};

/**
 * Check if slug is available
 * GET /api/admin/restaurants/check-slug?slug=my-restaurant&excludeId=uuid
 */
export const checkSlugAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, excludeId } = req.query;

    if (!slug || typeof slug !== 'string') {
      throw new ApiError(400, 'Slug parametresi gerekli');
    }

    const available = await isSlugAvailable(slug, excludeId as string | undefined);

    sendSuccess(res, {
      slug,
      available,
      message: available ? 'Slug kullanılabilir' : 'Slug zaten kullanımda',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate slug from name
 * POST /api/admin/restaurants/generate-slug
 * Body: { name: "Restaurant Name" }
 */
export const generateSlugFromName = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      throw new ApiError(400, 'Name parametresi gerekli');
    }

    const slug = await generateUniqueSlug(name);

    sendSuccess(res, { name, slug });
  } catch (error) {
    next(error);
  }
};
