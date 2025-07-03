import express from 'express';
import { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrderStatus,
  getUserOrders,
  getOrderStats,
  updateTracking,
  trackOrderByNumber
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

// Public route for order tracking
router.post('/track', trackOrderByNumber);

// Protected routes
router.use(protect);

// User routes
router.post('/', validateOrder, createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/', authorize('admin'), getOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.put('/:id/tracking', authorize('admin'), updateTracking);
router.get('/admin/stats', authorize('admin'), getOrderStats);

export default router;