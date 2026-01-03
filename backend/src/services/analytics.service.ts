import { prisma } from '../config/prisma';
import { logger } from './logger.service';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os?: string;
  browser?: string;
}

export interface AnalyticsQuery {
  restaurantId: string;
  startDate?: Date;
  endDate?: Date;
  productId?: string;
}

export class AnalyticsService {
  /**
   * User agent'tan cihaz bilgisi çıkar
   */
  parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();
    
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      type = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      type = 'mobile';
    }

    return { type };
  }

  /**
   * Menü görüntüleme kaydı
   */
  async trackMenuView(
    restaurantId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.analytics.upsert({
        where: {
          restaurantId_date: {
            restaurantId,
            date: today,
          },
        },
        create: {
          restaurantId,
          date: today,
          viewCount: 1,
        },
        update: {
          viewCount: { increment: 1 },
        },
      });

      const deviceInfo = userAgent ? this.parseUserAgent(userAgent) : null;
      
      logger.info('Menü görüntüleme kaydedildi', {
        restaurantId,
        ipAddress,
        device: deviceInfo?.type,
      });
    } catch (error: any) {
      logger.error('Menü görüntüleme kaydı hatası', { error: error.message, restaurantId });
    }
  }

  /**
   * Ürün görüntüleme kaydı
   */
  async trackProductView(
    productId: string,
    restaurantId: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.analytics.upsert({
        where: {
          restaurantId_productId_date: {
            restaurantId,
            productId,
            date: today,
          },
        },
        create: {
          restaurantId,
          productId,
          date: today,
          viewCount: 1,
        },
        update: {
          viewCount: { increment: 1 },
        },
      });

      logger.debug('Ürün görüntüleme kaydedildi', { productId, restaurantId, ipAddress });
    } catch (error: any) {
      logger.error('Ürün görüntüleme kaydı hatası', { error: error.message, productId });
    }
  }

  /**
   * Dashboard istatistikleri
   */
  async getDashboardStats(restaurantId: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Toplam görüntülenme
      const totalViews = await prisma.analytics.aggregate({
        where: {
          restaurantId,
          date: { gte: thirtyDaysAgo },
        },
        _sum: { viewCount: true },
      });

      // Bugünkü görüntülenme
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayViews = await prisma.analytics.aggregate({
        where: {
          restaurantId,
          date: today,
        },
        _sum: { viewCount: true },
      });

      // Toplam kategoriler ve ürünler
      const categoryCount = await prisma.category.count({
        where: { restaurantId, isActive: true },
      });

      const productCount = await prisma.product.count({
        where: {
          category: { restaurantId },
          isAvailable: true,
        },
      });

      // QR kod istatistikleri
      const qrStats = await prisma.qRCode.aggregate({
        where: { restaurantId },
        _count: true,
        _sum: { scanCount: true },
      });

      // En popüler ürünler (son 30 gün)
      const popularProducts = await prisma.analytics.groupBy({
        by: ['productId'],
        where: {
          restaurantId,
          productId: { not: null },
          date: { gte: thirtyDaysAgo },
        },
        _sum: { viewCount: true },
        orderBy: { _sum: { viewCount: 'desc' } },
        take: 10,
      });

      // Ürün detaylarını al
      const productIds = popularProducts
        .map((p) => p.productId)
        .filter((id): id is string => id !== null);
      
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          image: true,
          price: true,
          category: {
            select: { name: true },
          },
        },
      });

      const popularProductsWithDetails = popularProducts.map((p) => {
        const product = products.find((pr) => pr.id === p.productId);
        return {
          ...product,
          viewCount: p._sum.viewCount,
        };
      });

      // Günlük görüntülenme grafik verisi (son 7 gün)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyViews = await prisma.analytics.groupBy({
        by: ['date'],
        where: {
          restaurantId,
          date: { gte: sevenDaysAgo },
        },
        _sum: { viewCount: true },
        orderBy: { date: 'asc' },
      });

      return {
        summary: {
          totalViews: totalViews._sum.viewCount || 0,
          todayViews: todayViews._sum.viewCount || 0,
          categoryCount,
          productCount,
          qrCodeCount: qrStats._count || 0,
          totalScans: qrStats._sum.scanCount || 0,
        },
        popularProducts: popularProductsWithDetails,
        dailyViews: dailyViews.map((d) => ({
          date: d.date.toISOString().split('T')[0],
          viewCount: d._sum.viewCount,
        })),
      };
    } catch (error: any) {
      logger.error('Dashboard istatistikleri hatası', { error: error.message, restaurantId });
      throw error;
    }
  }

  /**
   * Detaylı analytics raporu
   */
  async getDetailedAnalytics(query: AnalyticsQuery): Promise<any> {
    try {
      const { restaurantId, startDate, endDate, productId } = query;

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate || new Date();

      const where: any = {
        restaurantId,
        date: {
          gte: start,
          lte: end,
        },
      };

      if (productId) {
        where.productId = productId;
      }

      const analytics = await prisma.analytics.findMany({
        where,
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

      return analytics;
    } catch (error: any) {
      logger.error('Detaylı analytics hatası', { error: error.message, query });
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
