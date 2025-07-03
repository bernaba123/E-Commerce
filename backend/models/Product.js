import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['coffee', 'spices', 'food', 'clothing', 'crafts', 'other'],
    lowercase: true
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockStatus: {
    type: String,
    enum: ['Available', 'Out of Stock', 'Low Stock'],
    default: 'Available'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviewCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  origin: {
    type: String,
    default: 'Ethiopia'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to automatically update stock status and inStock based on stock quantity
productSchema.pre('save', function(next) {
  // Update inStock status based on quantity
  this.inStock = this.stock > 0;
  
  // Update stockStatus based on stock quantity
  if (this.stock === 0) {
    this.stockStatus = 'Out of Stock';
  } else if (this.stock <= 5) {
    this.stockStatus = 'Low Stock';
  } else {
    this.stockStatus = 'Available';
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to update stock status for existing products
productSchema.statics.updateAllStockStatuses = async function() {
  try {
    // Update all products to have correct stock status
    await this.updateMany(
      { stock: 0 },
      { 
        $set: { 
          inStock: false, 
          stockStatus: 'Out of Stock' 
        } 
      }
    );
    
    await this.updateMany(
      { stock: { $gt: 0, $lte: 5 } },
      { 
        $set: { 
          inStock: true, 
          stockStatus: 'Low Stock' 
        } 
      }
    );
    
    await this.updateMany(
      { stock: { $gt: 5 } },
      { 
        $set: { 
          inStock: true, 
          stockStatus: 'Available' 
        } 
      }
    );
    
    console.log('All product stock statuses updated successfully');
  } catch (error) {
    console.error('Error updating stock statuses:', error);
  }
};

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  this.reviewCount = this.reviews.length;
};

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ stockStatus: 1, inStock: 1 });

export default mongoose.model('Product', productSchema);