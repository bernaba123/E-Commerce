import express from 'express';
import { 
  getRequests, 
  getRequest, 
  createRequest, 
  updateRequestStatus,
  getUserRequests,
  getRequestStats,
  updateRequestTracking,
  editUserRequest,
  cancelUserRequest
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateProductRequest } from '../middleware/validation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.post('/', validateProductRequest, createRequest);
router.get('/my-requests', getUserRequests);
router.get('/:id', getRequest);
router.put('/:id/edit', editUserRequest);
router.put('/:id/cancel', cancelUserRequest);

// Admin routes
router.get('/', authorize('admin'), getRequests);
router.put('/:id/status', authorize('admin'), updateRequestStatus);
router.put('/:id/tracking', authorize('admin'), updateRequestTracking);
router.get('/admin/stats', authorize('admin'), getRequestStats);

export default router;