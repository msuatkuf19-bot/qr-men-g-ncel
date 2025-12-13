import { Router } from 'express';
import { checkSlugAvailability, getPublicMenu, getProductDetail } from '../controllers/public.controller';

const router = Router();

// Public routes (authentication gerekmez)
router.get('/menu/:slug', getPublicMenu);
router.get('/product/:id', getProductDetail);
router.get('/slug-check', checkSlugAvailability);

export default router;
