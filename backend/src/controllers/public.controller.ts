import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError, sendSuccess } from '../utils/response';
import { slugifyTR } from '../utils/slugify';

// Müşteri menü görüntüleme
export const getPublicMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { table } = req.query;

    // Restoran kontrolü
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        headerImage: true,
        address: true,
        phone: true,
        workingHours: true,
        instagramUrl: true,
        facebookUrl: true,
        themeColor: true,
        themeSettings: true,
      },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    // Kategoriler ve ürünler
    const categories = await prisma.category.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      include: {
        products: {
          where: {
            isAvailable: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Analytics kaydı
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        restaurantId_date: {
          restaurantId: restaurant.id,
          date: today,
        },
      },
      create: {
        restaurantId: restaurant.id,
        date: today,
        viewCount: 1,
      },
      update: {
        viewCount: { increment: 1 },
      },
    });

    sendSuccess(res, {
      restaurant,
      categories,
      tableNumber: table,
    });
  } catch (error) {
    next(error);
  }
};

// Ürün detayı görüntüleme
export const getProductDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            restaurantId: true,
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, 'Ürün bulunamadı');
    }

    // Ürün görüntülenme analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        restaurantId_productId_date: {
          restaurantId: product.category.restaurantId,
          productId: product.id,
          date: today,
        },
      },
      create: {
        restaurantId: product.category.restaurantId,
        productId: product.id,
        date: today,
        viewCount: 1,
      },
      update: {
        viewCount: { increment: 1 },
      },
    });

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const checkSlugAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slugRaw = String(req.query.slug ?? '').trim();
    const excludeId = String(req.query.excludeId ?? '').trim();

    const normalized = slugifyTR(slugRaw);
    if (!normalized) {
      throw new ApiError(400, 'Geçersiz slug');
    }

    const existing = await prisma.restaurant.findFirst({
      where: {
        slug: normalized,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return sendSuccess(res, {
        slug: normalized,
        available: true,
      });
    }

    // Suggest a unique variant (slug-2, slug-3, ...) with a sane upper bound
    let suggestion: string | null = null;
    for (let i = 2; i <= 50; i++) {
      const candidate = `${normalized}-${i}`;
      // eslint-disable-next-line no-await-in-loop
      const hit = await prisma.restaurant.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!hit) {
        suggestion = candidate;
        break;
      }
    }

    return sendSuccess(res, {
      slug: normalized,
      available: false,
      suggestion,
    });
  } catch (error) {
    next(error);
  }
};
