import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/bcrypt';
import { sendWelcomeKvkkEmail } from '../lib/email/sendWelcomeKvkk';
import logger from '../utils/logger';

// PostgreSQL UserRole enum values
const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN' as const,
  CUSTOMER: 'CUSTOMER' as const
};

// Tüm restoranları listele (Süper Admin)
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

// Tek restoran detayı
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

// Yeni restoran oluştur (Süper Admin)
export const createRestaurant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      businessType,
      memberNo,
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
      googleMapsUrl,
      workingHours,
      instagramUrl,
      facebookUrl,
      membershipStartDate,
      membershipEndDate,
      internalNote,
      ownerEmail,
      ownerName,
      ownerPassword,
      themeColor,
    } = req.body;

    // Üyelik tarihleri validasyonu
    if (!membershipStartDate || !membershipEndDate) {
      throw new ApiError(400, 'Üyelik başlangıç ve bitiş tarihleri zorunludur');
    }

    const startDate = new Date(membershipStartDate);
    const endDate = new Date(membershipEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ApiError(400, 'Geçersiz tarih formatı');
    }

    if (endDate < startDate) {
      throw new ApiError(400, 'Bitiş tarihi başlangıç tarihinden önce olamaz');
    }

    // Slug kontrolü
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (existingRestaurant) {
      throw new ApiError(400, 'Bu slug zaten kullanılıyor');
    }

    // Üye numarası üret veya kontrol et
    let finalMemberNo = memberNo;
    if (!finalMemberNo) {
      // 6 haneli rastgele üye numarası üret
      let attempts = 0;
      while (attempts < 10) {
        finalMemberNo = String(Math.floor(100000 + Math.random() * 900000));
        const existing = await prisma.restaurant.findUnique({
          where: { memberNo: finalMemberNo },
        });
        if (!existing) break;
        attempts++;
      }
      if (attempts >= 10) {
        throw new ApiError(500, 'Üye numarası oluşturulamadı');
      }
    } else {
      // Verilen üye numarası zaten kullanılıyor mu kontrol et
      const existing = await prisma.restaurant.findUnique({
        where: { memberNo: finalMemberNo },
      });
      if (existing) {
        throw new ApiError(400, 'Bu üye numarası zaten kullanılıyor');
      }
    }

    // Owner oluştur veya mevcut olanı kullan
    let owner;
    const existingOwner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existingOwner) {
      // Mevcut kullanıcıyı restoran sahibi olarak kullan (rol/aktiflik/name/password güncelle)
      const ownerUpdateData: any = {
        isActive: true,
        // SUPER_ADMIN'i düşürmeyelim; diğer roller varsa RESTAURANT_ADMIN yapalım
        ...(existingOwner.role !== UserRole.SUPER_ADMIN && { role: UserRole.RESTAURANT_ADMIN }),
        ...(ownerName && ownerName !== existingOwner.name && { name: ownerName }),
      };

      if (ownerPassword && typeof ownerPassword === 'string' && ownerPassword.length >= 6) {
        ownerUpdateData.password = await hashPassword(ownerPassword);
      }

      owner = await prisma.user.update({
        where: { id: existingOwner.id },
        data: ownerUpdateData,
      });
    } else {
      const hashedPassword = await hashPassword(ownerPassword);
      owner = await prisma.user.create({
        data: {
          email: ownerEmail,
          name: ownerName,
          password: hashedPassword,
          role: UserRole.RESTAURANT_ADMIN,
        },
      });
    }

    // workingHours JSON kontrolü
    let workingHoursStr = null;
    if (workingHours) {
      if (typeof workingHours === 'string') {
        workingHoursStr = workingHours;
      } else if (Array.isArray(workingHours)) {
        workingHoursStr = JSON.stringify(workingHours);
      } else if (typeof workingHours === 'object') {
        workingHoursStr = JSON.stringify(workingHours);
      }
    }

    // Restoran oluştur
    const restaurant = await prisma.restaurant.create({
      data: {
        businessType: businessType || 'Restoran',
        memberNo: finalMemberNo,
        name,
        slug,
        description,
        address: address || fullAddress, // backward compatibility
        city,
        district,
        neighborhood,
        fullAddress,
        phone,
        email,
        googleMapsUrl,
        workingHours: workingHoursStr,
        instagramUrl,
        facebookUrl,
        internalNote,
        themeColor,
        membershipStartDate: startDate,
        membershipEndDate: endDate,
        ownerId: owner.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Restoran sahibine hoşgeldin e-postası gönder (başarısız olursa işlemi durdurmaz)
    try {
      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const emailResult = await sendWelcomeKvkkEmail({
        to: owner.email,
        name: owner.name,
        loginEmail: owner.email,
        loginUrl: `${appUrl}/login`,
        tempPassword: ownerPassword,
        includePassword: !existingOwner, // Sadece yeni kullanıcı için şifre göster
        restaurantName: name,
      });

      if (emailResult.success) {
        logger.info(`✅ Welcome email sent for restaurant "${name}" to ${owner.email}`);
      } else {
        logger.warn(`⚠️ Welcome email failed for restaurant "${name}": ${emailResult.error}`);
      }
    } catch (emailError: any) {
      // E-posta hatası restoran oluşturmayı engellemez
      logger.error(`❌ Welcome email error for restaurant "${name}":`, emailError.message);
    }

    sendSuccess(res, restaurant, 'Restoran başarıyla oluşturuldu', 201);
  } catch (error) {
    next(error);
  }
};

// Restoran güncelle
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
      slug 
    } = req.body;

    console.log('Update restaurant request:', { 
      id, 
      userId: req.user?.userId, 
      role: req.user?.role, 
      hasThemeSettings: !!themeSettings,
      workingHours: workingHours ? (typeof workingHours === 'string' ? workingHours.substring(0, 50) + '...' : 'object') : 'empty',
      slug
    });

    // Restoran kontrolü
    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    // Slug güncelleniyorsa benzersizlik kontrolü yap
    if (slug && slug !== restaurant.slug) {
      const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug } });
      if (existingRestaurant) {
        throw new ApiError(400, 'Bu slug URL zaten kullanılıyor. Lütfen başka bir slug seçin.');
      }
    }

    console.log('Restaurant found:', { restaurantId: restaurant.id, ownerId: restaurant.ownerId });

    // Yetki kontrolü (Restoran admini sadece kendi restoranını güncelleyebilir)
    if (req.user?.role === UserRole.RESTAURANT_ADMIN && restaurant.ownerId !== req.user.userId) {
      throw new ApiError(403, 'Bu restoranı güncelleme yetkiniz yok');
    }

    // themeSettings'i JSON string'e çevir (eğer object ise)
    const themeSettingsString = themeSettings 
      ? (typeof themeSettings === 'string' ? themeSettings : JSON.stringify(themeSettings))
      : undefined;

    // workingHours JSON kontrolü
    let workingHoursStr = undefined;
    if (workingHours !== undefined) {
      if (typeof workingHours === 'string') {
        workingHoursStr = workingHours;
      } else if (Array.isArray(workingHours)) {
        workingHoursStr = JSON.stringify(workingHours);
      } else if (typeof workingHours === 'object') {
        workingHoursStr = JSON.stringify(workingHours);
      }
    }

    console.log('Theme settings to save:', themeSettingsString ? themeSettingsString.substring(0, 100) + '...' : 'null');

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(businessType !== undefined && { businessType }),
        name,
        description,
        address: address || fullAddress, // backward compatibility
        ...(city !== undefined && { city }),
        ...(district !== undefined && { district }),
        ...(neighborhood !== undefined && { neighborhood }),
        ...(fullAddress !== undefined && { fullAddress }),
        phone,
        email,
        logo,
        headerImage,
        instagramUrl,
        facebookUrl,
        ...(googleMapsUrl !== undefined && { googleMapsUrl }),
        ...(internalNote !== undefined && { internalNote }),
        ...(slug !== undefined && { slug }),
        ...(workingHoursStr !== undefined && { workingHours: workingHoursStr }),
        themeColor,
        ...(themeSettingsString !== undefined && { themeSettings: themeSettingsString }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    sendSuccess(res, updatedRestaurant, 'Restoran başarıyla güncellendi');
  } catch (error) {
    next(error);
  }
};

// Restoran sil (Süper Admin)
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

// Kendi restoranını getir (Restoran Admin)
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
        _count: {
          select: {
            qrCodes: true,
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
