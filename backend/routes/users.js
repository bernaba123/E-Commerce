import express from 'express';
import { 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  getUserStats 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/stats')
  .get(getUserStats);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;