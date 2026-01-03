import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, ApiError } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

// ===== TRACKING ENDPOINTS =====

// Track menu view
export const trackMenuView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { restaurantId, tableId, currentPath, referrer } = req.body;
    
    if (!restaurantId) {
      throw new ApiError(400, 'Restaurant ID required');
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    
    // Detect device type
    const deviceType = detectDeviceType(userAgent);

    await prisma.menuView.create({
      data: {
        restaurantId,
        tableId,
        currentPath,
        referrer,
        userAgent,
        deviceType,
        ip,
      },
    });

    // Update daily stats
    await updateDailyStats(restaurantId, 'menu');

    sendSuccess(res, { tracked: true });
  } catch (error) {
    next(error);
  }
};

// Track product view
export const trackProductView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, restaurantId } = req.body;
    
    if (!productId || !restaurantId) {
      throw new ApiError(400, 'Product ID and Restaurant ID required');
    }

    await prisma.productView.create({
      data: {
        productId,
        restaurantId,
      },
    });

    // Update daily stats
    await updateDailyStats(restaurantId, 'product');

    sendSuccess(res, { tracked: true });
  } catch (error) {
    next(error);
  }
};

// ===== READING ENDPOINTS =====

// Get restaurant overview analytics
export const getRestaurantOverview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { restaurantId } = req.params;
    
    // Authorization check - RESTAURANT_ADMIN sadece kendi restoranının istatistiklerini görebilir
    if (req.user?.role === 'RESTAURANT_ADMIN') {
      if (req.user.restaurantId !== restaurantId) {
        throw new ApiError(403, 'Bu restoranın istatistiklerini görme yetkiniz yok');
      }
    } else if (req.user?.role !== 'SUPER_ADMIN') {
      // Diğer roller hiç erişemez
      throw new ApiError(403, 'Bu işlem için yetkiniz yok');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Today's views
    const todayViews = await prisma.menuView.count({
      where: { restaurantId, createdAt: { gte: today } },
    });

    // This week's views
    const weekViews = await prisma.menuView.count({
      where: { restaurantId, createdAt: { gte: weekAgo } },
    });

    // This month's views
    const monthViews = await prisma.menuView.count({
      where: { restaurantId, createdAt: { gte: monthAgo } },
    });

    // Top 5 products
    const topProducts = await prisma.productView.groupBy({
      by: ['productId'],
      where: {
        restaurantId,
        createdAt: { gte: monthAgo },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    });

    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, imageUrl: true, image: true, price: true },
    });

    const topProductsWithDetails = topProducts.map(tp => {
      const product = products.find(p => p.id === tp.productId);
      return {
        id: product?.id,
        name: product?.name,
        imageUrl: product?.imageUrl || product?.image,
        price: product?.price,
        viewCount: tp._count.productId,
      };
    });

    // Peak hours (0-23)
    const menuViews = await prisma.menuView.findMany({
      where: { restaurantId, createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    });

    const hourlyDistribution = Array(24).fill(0);
    menuViews.forEach(view => {
      const hour = view.createdAt.getHours();
      hourlyDistribution[hour]++;
    });

    // Last 7 days trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.menuView.count({
        where: {
          restaurantId,
          createdAt: { gte: date, lt: nextDate },
        },
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    // Last 30 days trend
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.menuView.count({
        where: {
          restaurantId,
          createdAt: { gte: date, lt: nextDate },
        },
      });

      last30Days.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    sendSuccess(res, {
      summary: {
        todayViews,
        weekViews,
        monthViews,
      },
      topProducts: topProductsWithDetails,
      hourlyDistribution: hourlyDistribution.map((count, hour) => ({ hour, count })),
      last7Days,
      last30Days,
    });
  } catch (error) {
    next(error);
  }
};

// Get super admin overview analytics
export const getSuperAdminOverview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Authorization check
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Super admin only');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total active restaurants
    const totalRestaurants = await prisma.restaurant.count({
      where: { isActive: true },
    });

    // Total views (all time)
    const totalViews = await prisma.menuView.count();

    // Total QR scans
    const totalScans = await prisma.qRCode.aggregate({
      _sum: { scanCount: true },
    });

    // Most active restaurants (last 7 days)
    const restaurantViews = await prisma.menuView.groupBy({
      by: ['restaurantId'],
      where: { createdAt: { gte: weekAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const restaurantIds = restaurantViews.map(rv => rv.restaurantId);
    const restaurants = await prisma.restaurant.findMany({
      where: { id: { in: restaurantIds } },
      select: { id: true, name: true, slug: true, logo: true },
    });

    const topRestaurants = restaurantViews.map(rv => {
      const restaurant = restaurants.find(r => r.id === rv.restaurantId);
      return {
        id: restaurant?.id,
        name: restaurant?.name,
        slug: restaurant?.slug,
        logo: restaurant?.logo,
        viewCount: rv._count.id,
      };
    });

    // Last 7 days trend (all restaurants)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.menuView.count({
        where: { createdAt: { gte: date, lt: nextDate } },
      });

      last7Days.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    sendSuccess(res, {
      summary: {
        totalRestaurants,
        totalViews,
        totalScans: totalScans._sum.scanCount || 0,
      },
      topRestaurants,
      last7Days,
    });
  } catch (error) {
    next(error);
  }
};

// ===== LEGACY ENDPOINTS (KEEP FOR BACKWARD COMPATIBILITY) =====

// Dashboard özet verileri
export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error('User ID required');
    }

    // Find restaurant owned by user
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    // Redirect to new endpoint
    req.params.restaurantId = restaurant.id;
    return getRestaurantOverview(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Detaylı analitik verileri (tarih aralığı ile)
export const getAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate } = req.query;

    if (!userId) {
      throw new Error('User ID required');
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const analytics = await prisma.analytics.findMany({
      where: {
        restaurantId: restaurant.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    sendSuccess(res, analytics);
  } catch (error) {
    next(error);
  }
};

// ===== HELPER FUNCTIONS =====

function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

async function updateDailyStats(restaurantId: string, type: 'menu' | 'product') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingStat = await prisma.restaurantStatDaily.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date: today,
      },
    },
  });

  if (existingStat) {
    await prisma.restaurantStatDaily.update({
      where: { id: existingStat.id },
      data: {
        totalViews: type === 'menu' ? { increment: 1 } : existingStat.totalViews,
        totalProductViews: type === 'product' ? { increment: 1 } : existingStat.totalProductViews,
      },
    });
  } else {
    await prisma.restaurantStatDaily.create({
      data: {
        restaurantId,
        date: today,
        totalViews: type === 'menu' ? 1 : 0,
        totalProductViews: type === 'product' ? 1 : 0,
        uniqueVisitors: 0,
      },
    });
  }
}

// ===== OPTIMIZED ENDPOINTS FOR LOGIN PERFORMANCE =====

/**
 * Lightweight dashboard summary - optimized for post-login loading
 * Returns basic stats without heavy queries
 */
export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new ApiError(401, 'User ID required');
    }

    // Find restaurant - use select to limit data
    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            qrCodes: true,
            categories: true,
          }
        }
      },
    });

    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found');
    }

    // Get items count separately
    const itemsCount = await prisma.product.count({
      where: { category: { restaurantId: restaurant.id } }
    });

    // Get basic counts only - no complex aggregations
    const summary = {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      counts: {
        qrCodes: restaurant._count.qrCodes,
        categories: restaurant._count.categories,
        products: itemsCount,
      },
      lastUpdated: new Date().toISOString(),
    };

    sendSuccess(res, summary, 'Dashboard summary loaded');
  } catch (error) {
    next(error);
  }
};
