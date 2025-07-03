import { asyncHandler } from '../middleware/errorHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Helper function to emit socket events
const emitOrderUpdate = (req, orderId, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.to(`order_${orderId}`).emit(event, data);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by payment status
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // If not admin, only allow user to see their own orders
  if (req.user.role !== 'admin') {
    query.user = req.user.id;
  }

  const order = await Order.findOne(query)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images description');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    data: { order }
  });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, billingAddress, paymentMethod, notes, paymentInfo } = req.body;

  // Validate and calculate order totals
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.product} not found or inactive`
      });
    }

    // Only check stock availability for non-admin users
    // Admin users can order regardless of stock levels since their orders don't affect stock
    if (req.user.role !== 'admin' && (!product.inStock || product.stock < item.quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product ${product.name}`
      });
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      name: product.name,
      image: product.images[0]
    });

    // Update product stock only for non-admin users
    // Admin orders don't affect stock levels
    if (req.user.role !== 'admin') {
      product.stock -= item.quantity;
      await product.save();
    }
  }

  // Calculate shipping and tax (simplified)
  const shippingCost = totalAmount > 50 ? 0 : 9.99;
  const taxAmount = totalAmount * 0.19; // 19% VAT for Germany
  const finalAmount = totalAmount + shippingCost + taxAmount;

  // Process payment for non-admin users
  let paymentStatus = 'pending';
  let orderStatus = 'pending';

  // Admin users bypass payment processing
  if (req.user.role === 'admin') {
    paymentStatus = 'paid';
    orderStatus = 'confirmed';
  } else if (paymentMethod === 'cash_on_delivery') {
    // Cash on delivery orders don't require immediate payment
    paymentStatus = 'pending';
    orderStatus = 'confirmed';
  } else {
    // Process payment for regular users with online payment methods
    try {
      const paymentResult = await processPayment({
        amount: finalAmount,
        method: paymentMethod,
        paymentInfo: paymentInfo || {},
        customerInfo: {
          name: shippingAddress.name,
          email: shippingAddress.email
        }
      });

      if (paymentResult.success) {
        paymentStatus = 'paid';
        orderStatus = 'confirmed';
      } else {
        return res.status(400).json({
          success: false,
          message: paymentResult.message || 'Payment failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed. Please check your payment information and try again.'
      });
    }
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalAmount,
    shippingCost,
    taxAmount,
    finalAmount,
    status: orderStatus,
    paymentStatus,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod,
    notes
  });

  await order.populate('items.product', 'name images');

  res.status(201).json({
    success: true,
    message: `Order ${paymentStatus === 'paid' ? 'created and paid' : 'created'} successfully`,
    data: { order }
  });
});

// Mock payment processing function (replace with real payment gateway in production)
const processPayment = async ({ amount, method, paymentInfo, customerInfo }) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation - in production, integrate with Stripe, PayPal, etc.
  if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
    return {
      success: false,
      message: 'Invalid payment information. Please check your card details.'
    };
  }

  // Mock successful payment (90% success rate for demo)
  const isSuccessful = Math.random() > 0.1;
  
  if (isSuccessful) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: 'Payment processed successfully'
    };
  } else {
    return {
      success: false,
      message: 'Payment declined. Please check your card details or try a different payment method.'
    };
  }
};

// @desc    Track order by order number or tracking number
// @route   POST /api/orders/track
// @access  Public
export const trackOrderByNumber = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.body;

  if (!trackingNumber) {
    return res.status(400).json({
      success: false,
      message: 'Tracking number is required'
    });
  }

  // Search by order number or tracking number
  const order = await Order.findOne({
    $or: [
      { orderNumber: trackingNumber },
      { 'tracking.trackingNumber': trackingNumber }
    ]
  })
    .populate('user', 'name email phone')
    .populate('items.product', 'name images description');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found. Please check your tracking number and try again.'
    });
  }

  // Format response to match frontend expectations
  const trackingData = {
    orderNumber: order.orderNumber,
    status: order.status,
    estimatedDelivery: order.tracking?.estimatedDelivery?.toISOString().split('T')[0] || null,
    currentLocation: order.tracking?.updates?.length > 0 
      ? order.tracking.updates[order.tracking.updates.length - 1].location 
      : 'Order Processing Center',
    customer: {
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone || '+1 234 567 8900'
    },
    shippingAddress: {
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country
    },
    items: order.items.map(item => ({
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      price: `€${item.price.toFixed(2)}`,
      image: item.image || item.product?.images?.[0] || 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=100'
    })),
    tracking: {
      carrier: order.tracking?.carrier || 'Standard Shipping',
      trackingNumber: order.tracking?.trackingNumber || order.orderNumber,
      updates: order.tracking?.updates?.map(update => ({
        status: update.status,
        message: update.message,
        location: update.location,
        timestamp: update.timestamp?.toISOString(),
        completed: true
      })) || [
        {
          status: 'ordered',
          message: 'Order confirmed and payment received',
          location: 'Processing Center',
          timestamp: order.createdAt.toISOString(),
          completed: true
        }
      ]
    }
  };

  res.json({
    success: true,
    data: trackingData
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const oldStatus = order.status;
  order.status = status;
  if (adminNotes) order.adminNotes = adminNotes;

  // Add tracking update
  if (!order.tracking) {
    order.tracking = { updates: [] };
  }
  
  order.tracking.updates.push({
    status,
    message: `Order status updated to ${status}`,
    location: 'Processing Center',
    timestamp: new Date()
  });

  await order.save();

  // Emit real-time update
  emitOrderUpdate(req, order._id, 'orderStatusUpdate', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    message: `Order status updated from ${oldStatus} to ${status}`,
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user.id })
    .populate('items.product', 'name images')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments({ user: req.user.id });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update order tracking
// @route   PUT /api/orders/:id/tracking
// @access  Private/Admin
export const updateTracking = asyncHandler(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery, status, message, location } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Update tracking info
  if (!order.tracking) {
    order.tracking = { updates: [] };
  }

  if (trackingNumber) order.tracking.trackingNumber = trackingNumber;
  if (carrier) order.tracking.carrier = carrier;
  if (estimatedDelivery) order.tracking.estimatedDelivery = estimatedDelivery;

  // Add tracking update
  if (status || message) {
    const trackingUpdate = {
      status: status || order.status,
      message: message || 'Tracking updated',
      location,
      timestamp: new Date()
    };
    
    order.tracking.updates.push(trackingUpdate);
    
    // Emit real-time update
    emitOrderUpdate(req, order._id, 'trackingUpdate', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      update: trackingUpdate,
      currentLocation: location,
      estimatedDelivery: order.tracking.estimatedDelivery
    });
  }

  await order.save();

  res.json({
    success: true,
    message: 'Tracking information updated successfully',
    data: { order }
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  const completedOrders = await Order.countDocuments({ status: 'delivered' });
  
  // Revenue calculation
  const revenueData = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$finalAmount' } } }
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  // Monthly revenue trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Order.aggregate([
    { 
      $match: { 
        paymentStatus: 'paid',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$finalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Order status distribution
  const statusDistribution = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      statusDistribution
    }
  });
});

// Helper function to check if order can be edited/cancelled (within 10 minutes)
const canEditOrCancel = (createdAt) => {
  const now = new Date();
  const createdTime = new Date(createdAt);
  const timeDiff = now - createdTime;
  const tenMinutesInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
  return timeDiff <= tenMinutesInMs;
};

// @desc    Edit user order (within 10 minutes)
// @route   PUT /api/orders/:id/edit
// @access  Private (User can only edit their own orders)
export const editUserOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, notes } = req.body;

  const order = await Order.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if order can be edited (within 10 minutes and status allows editing)
  if (!canEditOrCancel(order.createdAt)) {
    return res.status(400).json({
      success: false,
      message: 'Orders can only be edited within 10 minutes of placement'
    });
  }

  // Only allow editing of pending orders
  if (order.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending orders can be edited'
    });
  }

  // Update editable fields
  if (shippingAddress) {
    order.shippingAddress = { ...order.shippingAddress, ...shippingAddress };
  }
  if (billingAddress) {
    order.billingAddress = { ...order.billingAddress, ...billingAddress };
  }
  if (notes !== undefined) {
    order.notes = notes;
  }

  await order.save();

  // Add tracking update
  if (!order.tracking) {
    order.tracking = { updates: [] };
  }
  
  order.tracking.updates.push({
    status: order.status,
    message: 'Order details updated by customer',
    location: 'Processing Center',
    timestamp: new Date()
  });

  await order.save();

  res.json({
    success: true,
    message: 'Order updated successfully',
    data: { order }
  });
});

// @desc    Cancel user order (within 10 minutes)
// @route   PUT /api/orders/:id/cancel
// @access  Private (User can only cancel their own orders)
export const cancelUserOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findOne({ 
    _id: req.params.id, 
    user: req.user.id 
  }).populate('items.product', 'name stock');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if order can be cancelled (within 10 minutes and status allows cancellation)
  if (!canEditOrCancel(order.createdAt)) {
    return res.status(400).json({
      success: false,
      message: 'Orders can only be cancelled within 10 minutes of placement'
    });
  }

  // Only allow cancellation of pending or confirmed orders
  if (!['pending', 'confirmed'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'This order cannot be cancelled as it is already being processed'
    });
  }

  // Restore product stock only for non-admin orders
  if (req.user.role !== 'admin') {
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  // Update order status and add cancellation reason
  order.status = 'cancelled';
  order.notes = reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer';

  // Add tracking update
  if (!order.tracking) {
    order.tracking = { updates: [] };
  }
  
  order.tracking.updates.push({
    status: 'cancelled',
    message: reason ? `Order cancelled by customer: ${reason}` : 'Order cancelled by customer',
    location: 'Processing Center',
    timestamp: new Date()
  });

  await order.save();

  // Emit real-time update
  emitOrderUpdate(req, order._id, 'orderCancelled', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: 'cancelled',
    message: 'Order cancelled by customer',
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});