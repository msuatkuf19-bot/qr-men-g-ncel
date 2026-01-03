import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, ApiError } from '../utils/response';
import { superAdminAnalyticsService } from '../services/superadmin-analytics.service';

/**
 * Get analytics summary (KPIs)
 * GET /api/superadmin/analytics/summary
 */
export const getAnalyticsSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, restaurantId, device, source } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const summary = await superAdminAnalyticsService.getSummary(
      fromDate,
      toDate,
      restaurantId as string,
      device as string,
      source as string
    );

    sendSuccess(res, summary, 'Analytics summary retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get time series data
 * GET /api/superadmin/analytics/timeseries
 */
export const getTimeSeries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, granularity, restaurantId } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const timeseries = await superAdminAnalyticsService.getTimeSeries(
      fromDate,
      toDate,
      (granularity as 'day' | 'hour') || 'day',
      restaurantId as string
    );

    sendSuccess(res, timeseries, 'Time series data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get restaurant performance table
 * GET /api/superadmin/analytics/restaurants
 */
export const getRestaurantPerformance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, page, limit, sort, order, device, source } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const result = await superAdminAnalyticsService.getRestaurantPerformance(
      fromDate,
      toDate,
      parseInt(page as string) || 1,
      parseInt(limit as string) || 10,
      (sort as string) || 'totalVisits',
      (order as 'asc' | 'desc') || 'desc'
    );

    sendSuccess(res, result, 'Restaurant performance retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get top products
 * GET /api/superadmin/analytics/top-products
 */
export const getTopProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, limit, restaurantId } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const products = await superAdminAnalyticsService.getTopProducts(
      fromDate,
      toDate,
      parseInt(limit as string) || 10,
      restaurantId as string
    );

    sendSuccess(res, products, 'Top products retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get device breakdown
 * GET /api/superadmin/analytics/device-breakdown
 */
export const getDeviceBreakdown = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, restaurantId } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const breakdown = await superAdminAnalyticsService.getDeviceBreakdown(
      fromDate,
      toDate,
      restaurantId as string
    );

    sendSuccess(res, breakdown, 'Device breakdown retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get hourly activity
 * GET /api/superadmin/analytics/hourly
 */
export const getHourlyActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, restaurantId } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const hourly = await superAdminAnalyticsService.getHourlyActivity(
      fromDate,
      toDate,
      restaurantId as string
    );

    sendSuccess(res, hourly, 'Hourly activity retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Export analytics to CSV
 * GET /api/superadmin/analytics/export
 */
export const exportAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { from, to, restaurantId, device, source } = req.query;

    if (!from || !to) {
      throw new ApiError(400, 'from and to dates are required');
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    const csvContent = await superAdminAnalyticsService.exportToCSV(
      fromDate,
      toDate,
      restaurantId as string,
      device as string,
      source as string
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
