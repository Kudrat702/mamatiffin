// models/payment.ts - UPDATED VERSION
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  merchantTransactionId: string; // Razorpay order id ya UUID (unique)
  amount: number;
  currency: string;
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET';
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  initiatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  gatewayResponse?: any;
  failureReason?: string;
  attempts: { 
    attemptNumber: number; 
    attemptedAt: Date; 
    status: string; 
    response: any;
  }[];
  // ADDED: For better tracking
  metadata?: {
    menuType?: string;
    subscriptionType?: string;
    customerInfo?: any;
  };
}

const PaymentSchema = new Schema<IPayment>({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', // This should match your Order model name
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', // Make sure User model exists or adjust accordingly
    required: true 
  },
  merchantTransactionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  currency: { 
    type: String, 
    default: 'INR',
    enum: ['INR', 'USD'] // Add supported currencies
  },
  paymentMethod: { 
    type: String, 
    enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'], 
    default: 'INITIATED' 
  },
  razorpayOrderId: { 
    type: String,
    sparse: true // Allows multiple null values
  },
  razorpayPaymentId: { 
    type: String,
    sparse: true 
  },
  razorpaySignature: { 
    type: String,
    sparse: true 
  },
  initiatedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  failedAt: { 
    type: Date 
  },
  gatewayResponse: { 
    type: Schema.Types.Mixed 
  },
  failureReason: { 
    type: String 
  },
  attempts: [{
    attemptNumber: { 
      type: Number, 
      required: true 
    },
    attemptedAt: { 
      type: Date, 
      default: Date.now 
    },
    status: { 
      type: String, 
      required: true 
    },
    response: { 
      type: Schema.Types.Mixed 
    }
  }],
  // ADDED: Optional metadata for better tracking
  metadata: {
    menuType: String,
    subscriptionType: String,
    customerInfo: Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// Indexes for performance
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ merchantTransactionId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ razorpayOrderId: 1 }); // ADDED: For faster lookups
PaymentSchema.index({ razorpayPaymentId: 1 }); // ADDED: For faster lookups

// Instance methods with proper typing
PaymentSchema.methods = {
  addAttempt(this: IPayment, status: string, response: any): Promise<IPayment> {
    this.attempts.push({ 
      attemptNumber: this.attempts.length + 1, 
      attemptedAt: new Date(), 
      status, 
      response 
    });
    return this.save();
  },

  markAsSuccess(this: IPayment, resp: any): Promise<IPayment> {
    this.status = 'SUCCESS';
    this.completedAt = new Date();
    this.gatewayResponse = resp;
    
    if (resp?.razorpay_payment_id) {
      this.razorpayPaymentId = resp.razorpay_payment_id;
    }
    if (resp?.razorpay_order_id) {
      this.razorpayOrderId = resp.razorpay_order_id;
    }
    if (resp?.razorpay_signature) {
      this.razorpaySignature = resp.razorpay_signature;
    }
    
    return this.save();
  },

  markAsFailed(this: IPayment, reason: string, resp?: any): Promise<IPayment> {
    this.status = 'FAILED';
    this.failedAt = new Date();
    this.failureReason = reason;
    
    if (resp) {
      this.gatewayResponse = resp;
    }
    
    return this.save();
  },

  // ADDED: Mark as pending method
  markAsPending(this: IPayment): Promise<IPayment> {
    this.status = 'PENDING';
    return this.save();
  },

  // ADDED: Check if payment is completed
  isCompleted(this: IPayment): boolean {
    return this.status === 'SUCCESS';
  },

  // ADDED: Check if payment failed
  isFailed(this: IPayment): boolean {
    return ['FAILED', 'CANCELLED'].includes(this.status);
  }
};

export default mongoose.model<IPayment>('Payment', PaymentSchema);