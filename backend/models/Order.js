import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  name: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false  // Will be auto-generated in pre-save hook
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  finalAmount: {
    type: Number,
    required: false,  // Will be auto-calculated in pre-save hook
    min: [0, 'Final amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    default: 'credit_card'
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
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    phone: String
  },
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
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
  notes: String,
  adminNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `EC${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate final amount
orderSchema.pre('save', function(next) {
  // Ensure we have the required values before calculating
  if (this.totalAmount !== undefined && this.shippingCost !== undefined && this.taxAmount !== undefined) {
    this.finalAmount = this.totalAmount + this.shippingCost + this.taxAmount;
  }
  next();
});

export default mongoose.model('Order', orderSchema);