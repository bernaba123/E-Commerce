import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Request from '../models/Request.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Search functionality
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by status
  if (req.query.status) {
    query.isActive = req.query.status === 'active';
  }

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user statistics
  const orderCount = await Order.countDocuments({ user: user._id });
  const requestCount = await Request.countDocuments({ user: user._id });
  const totalSpent = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } }
  ]);

  const userStats = {
    orderCount,
    requestCount,
    totalSpent: totalSpent[0]?.total || 0
  };

  res.json({
    success: true,
    data: {
      user,
      stats: userStats
    }
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    role: req.body.role,
    isActive: req.body.isActive,
    avatar: req.body.avatar
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting admin users
  if (user.role === 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete admin users'
    });
  }

  // Soft delete by deactivating the user
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const adminUsers = await User.countDocuments({ role: 'admin' });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
  });

  // User registration trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const registrationTrend = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth,
      registrationTrend
    }
  });
});