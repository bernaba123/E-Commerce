import { asyncHandler } from '../middleware/errorHandler.js';
import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  let query = { isActive: true };

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by category
  if (req.query.category && req.query.category !== 'all') {
    query.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by stock status
  if (req.query.stockStatus) {
    query.stockStatus = req.query.stockStatus;
  }

  // Filter by stock availability
  if (req.query.inStock === 'true') {
    query.inStock = true;
  } else if (req.query.inStock === 'false') {
    query.inStock = false;
  }

  // Sort options
  let sort = {};
  switch (req.query.sort) {
    case 'price-low':
      sort.price = 1;
      break;
    case 'price-high':
      sort.price = -1;
      break;
    case 'rating':
      sort.rating = -1;
      break;
    case 'reviews':
      sort.reviewCount = -1;
      break;
    case 'newest':
      sort.createdAt = -1;
      break;
    case 'stock':
      sort.stock = -1;
      break;
    default:
      sort.name = 1;
  }

  const products = await Product.find(query)
    .populate('createdBy', 'name')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('reviews.user', 'name avatar');

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: { product }
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const productData = {
    ...req.body,
    createdBy: req.user.id
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin
export const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (stock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock cannot be negative'
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Product stock updated successfully',
    data: { 
      product,
      stockStatus: product.stockStatus,
      inStock: product.inStock
    }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Soft delete by setting isActive to false
  product.isActive = false;
  await product.save();

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === req.user.id
  );

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  const review = {
    user: req.user.id,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.calculateAverageRating();
  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully'
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ 
    featured: true, 
    isActive: true,
    inStock: true 
  })
    .limit(8)
    .sort({ rating: -1, createdAt: -1 });

  res.json({
    success: true,
    data: { products }
  });
});

// @desc    Get product statistics
// @route   GET /api/products/admin/stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments({ isActive: true });
  const outOfStock = await Product.countDocuments({ isActive: true, inStock: false });
  const lowStock = await Product.countDocuments({ isActive: true, stockStatus: 'Low Stock' });
  const featuredProducts = await Product.countDocuments({ featured: true, isActive: true });
  
  // Stock status distribution
  const stockStatusStats = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$stockStatus', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Category distribution
  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Top rated products
  const topRated = await Product.find({ isActive: true })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(5)
    .select('name rating reviewCount stockStatus');

  // Low stock products (need attention)
  const lowStockProducts = await Product.find({ 
    isActive: true, 
    stockStatus: { $in: ['Low Stock', 'Out of Stock'] }
  })
    .sort({ stock: 1 })
    .limit(10)
    .select('name stock stockStatus');

  res.json({
    success: true,
    data: {
      totalProducts,
      outOfStock,
      lowStock,
      featuredProducts,
      stockStatusStats,
      categoryStats,
      topRated,
      lowStockProducts
    }
  });
});

// @desc    Bulk update stock statuses
// @route   POST /api/products/admin/update-stock-statuses
// @access  Private/Admin
export const updateAllStockStatuses = asyncHandler(async (req, res) => {
  await Product.updateAllStockStatuses();

  res.json({
    success: true,
    message: 'All product stock statuses updated successfully'
  });
});