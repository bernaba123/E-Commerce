import { asyncHandler } from '../middleware/errorHandler.js';
import Request from '../models/Request.js';

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private/Admin
export const getRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by urgency
  if (req.query.urgency) {
    query.urgency = req.query.urgency;
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
  }

  const requests = await Request.find(query)
    .populate('user', 'name email phone')
    .populate('assignedTo', 'name')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Request.countDocuments(query);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequest = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // If not admin, only allow user to see their own requests
  if (req.user.role !== 'admin') {
    query.user = req.user.id;
  }

  const request = await Request.findOne(query)
    .populate('user', 'name email phone')
    .populate('assignedTo', 'name email');

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  res.json({
    success: true,
    data: { request }
  });
});

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
export const createRequest = asyncHandler(async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      user: req.user.id
    };

    // Calculate estimated price and fees (simplified logic)
    const basePrice = parseFloat(req.body.productPrice.replace(/[^0-9.]/g, '')) || 0;
    const serviceFee = basePrice * 0.15; // 15% service fee
    
    // Variable shipping cost based on delivery urgency
    let shippingCost = 20; // Default/low urgency
    if (req.body.urgency === 'medium') {
      shippingCost = 35; // Express delivery
    } else if (req.body.urgency === 'high') {
      shippingCost = 55; // Priority delivery
    }

    requestData.estimatedPrice = basePrice;
    requestData.serviceFee = serviceFee;
    requestData.shippingCost = shippingCost;

    // Explicitly generate requestNumber
    const count = await Request.countDocuments();
    requestData.requestNumber = `REQ${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;

    const newRequest = new Request(requestData);
    await newRequest.save();

    await newRequest.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product request submitted successfully',
      data: { request: newRequest }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit request. Please try again.'
    });
  }
});

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { 
    status, 
    adminNotes, 
    rejectionReason, 
    finalPrice, 
    shippingCost, 
    serviceFee,
    assignedTo 
  } = req.body;

  const request = await Request.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  // Update fields
  request.status = status;
  if (adminNotes) request.adminNotes = adminNotes;
  if (rejectionReason) request.rejectionReason = rejectionReason;
  if (finalPrice) request.finalPrice = finalPrice;
  if (shippingCost !== undefined) request.shippingCost = shippingCost;
  if (serviceFee !== undefined) request.serviceFee = serviceFee;
  if (assignedTo) request.assignedTo = assignedTo;

  // Add tracking update
  if (request.tracking) {
    request.tracking.updates.push({
      status,
      message: `Request status updated to ${status}`,
      timestamp: new Date()
    });
  } else {
    request.tracking = {
      updates: [{
        status,
        message: `Request status updated to ${status}`,
        timestamp: new Date()
      }]
    };
  }

  await request.save();

  res.json({
    success: true,
    message: 'Request status updated successfully',
    data: { request }
  });
});

// @desc    Get user requests
// @route   GET /api/requests/my-requests
// @access  Private
export const getUserRequests = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const requests = await Request.find({ user: req.user.id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Request.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update request tracking
// @route   PUT /api/requests/:id/tracking
// @access  Private/Admin
export const updateRequestTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery, status, message, location } = req.body;

  const request = await Request.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  // Update tracking info
  if (!request.tracking) {
    request.tracking = { updates: [] };
  }

  if (trackingNumber) request.tracking.trackingNumber = trackingNumber;
  if (carrier) request.tracking.carrier = carrier;
  if (estimatedDelivery) request.tracking.estimatedDelivery = estimatedDelivery;

  // Add tracking update
  if (status || message) {
    request.tracking.updates.push({
      status: status || request.status,
      message: message || `Tracking updated`,
      location,
      timestamp: new Date()
    });
  }

  await request.save();

  res.json({
    success: true,
    message: 'Tracking information updated successfully',
    data: { request }
  });
});

// @desc    Get request statistics
// @route   GET /api/requests/admin/stats
// @access  Private/Admin
export const getRequestStats = asyncHandler(async (req, res) => {
  const totalRequests = await Request.countDocuments();
  const pendingRequests = await Request.countDocuments({ status: 'pending' });
  const approvedRequests = await Request.countDocuments({ status: 'approved' });
  const completedRequests = await Request.countDocuments({ status: 'delivered' });

  // Status distribution
  const statusDistribution = await Request.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Category distribution
  const categoryDistribution = await Request.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  // Monthly request trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Request.aggregate([
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

  // Average processing time
  const processingTimes = await Request.aggregate([
    { 
      $match: { 
        status: 'delivered',
        approvedAt: { $exists: true },
        deliveredAt: { $exists: true }
      }
    },
    {
      $project: {
        processingTime: {
          $divide: [
            { $subtract: ['$deliveredAt', '$approvedAt'] },
            1000 * 60 * 60 * 24 // Convert to days
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgProcessingTime: { $avg: '$processingTime' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      statusDistribution,
      categoryDistribution,
      monthlyTrend,
      avgProcessingTime: processingTimes[0]?.avgProcessingTime || 0
    }
  });
});