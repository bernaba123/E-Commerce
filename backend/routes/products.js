import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  addReview,
  getProductStats,
  getFeaturedProducts,
  updateProductStock,
  updateAllStockStatuses
} from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', optionalAuth, getProduct);

// Protected routes
router.post('/:id/reviews', protect, addReview);

// Admin only routes
router.post('/', protect, authorize('admin'), validateProduct, createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.put('/:id/stock', protect, authorize('admin'), updateProductStock);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.get('/admin/stats', protect, authorize('admin'), getProductStats);
router.post('/admin/update-stock-statuses', protect, authorize('admin'), updateAllStockStatuses);

export default router;