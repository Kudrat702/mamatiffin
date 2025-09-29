// models/order.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  // User Information
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };

  // Menu Information
  menuId: mongoose.Types.ObjectId;
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  weeklyMenu: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };

  // Order Details
  subscriptionType: 'monthly' | 'trial';
  duration: number;
  price: number;
  totalAmount: number;
  deliveryTime: string;
  description: string;
  imageUrl: string;

  // Payment Information (duplicates allowed)
  paymentId?: string;
  razorpayOrderId?: string;
  signature?: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: 'upi' | 'card' | 'net_banking';

  // Dates
  startDate: Date;
  endDate: Date;
  orderDate: Date;

  // Status
  orderStatus: 'active' | 'completed' | 'cancelled' | 'pending';
  
  // Metadata
  source: string;
  notes?: string;

  // Unique identifier for each order attempt
  orderAttemptId: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>({
  // User Information
  customerName: { type: String, required: true, trim: true, default: 'N/A' },
  customerPhone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'],
    default: '0000000000'
  },
  customerEmail: { type: String, trim: true, lowercase: true },
  
  // ✅ ADDRESS WITH DEFAULT VALUES
  address: {
    type: {
      district: { type: String, required: true, default: 'N/A' },
      block: { type: String, required: true, default: 'N/A' },
      city: { type: String, required: true, default: 'N/A' },
      homeLodgeName: { type: String, required: true, default: 'N/A' }
    },
    required: true,
    default: () => ({
      district: 'N/A',
      block: 'N/A', 
      city: 'N/A',
      homeLodgeName: 'N/A'
    })
  },

  // Menu Information
  menuId: { type: Schema.Types.ObjectId, ref: 'Menu', required: true },
  menuTitle: { type: String, required: true, default: 'N/A' },
  menuCategory: { type: String, required: true, default: 'N/A' },
  dietaryPreference: { type: String, enum: ['veg', 'non-veg'], required: true, default: 'veg' },
  weeklyMenu: {
    monday: { type: String, default: 'N/A' },
    tuesday: { type: String, default: 'N/A' },
    wednesday: { type: String, default: 'N/A' },
    thursday: { type: String, default: 'N/A' },
    friday: { type: String, default: 'N/A' },
    saturday: { type: String, default: 'N/A' },
    sunday: { type: String, default: 'N/A' }
  },

  // Order Details
  subscriptionType: { type: String, enum: ['monthly', 'trial'], required: true, default: 'trial' },
  duration: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true, min: 0, default: 0 },
  totalAmount: { type: Number, required: true, min: 0, default: 0 },
  deliveryTime: { type: String, default: 'N/A' },
  description: { type: String, default: 'N/A' },
  imageUrl: { type: String, default: '' },

  // Payment Information - NO CONSTRAINTS
  paymentId: { type: String, sparse: true },
  razorpayOrderId: { type: String },
  signature: { type: String, default: null },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['upi', 'card', 'net_banking'], default: 'upi' },

  // Dates
  startDate: { type: Date, required: true, default: Date.now },
  endDate: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days from now
  orderDate: { type: Date, default: Date.now },

  // Status
  orderStatus: { type: String, enum: ['active', 'completed', 'cancelled', 'pending'], default: 'pending' },

  // Metadata
  source: { type: String, default: 'web' },
  notes: String,

  // ✅ FIXED: Unique identifier for each order attempt (NO duplicate index)
  orderAttemptId: { type: String, required: true }  // Removed 'unique: true' from here
}, { timestamps: true });

// ✅ PRE-SAVE MIDDLEWARE TO ENSURE ADDRESS EXISTS
orderSchema.pre('save', function(next) {
  // Ensure address object exists with all required fields
  if (!this.address) {
    this.address = {
      district: 'N/A',
      block: 'N/A',
      city: 'N/A',
      homeLodgeName: 'N/A'
    };
  } else {
    // Fill missing address fields
    if (!this.address.district) this.address.district = 'N/A';
    if (!this.address.block) this.address.block = 'N/A';
    if (!this.address.city) this.address.city = 'N/A';
    if (!this.address.homeLodgeName) this.address.homeLodgeName = 'N/A';
  }
  
  // Ensure other required fields have defaults
  if (!this.customerName) this.customerName = 'N/A';
  if (!this.menuTitle) this.menuTitle = 'N/A';
  
  next();
});

// ✅ TRANSFORM OUTPUT TO ENSURE ADDRESS IS ALWAYS PRESENT
orderSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    // Ensure address exists in JSON output
    if (!ret.address) {
      ret.address = {
        district: 'N/A',
        block: 'N/A',
        city: 'N/A',
        homeLodgeName: 'N/A'
      };
    }
    return ret;
  }
});

orderSchema.set('toObject', {
  transform: function(doc, ret, options) {
    // Ensure address exists in object output
    if (!ret.address) {
      ret.address = {
        district: 'N/A',
        block: 'N/A',
        city: 'N/A',
        homeLodgeName: 'N/A'
      };
    }
    return ret;
  }
});

// ✅ FIXED INDEXES - NO DUPLICATES
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ menuId: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ dietaryPreference: 1 });
orderSchema.index({ 'address.city': 1 });
orderSchema.index({ subscriptionType: 1 });
orderSchema.index({ createdAt: -1 });

// ✅ SINGLE UNIQUE INDEX for orderAttemptId
orderSchema.index({ orderAttemptId: 1 }, { unique: true });

// Compound indexes for better query performance
orderSchema.index({ customerPhone: 1, orderStatus: 1 });
orderSchema.index({ paymentStatus: 1, orderStatus: 1 });
orderSchema.index({ customerPhone: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('orders', orderSchema);