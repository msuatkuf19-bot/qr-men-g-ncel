import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as membershipController from '../controllers/membership.controller';

const router = Router();

// All routes require SUPER_ADMIN role
router.use(authenticate, authorize('SUPER_ADMIN'));

// Membership endpoints
router.get('/active', membershipController.getActiveMemberships);
router.get('/passive', membershipController.getPassiveMemberships);
router.get('/stats/active', membershipController.getActiveStats);
router.get('/stats/passive', membershipController.getPassiveStats);
router.patch('/:id/activate', membershipController.activateMembership);
router.patch('/:id/deactivate', membershipController.deactivateMembership);
router.get('/export', membershipController.exportMemberships);

export default router;
