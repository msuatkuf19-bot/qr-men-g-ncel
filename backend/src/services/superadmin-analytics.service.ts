import prisma from '../config/prisma';
import { logger } from './logger.service';

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  qrScans: number;
  menuViews: number;
  productViews: number;
  contactClicks: number;
  avgSessionDuration: number;
  bounceRate: number;
  previousPeriod: {
    totalVisits: number;
    uniqueVisitors: number;
    qrScans: number;
  };
  change: {
    totalVisits: number;
    uniqueVisitors: number;
    qrScans: number;
  };
}

export interface TimeSeriesDataPoint {
  date: string;
  totalVisits: number;
  qrScans: number;
  menuViews: number;
  productViews: number;
}

export interface RestaurantPerformance {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  totalVisits: number;
  qrScans: number;
  uniqueVisitors: number;
  productViews: number;
  contactClicks: number;
  lastActivity: Date | null;
  isActive: boolean;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  categoryName: string;
  restaurantName: string;
  viewCount: number;
}

export class SuperAdminAnalyticsService {
  /**
   * Get global analytics summary (KPIs)
   */
  async getSummary(
    from: Date,
    to: Date,
    restaurantId?: string,
    deviceType?: string,
    source?: string
  ): Promise<AnalyticsSummary> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      if (deviceType && deviceType !== 'ALL') {
        where.deviceType = deviceType;
      }

      if (source && source !== 'ALL') {
        where.source = source;
      }

      // Current period metrics
      const [events, sessions] = await Promise.all([
        prisma.analyticsEvent.findMany({ where }),
        this.getUniqueSessions(from, to, restaurantId),
      ]);

      const totalVisits = events.length;
      const uniqueVisitors = new Set(
        events.map((e) => e.visitorId || e.sessionId).filter(Boolean)
      ).size;
      const qrScans = events.filter((e) => e.eventType === 'QR_SCAN').length;
      const menuViews = events.filter((e) => e.eventType === 'MENU_VIEW').length;
      const productViews = events.filter((e) => e.eventType === 'PRODUCT_VIEW').length;
      const contactClicks = events.filter((e) => e.eventType === 'CONTACT_CLICK').length;

      // Calculate session metrics
      const { avgSessionDuration, bounceRate } = await this.calculateSessionMetrics(
        from,
        to,
        restaurantId
      );

      // Previous period comparison
      const periodDiff = to.getTime() - from.getTime();
      const prevFrom = new Date(from.getTime() - periodDiff);
      const prevTo = new Date(from.getTime());

      const prevWhere = { ...where, createdAt: { gte: prevFrom, lte: prevTo } };
      const prevEvents = await prisma.analyticsEvent.findMany({ where: prevWhere });

      const prevTotalVisits = prevEvents.length;
      const prevUniqueVisitors = new Set(
        prevEvents.map((e) => e.visitorId || e.sessionId).filter(Boolean)
      ).size;
      const prevQrScans = prevEvents.filter((e) => e.eventType === 'QR_SCAN').length;

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        totalVisits,
        uniqueVisitors,
        qrScans,
        menuViews,
        productViews,
        contactClicks,
        avgSessionDuration,
        bounceRate,
        previousPeriod: {
          totalVisits: prevTotalVisits,
          uniqueVisitors: prevUniqueVisitors,
          qrScans: prevQrScans,
        },
        change: {
          totalVisits: calculateChange(totalVisits, prevTotalVisits),
          uniqueVisitors: calculateChange(uniqueVisitors, prevUniqueVisitors),
          qrScans: calculateChange(qrScans, prevQrScans),
        },
      };
    } catch (error: any) {
      logger.error('Error getting analytics summary:', error);
      throw new Error('Failed to get analytics summary');
    }
  }

  /**
   * Get time series data
   */
  async getTimeSeries(
    from: Date,
    to: Date,
    granularity: 'day' | 'hour' = 'day',
    restaurantId?: string
  ): Promise<TimeSeriesDataPoint[]> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const events = await prisma.analyticsEvent.findMany({ where });

      const dataMap = new Map<string, TimeSeriesDataPoint>();

      events.forEach((event) => {
        const dateKey =
          granularity === 'day'
            ? event.createdAt.toISOString().split('T')[0]
            : `${event.createdAt.toISOString().split('T')[0]}T${event.createdAt.getHours()}:00`;

        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, {
            date: dateKey,
            totalVisits: 0,
            qrScans: 0,
            menuViews: 0,
            productViews: 0,
          });
        }

        const dataPoint = dataMap.get(dateKey)!;
        dataPoint.totalVisits++;

        if (event.eventType === 'QR_SCAN') dataPoint.qrScans++;
        if (event.eventType === 'MENU_VIEW') dataPoint.menuViews++;
        if (event.eventType === 'PRODUCT_VIEW') dataPoint.productViews++;
      });

      return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error: any) {
      logger.error('Error getting time series:', error);
      throw new Error('Failed to get time series');
    }
  }

  /**
   * Get restaurant performance table
   */
  async getRestaurantPerformance(
    from: Date,
    to: Date,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'totalVisits',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ restaurants: RestaurantPerformance[]; total: number }> {
    try {
      const restaurants = await prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      });

      const performancePromises = restaurants.map(async (restaurant) => {
        const events = await prisma.analyticsEvent.findMany({
          where: {
            restaurantId: restaurant.id,
            createdAt: { gte: from, lte: to },
          },
        });

        const totalVisits = events.length;
        const qrScans = events.filter((e) => e.eventType === 'QR_SCAN').length;
        const uniqueVisitors = new Set(
          events.map((e) => e.visitorId || e.sessionId).filter(Boolean)
        ).size;
        const productViews = events.filter((e) => e.eventType === 'PRODUCT_VIEW').length;
        const contactClicks = events.filter((e) => e.eventType === 'CONTACT_CLICK').length;
        
        const lastEvent = events.length > 0 
          ? events.reduce((latest, e) => e.createdAt > latest ? e.createdAt : latest, events[0].createdAt)
          : null;

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantSlug: restaurant.slug,
          totalVisits,
          qrScans,
          uniqueVisitors,
          productViews,
          contactClicks,
          lastActivity: lastEvent,
          isActive: restaurant.isActive,
        };
      });

      let performance = await Promise.all(performancePromises);

      // Sort
      performance.sort((a, b) => {
        const aVal = a[sortBy as keyof RestaurantPerformance] as number;
        const bVal = b[sortBy as keyof RestaurantPerformance] as number;
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      });

      const total = performance.length;
      const paginatedRestaurants = performance.slice((page - 1) * limit, page * limit);

      return { restaurants: paginatedRestaurants, total };
    } catch (error: any) {
      logger.error('Error getting restaurant performance:', error);
      throw new Error('Failed to get restaurant performance');
    }
  }

  /**
   * Get device breakdown
   */
  async getDeviceBreakdown(
    from: Date,
    to: Date,
    restaurantId?: string
  ): Promise<DeviceBreakdown> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const events = await prisma.analyticsEvent.findMany({
        where,
        select: { deviceType: true },
      });

      const breakdown: DeviceBreakdown = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      };

      events.forEach((event) => {
        if (event.deviceType === 'MOBILE') breakdown.mobile++;
        else if (event.deviceType === 'DESKTOP') breakdown.desktop++;
        else if (event.deviceType === 'TABLET') breakdown.tablet++;
      });

      return breakdown;
    } catch (error: any) {
      logger.error('Error getting device breakdown:', error);
      throw new Error('Failed to get device breakdown');
    }
  }

  /**
   * Get hourly activity
   */
  async getHourlyActivity(from: Date, to: Date, restaurantId?: string): Promise<HourlyActivity[]> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const events = await prisma.analyticsEvent.findMany({ where });

      const hourlyMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        hourlyMap.set(i, 0);
      }

      events.forEach((event) => {
        const hour = event.createdAt.getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      return Array.from(hourlyMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);
    } catch (error: any) {
      logger.error('Error getting hourly activity:', error);
      throw new Error('Failed to get hourly activity');
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(
    from: Date,
    to: Date,
    limit: number = 10,
    restaurantId?: string
  ): Promise<TopProduct[]> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
        eventType: 'PRODUCT_VIEW',
        productId: { not: null },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const events = await prisma.analyticsEvent.findMany({ where });

      const productViewCounts = new Map<string, number>();
      events.forEach((event) => {
        if (event.productId) {
          productViewCounts.set(event.productId, (productViewCounts.get(event.productId) || 0) + 1);
        }
      });

      const topProductIds = Array.from(productViewCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([productId]) => productId);

      const products = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        include: {
          category: { select: { name: true, restaurant: { select: { name: true } } } },
        },
      });

      return products.map((product) => ({
        productId: product.id,
        productName: product.name,
        categoryName: product.category.name,
        restaurantName: product.category.restaurant.name,
        viewCount: productViewCounts.get(product.id) || 0,
      }));
    } catch (error: any) {
      logger.error('Error getting top products:', error);
      throw new Error('Failed to get top products');
    }
  }

  /**
   * Export analytics to CSV
   */
  async exportToCSV(
    from: Date,
    to: Date,
    restaurantId?: string,
    deviceType?: string,
    source?: string
  ): Promise<string> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) where.restaurantId = restaurantId;
      if (deviceType && deviceType !== 'ALL') where.deviceType = deviceType;
      if (source && source !== 'ALL') where.source = source;

      const events = await prisma.analyticsEvent.findMany({
        where,
        include: {
          restaurant: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const headers = [
        'Date',
        'Restaurant',
        'Event Type',
        'Device Type',
        'Source',
        'Session ID',
        'Visitor ID',
        'Table No',
        'Page Path',
      ];

      const rows = events.map((event) => [
        event.createdAt.toISOString(),
        event.restaurant.name,
        event.eventType,
        event.deviceType,
        event.source || '',
        event.sessionId || '',
        event.visitorId || '',
        event.tableNo || '',
        event.pagePath || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error: any) {
      logger.error('Error exporting analytics:', error);
      throw new Error('Failed to export analytics');
    }
  }

  /**
   * Helper: Get unique sessions
   */
  private async getUniqueSessions(
    from: Date,
    to: Date,
    restaurantId?: string
  ): Promise<string[]> {
    const where: any = {
      createdAt: { gte: from, lte: to },
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    const events = await prisma.analyticsEvent.findMany({
      where,
      select: { sessionId: true },
    });

    return Array.from(new Set(events.map((e) => e.sessionId).filter(Boolean) as string[]));
  }

  /**
   * Helper: Calculate session metrics
   */
  private async calculateSessionMetrics(
    from: Date,
    to: Date,
    restaurantId?: string
  ): Promise<{ avgSessionDuration: number; bounceRate: number }> {
    try {
      const where: any = {
        createdAt: { gte: from, lte: to },
      };

      if (restaurantId) {
        where.restaurantId = restaurantId;
      }

      const events = await prisma.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'asc' },
      });

      const sessionMap = new Map<string, Date[]>();
      events.forEach((event) => {
        const sessionId = event.sessionId || event.visitorId || 'unknown';
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, []);
        }
        sessionMap.get(sessionId)!.push(event.createdAt);
      });

      let totalDuration = 0;
      let bouncedSessions = 0;
      let validSessions = 0;

      sessionMap.forEach((timestamps) => {
        if (timestamps.length === 1) {
          bouncedSessions++;
        } else {
          const duration =
            timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime();
          totalDuration += duration;
          validSessions++;
        }
      });

      const avgSessionDuration = validSessions > 0 ? totalDuration / validSessions / 1000 : 0;
      const bounceRate = sessionMap.size > 0 ? (bouncedSessions / sessionMap.size) * 100 : 0;

      return { avgSessionDuration, bounceRate };
    } catch (error: any) {
      logger.error('Error calculating session metrics:', error);
      return { avgSessionDuration: 0, bounceRate: 0 };
    }
  }
}

export const superAdminAnalyticsService = new SuperAdminAnalyticsService();
