import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as superAdminAnalyticsController from '../controllers/superadmin-analytics.controller';

const router = Router();

// All routes require SUPER_ADMIN role
router.use(authenticate, authorize('SUPER_ADMIN'));

// Analytics endpoints
router.get('/summary', superAdminAnalyticsController.getAnalyticsSummary);
router.get('/timeseries', superAdminAnalyticsController.getTimeSeries);
router.get('/restaurants', superAdminAnalyticsController.getRestaurantPerformance);
router.get('/top-products', superAdminAnalyticsController.getTopProducts);
router.get('/device-breakdown', superAdminAnalyticsController.getDeviceBreakdown);
router.get('/hourly', superAdminAnalyticsController.getHourlyActivity);
router.get('/export', superAdminAnalyticsController.exportAnalytics);

export default router;
