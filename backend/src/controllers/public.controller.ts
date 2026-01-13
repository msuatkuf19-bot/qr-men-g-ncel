import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiError, sendSuccess } from '../utils/response';
import { slugifyTR } from '../utils/slugify';

/**
 * Timing log helper - Request süresini ölçer
 */
interface TimingLog {
  t0_requestReceived: number;
  t1_dbConnectStart?: number;
  t1_dbConnectEnd?: number;
  t2_queryStart?: number;
  t2_queryEnd?: number;
  t3_responseSent?: number;
  breakdown: {
    dbConnect?: number;
    restaurantQuery?: number;
    categoriesQuery?: number;
    analyticsUpsert?: number;
    totalResponse?: number;
  };
}

function createTimingLog(): TimingLog {
  return {
    t0_requestReceived: Date.now(),
    breakdown: {}
  };
}

function logTiming(timing: TimingLog, slug: string): void {
  const total = timing.t3_responseSent! - timing.t0_requestReceived;
  const deltaConnect = timing.breakdown.dbConnect || 0;
  const deltaQuery = (timing.breakdown.restaurantQuery || 0) + (timing.breakdown.categoriesQuery || 0);
  
  console.log(`[QR-PERF] slug=${slug} t0=${timing.t0_requestReceived}, t1=${timing.t1_dbConnectEnd || 0}, t2=${timing.t2_queryEnd || 0}, t3=${timing.t3_responseSent!}, deltaConnect=${deltaConnect}ms, deltaQuery=${deltaQuery}ms, deltaTotal=${total}ms`);
  
  // Detaylı breakdown
  console.log(`[QR-PERF] BREAKDOWN: db_connect=${deltaConnect}ms, restaurant_query=${timing.breakdown.restaurantQuery || 0}ms, categories_query=${timing.breakdown.categoriesQuery || 0}ms, analytics=${timing.breakdown.analyticsUpsert || 0}ms`);
  
  // Yavaş istekleri işaretle
  if (total > 3000) {
    console.error(`[QR-PERF][CRITICAL] QR menu took ${total}ms - VERY SLOW for slug=${slug}`);
  } else if (total > 1000) {
    console.warn(`[QR-PERF][SLOW] QR menu took ${total}ms for slug=${slug}`);
  } else if (total > 500) {
    console.info(`[QR-PERF][MEDIUM] QR menu took ${total}ms for slug=${slug}`);
  } else {
    console.log(`[QR-PERF][FAST] QR menu took ${total}ms for slug=${slug}`);
  }
  
  // Hangi adımın yavaş olduğunu tespit et
  if (deltaConnect > 500) {
    console.warn(`[QR-PERF][DIAGNOSIS] DB CONNECTION is slow: ${deltaConnect}ms`);
  }
  if (deltaQuery > 2000) {
    console.warn(`[QR-PERF][DIAGNOSIS] QUERIES are slow: ${deltaQuery}ms`);
  }
}

// Müşteri menü görüntüleme - Optimize edilmiş
export const getPublicMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timing = createTimingLog();
  
  try {
    const { slug } = req.params;
    const { table, lazy, categoryId, limit } = req.query;
    
    // Lazy load modu: Sadece belirli kategori ürünlerini getir
    const isLazyLoad = lazy === 'true' && categoryId;
    
    // === T1: DB Bağlantı Kontrolü ===
    timing.t1_dbConnectStart = Date.now();
    // Database connection established automatically
    timing.t1_dbConnectEnd = Date.now();
    timing.breakdown.dbConnect = timing.t1_dbConnectEnd - timing.t1_dbConnectStart;

    // === T2: Query Başlangıcı ===
    timing.t2_queryStart = Date.now();

    // Restoran kontrolü
    const restaurantQueryStart = Date.now();
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
        membershipStatus: true,
        membershipEndDate: true,
        membershipStartDate: true,
      },
    });
    timing.breakdown.restaurantQuery = Date.now() - restaurantQueryStart;

    if (!restaurant) {
      throw new ApiError(404, 'Restoran bulunamadı');
    }

    // Membership kontrolü - Üyelik durumunu ve tarihini kontrol et
    const now = new Date();
    const membershipExpired = restaurant.membershipEndDate && now > restaurant.membershipEndDate;
    const membershipNotStarted = restaurant.membershipStartDate && now < restaurant.membershipStartDate;
    
    if (membershipExpired || membershipNotStarted || restaurant.membershipStatus === 'EXPIRED' || restaurant.membershipStatus === 'SUSPENDED') {
      // Üyelik süresi dolmuş veya askıya alınmış
      timing.t2_queryEnd = Date.now();
      timing.t3_responseSent = Date.now();
      logTiming(timing, slug);
      
      return res.status(403).json({
        success: false,
        error: 'MEMBERSHIP_EXPIRED',
        message: 'Bu restoranın üyelik süresi dolmuş',
        data: {
          restaurantName: restaurant.name,
          membershipStatus: restaurant.membershipStatus,
          membershipEndDate: restaurant.membershipEndDate,
          expired: membershipExpired,
          notStarted: membershipNotStarted,
        },
      });
    }

    let categoriesWithImages: any[];
    
    // Lazy load modu: Sadece belirli kategori ürünlerini getir - OPTIMIZED
    if (isLazyLoad) {
      const categoryQueryStart = Date.now();
      
      // Kategori varlığını ve restoran ilişkisini kontrol et
      const categoryExists = await prisma.category.findFirst({
        where: {
          id: categoryId as string,
          restaurantId: restaurant.id,
          isActive: true,
        },
        select: { id: true, name: true }
      });
      
      if (!categoryExists) {
        throw new ApiError(404, 'Kategori bulunamadı');
      }
      
      // Sadece o kategorinin ürünlerini getir
      const products = await prisma.product.findMany({
        where: {
          categoryId: categoryId as string,
          isAvailable: true,
        },
        orderBy: { order: 'asc' },
        take: limit ? parseInt(limit as string) : 50, // Varsayılan limit 50
      });
      
      timing.breakdown.categoriesQuery = Date.now() - categoryQueryStart;
      
      // Cache-Control header - lazy load için daha uzun cache
      res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=900');
      res.setHeader('X-Cache-Type', 'lazy-load');
      
      timing.t2_queryEnd = Date.now();
      timing.t3_responseSent = Date.now();
      logTiming(timing, slug);
      
      return sendSuccess(res, {
        products: products.map(product => ({
          ...product,
          imageUrl: product.image || null,
        })),
        categoryId,
        categoryName: categoryExists.name,
        _meta: {
          isLazyLoad: true,
          productCount: products.length,
          hasMore: limit ? products.length === parseInt(limit as string) : false,
        },
      });
    }

    // Normal mod: Optimize edilmiş ilk yükleme
    const categoriesQueryStart = Date.now();
    
    // İlk yükleme optimizasyonu - lite mod desteği
    const isLiteMode = req.query.lite === 'true';
    const limitPerCategory = isLiteMode ? 3 : undefined; // Lite modda kategori başına sadece 3 ürün
    
    // Kategorileri ve ürünleri getir
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
          // Lite modda sadece ilk birkaç ürün
          ...(limitPerCategory ? { take: limitPerCategory } : {}),
        },
      },
      orderBy: { order: 'asc' },
    });
    timing.breakdown.categoriesQuery = Date.now() - categoriesQueryStart;

    // Ürün resimlerini düzenle - imageUrl ekle
    categoriesWithImages = categories.map(category => ({
      ...category,
      products: category.products.map(product => {
        let imageUrl = product.image;
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = imageUrl;
        }
        return {
          ...product,
          imageUrl: imageUrl || null,
        };
      }),
    }));

    timing.t2_queryEnd = Date.now();

    // Analytics kaydı - async olarak, response'u bekletmeden
    const analyticsStart = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Analytics'i fire-and-forget olarak yap (response'u yavaşlatmasın)
    prisma.analytics.upsert({
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
    }).catch((err: Error) => {
      console.error('[ANALYTICS] Upsert hatası:', err.message);
    });
    timing.breakdown.analyticsUpsert = Date.now() - analyticsStart;

    // Cache-Control header - Lite mod için farklı cache stratejisi
    if (isLiteMode) {
      // Lite mod: Daha uzun cache (değişim daha az)
      res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
      res.setHeader('X-Cache-Type', 'lite-mode');
    } else {
      // Normal mod: Orta cache
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      res.setHeader('X-Cache-Type', 'full-mode');
    }
    
    timing.t3_responseSent = Date.now();
    logTiming(timing, slug);

    sendSuccess(res, {
      restaurant,
      categories: categoriesWithImages,
      tableNumber: table,
      // Lite mod ve lazy load desteği bilgisi
      _meta: {
        isLiteMode,
        supportsLazyLoad: true,
        lazyLoadEndpoint: `/api/public/menu/${slug}?lazy=true&categoryId={categoryId}`,
        fullLoadEndpoint: isLiteMode ? `/api/public/menu/${slug}` : undefined,
        categoryCount: categories.length,
        totalProductsShown: categoriesWithImages.reduce((sum, cat) => sum + cat.products.length, 0),
      },
    });
  } catch (error) {
    timing.t3_responseSent = Date.now();
    if (req.params.slug) {
      logTiming(timing, req.params.slug);
    }
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
