import { Router } from 'express';
import {
  getAllRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurant,
  checkSlugAvailability,
  generateSlugFromName,
} from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// Tüm rotalar authentication gerektirir
router.use(authenticate);

// Slug utilities
router.get('/check-slug', authorize('SUPER_ADMIN'), checkSlugAvailability);
router.post('/generate-slug', authorize('SUPER_ADMIN'), generateSlugFromName);

// Süper Admin - Tüm restoranlar
router.get('/', authorize('SUPER_ADMIN'), getAllRestaurants);

// Restoran Admin - Kendi restoranı
router.get('/my-restaurant', authorize('RESTAURANT_ADMIN'), getMyRestaurant);

// Tek restoran detayı
router.get('/:id', getRestaurant);

// Yeni restoran oluştur (Süper Admin)
router.post(
  '/',
  authorize('SUPER_ADMIN'),
  [
    body('name').notEmpty().withMessage('Restoran adı gerekli'),
    body('ownerEmail').isEmail().withMessage('Geçerli bir email girin'),
    body('ownerName').notEmpty().withMessage('Sahip adı gerekli'),
    body('ownerPassword').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('membershipStartDate').notEmpty().withMessage('Üyelik başlangıç tarihi gerekli'),
    body('membershipEndDate').notEmpty().withMessage('Üyelik bitiş tarihi gerekli'),
  ],
  createRestaurant
);

// Restoran güncelle
router.put('/:id', authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'), updateRestaurant);

// Restoran sil (Süper Admin)
router.delete('/:id', authorize('SUPER_ADMIN'), deleteRestaurant);

export default router;
