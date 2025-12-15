import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/menu.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { body } from 'express-validator';

const router = Router();

// Tüm rotalar authentication gerektirir
router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'RESTAURANT_ADMIN'));

// Kategoriler
router.get('/categories', getCategories);
router.post(
  '/categories',
  [body('name').notEmpty().withMessage('Kategori adı gerekli')],
  createCategory
);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/reorder', reorderCategories);

// Ürünler
router.get('/products', getProducts);
router.post(
  '/products',
  [
    body('name').notEmpty().withMessage('Ürün adı gerekli'),
    body('price').isFloat({ min: 0 }).withMessage('Geçerli bir fiyat girin'),
    body('categoryId').notEmpty().withMessage('Kategori ID gerekli'),
  ],
  createProduct
);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
