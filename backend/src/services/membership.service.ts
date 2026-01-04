import prisma from '../config/prisma';
import { logger } from './logger.service';

export interface MembershipFilters {
  status?: 'ACTIVE' | 'PASSIVE' | 'TRIAL' | 'EXPIRED';
  plan?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  passiveReason?: string;
}

export interface MembershipListItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: string;
  startDate: Date;
  endDate: Date | null;
  passiveDate: Date | null;
  passiveReason: string | null;
  lastActivity: Date | null;
  createdAt: Date;
}

export interface MembershipStats {
  totalActive: number;
  startedToday: number;
  expiringIn7Days: number;
  mostUsedPlan: string;
  totalPassive: number;
  passiveLast30Days: number;
  reactivatable: number;
  fromDemo: number;
}

export class MembershipService {
  /**
   * Get active memberships
   */
  async getActiveMemberships(
    page: number = 1,
    limit: number = 10,
    filters: MembershipFilters = {}
  ): Promise<{ memberships: MembershipListItem[]; total: number }> {
    try {
      const where: any = {
        status: 'ACTIVE',
      };

      if (filters.plan) {
        where.plan = filters.plan;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.startDate = {};
        if (filters.dateFrom) where.startDate.gte = filters.dateFrom;
        if (filters.dateTo) where.startDate.lte = filters.dateTo;
      }

      const searchWhere = filters.search
        ? {
            restaurant: {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { owner: { name: { contains: filters.search, mode: 'insensitive' } } },
                { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
              ],
            },
          }
        : {};

      const [memberships, total] = await Promise.all([
        prisma.membership.findMany({
          where: { ...where, ...searchWhere },
          include: {
            restaurant: {
              include: {
                owner: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: { endDate: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.membership.count({ where: { ...where, ...searchWhere } }),
      ]);

      const items: MembershipListItem[] = memberships.map((m) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        restaurantName: m.restaurant.name,
        restaurantSlug: m.restaurant.slug,
        ownerName: m.restaurant.owner.name,
        ownerEmail: m.restaurant.owner.email,
        plan: m.plan,
        status: m.status,
        startDate: m.startDate,
        endDate: m.endDate,
        passiveDate: m.passiveDate,
        passiveReason: m.passiveReason,
        lastActivity: m.lastActivity,
        createdAt: m.createdAt,
      }));

      return { memberships: items, total };
    } catch (error: any) {
      logger.error('Error getting active memberships:', error);
      throw new Error('Failed to get active memberships');
    }
  }

  /**
   * Get passive memberships
   */
  async getPassiveMemberships(
    page: number = 1,
    limit: number = 10,
    filters: MembershipFilters = {}
  ): Promise<{ memberships: MembershipListItem[]; total: number }> {
    try {
      const where: any = {
        status: 'PASSIVE',
      };

      if (filters.passiveReason) {
        where.passiveReason = filters.passiveReason;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.passiveDate = {};
        if (filters.dateFrom) where.passiveDate.gte = filters.dateFrom;
        if (filters.dateTo) where.passiveDate.lte = filters.dateTo;
      }

      const searchWhere = filters.search
        ? {
            restaurant: {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { owner: { name: { contains: filters.search, mode: 'insensitive' } } },
                { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
              ],
            },
          }
        : {};

      const [memberships, total] = await Promise.all([
        prisma.membership.findMany({
          where: { ...where, ...searchWhere },
          include: {
            restaurant: {
              include: {
                owner: {
                  select: { name: true, email: true },
                },
              },
            },
          },
          orderBy: { passiveDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.membership.count({ where: { ...where, ...searchWhere } }),
      ]);

      const items: MembershipListItem[] = memberships.map((m) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        restaurantName: m.restaurant.name,
        restaurantSlug: m.restaurant.slug,
        ownerName: m.restaurant.owner.name,
        ownerEmail: m.restaurant.owner.email,
        plan: m.plan,
        status: m.status,
        startDate: m.startDate,
        endDate: m.endDate,
        passiveDate: m.passiveDate,
        passiveReason: m.passiveReason,
        lastActivity: m.lastActivity,
        createdAt: m.createdAt,
      }));

      return { memberships: items, total };
    } catch (error: any) {
      logger.error('Error getting passive memberships:', error);
      throw new Error('Failed to get passive memberships');
    }
  }

  /**
   * Get active membership stats
   */
  async getActiveStats(): Promise<Partial<MembershipStats>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      const [totalActive, startedToday, expiringIn7Days, planCounts] = await Promise.all([
        prisma.membership.count({ where: { status: 'ACTIVE' } }),
        prisma.membership.count({
          where: {
            status: 'ACTIVE',
            startDate: { gte: today, lt: tomorrow },
          },
        }),
        prisma.membership.count({
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date(), lte: in7Days },
          },
        }),
        prisma.membership.groupBy({
          by: ['plan'],
          where: { status: 'ACTIVE' },
          _count: true,
        }),
      ]);

      const mostUsedPlan =
        planCounts.length > 0
          ? planCounts.reduce((prev, current) =>
              prev._count > current._count ? prev : current
            ).plan
          : 'N/A';

      return {
        totalActive,
        startedToday,
        expiringIn7Days,
        mostUsedPlan,
      };
    } catch (error: any) {
      logger.error('Error getting active stats:', error);
      throw new Error('Failed to get active stats');
    }
  }

  /**
   * Get passive membership stats
   */
  async getPassiveStats(): Promise<Partial<MembershipStats>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalPassive, passiveLast30Days, reactivatable, fromDemo] = await Promise.all([
        prisma.membership.count({ where: { status: 'PASSIVE' } }),
        prisma.membership.count({
          where: {
            status: 'PASSIVE',
            passiveDate: { gte: thirtyDaysAgo },
          },
        }),
        prisma.membership.count({
          where: {
            status: 'PASSIVE',
            passiveReason: 'MANUAL',
          },
        }),
        prisma.membership.count({
          where: {
            status: 'PASSIVE',
            passiveReason: 'DEMO_ENDED',
          },
        }),
      ]);

      return {
        totalPassive,
        passiveLast30Days,
        reactivatable,
        fromDemo,
      };
    } catch (error: any) {
      logger.error('Error getting passive stats:', error);
      throw new Error('Failed to get passive stats');
    }
  }

  /**
   * Activate membership
   */
  async activateMembership(id: string): Promise<void> {
    try {
      await prisma.membership.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          passiveDate: null,
          passiveReason: null,
        },
      });
      logger.info(`Membership ${id} activated`);
    } catch (error: any) {
      logger.error('Error activating membership:', error);
      throw new Error('Failed to activate membership');
    }
  }

  /**
   * Deactivate membership
   */
  async deactivateMembership(id: string, reason: string = 'MANUAL'): Promise<void> {
    try {
      await prisma.membership.update({
        where: { id },
        data: {
          status: 'PASSIVE',
          passiveDate: new Date(),
          passiveReason: reason as any,
        },
      });
      logger.info(`Membership ${id} deactivated with reason: ${reason}`);
    } catch (error: any) {
      logger.error('Error deactivating membership:', error);
      throw new Error('Failed to deactivate membership');
    }
  }

  /**
   * Export memberships to CSV
   */
  async exportToCSV(status: 'ACTIVE' | 'PASSIVE', filters: MembershipFilters = {}): Promise<string> {
    try {
      const { memberships } = await (status === 'ACTIVE'
        ? this.getActiveMemberships(1, 10000, filters)
        : this.getPassiveMemberships(1, 10000, filters));

      const headers = [
        'Restoran Adı',
        'Yetkili',
        'Email',
        'Plan',
        'Durum',
        'Başlangıç',
        'Bitiş',
        'Pasif Tarihi',
        'Pasiflik Nedeni',
        'Son Aktivite',
      ];

      const rows = memberships.map((m) => [
        m.restaurantName,
        m.ownerName,
        m.ownerEmail,
        m.plan,
        m.status,
        m.startDate.toISOString().split('T')[0],
        m.endDate ? m.endDate.toISOString().split('T')[0] : '-',
        m.passiveDate ? m.passiveDate.toISOString().split('T')[0] : '-',
        m.passiveReason || '-',
        m.lastActivity ? m.lastActivity.toISOString().split('T')[0] : '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error: any) {
      logger.error('Error exporting memberships:', error);
      throw new Error('Failed to export memberships');
    }
  }
}

export const membershipService = new MembershipService();
