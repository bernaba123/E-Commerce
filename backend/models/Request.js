import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productUrl: {
    type: String,
    required: [true, 'Product URL is required'],
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  productPrice: {
    type: String,
    required: [true, 'Product price is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'other'],
    default: 'other'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'rejected', 'processing', 'ordered', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedPrice: {
    type: Number,
    min: [0, 'Estimated price cannot be negative']
  },
  finalPrice: {
    type: Number,
    min: [0, 'Final price cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  totalCost: {
    type: Number,
    min: [0, 'Total cost cannot be negative']
  },
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true,
      default: 'Ethiopia'
    },
    zipCode: String,
    phone: String
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    updates: [{
      status: String,
      message: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  adminNotes: String,
  userNotes: String,
  rejectionReason: String,
  images: [String],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  processedAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate request number before saving
requestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Request').countDocuments();
    this.requestNumber = `REQ${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate total cost
requestSchema.pre('save', function(next) {
  if (this.finalPrice || this.estimatedPrice) {
    const basePrice = this.finalPrice || this.estimatedPrice || 0;
    this.totalCost = basePrice + this.shippingCost + this.serviceFee;
  }
  next();
});

// Update status timestamps
requestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    switch (this.status) {
      case 'approved':
        if (!this.approvedAt) this.approvedAt = new Date();
        break;
      case 'processing':
      case 'ordered':
        if (!this.processedAt) this.processedAt = new Date();
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = new Date();
        break;
    }
  }
  next();
});

export default mongoose.model('Request', requestSchema);