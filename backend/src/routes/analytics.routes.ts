import { Router } from 'express';
import {
  trackMenuView,
  trackProductView,
  getRestaurantOverview,
  getSuperAdminOverview,
  getDashboard,
  getAnalytics,
  getDashboardSummary,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public tracking endpoints (no auth required)
router.post('/menu-view', trackMenuView);
router.post('/product-view', trackProductView);

// Authenticated routes
router.use(authenticate);

// Optimized lightweight endpoint for post-login
router.get('/summary', authorize('RESTAURANT_ADMIN'), getDashboardSummary);

// Restaurant analytics (restaurant admin + super admin)
router.get('/restaurant/:restaurantId/overview', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), getRestaurantOverview);

// Super admin analytics
router.get('/superadmin/overview', authorize('SUPER_ADMIN'), getSuperAdminOverview);

// Legacy endpoints (backward compatibility)
router.get('/dashboard', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), getDashboard);
router.get('/', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), getAnalytics);

export default router;
