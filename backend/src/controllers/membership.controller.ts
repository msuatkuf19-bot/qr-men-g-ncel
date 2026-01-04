import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, ApiError } from '../utils/response';
import { membershipService } from '../services/membership.service';

/**
 * Get active memberships
 * GET /api/admin/memberships/active
 */
export const getActiveMemberships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, plan, search, dateFrom, dateTo } = req.query;

    const filters: any = {};
    if (plan) filters.plan = plan as string;
    if (search) filters.search = search as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);

    const result = await membershipService.getActiveMemberships(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      filters
    );

    sendSuccess(res, result, 'Active memberships retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get passive memberships
 * GET /api/admin/memberships/passive
 */
export const getPassiveMemberships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, search, dateFrom, dateTo, passiveReason } = req.query;

    const filters: any = {};
    if (search) filters.search = search as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (passiveReason) filters.passiveReason = passiveReason as string;

    const result = await membershipService.getPassiveMemberships(
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      filters
    );

    sendSuccess(res, result, 'Passive memberships retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get active membership stats
 * GET /api/admin/memberships/stats/active
 */
export const getActiveStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await membershipService.getActiveStats();
    sendSuccess(res, stats, 'Active stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get passive membership stats
 * GET /api/admin/memberships/stats/passive
 */
export const getPassiveStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await membershipService.getPassiveStats();
    sendSuccess(res, stats, 'Passive stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Activate membership
 * PATCH /api/admin/memberships/:id/activate
 */
export const activateMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await membershipService.activateMembership(id);
    sendSuccess(res, null, 'Membership activated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate membership
 * PATCH /api/admin/memberships/:id/deactivate
 */
export const deactivateMembership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await membershipService.deactivateMembership(id, reason || 'MANUAL');
    sendSuccess(res, null, 'Membership deactivated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Export memberships to CSV
 * GET /api/admin/memberships/export
 */
export const exportMemberships = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, plan, search, dateFrom, dateTo, passiveReason } = req.query;

    if (!status || (status !== 'ACTIVE' && status !== 'PASSIVE')) {
      throw new ApiError(400, 'Invalid status parameter');
    }

    const filters: any = {};
    if (plan) filters.plan = plan as string;
    if (search) filters.search = search as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (passiveReason) filters.passiveReason = passiveReason as string;

    const csvContent = await membershipService.exportToCSV(status as 'ACTIVE' | 'PASSIVE', filters);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=memberships-${status.toLowerCase()}-${Date.now()}.csv`);
    res.send('\uFEFF' + csvContent); // UTF-8 BOM for Excel
  } catch (error) {
    next(error);
  }
};
