// models/FoodPreference.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodPreference extends Document {
  customerPhone: string;
  customerName?: string;
  date: Date;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  informed: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const foodPreferenceSchema = new Schema<IFoodPreference>({
  customerPhone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  customerName: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  breakfast: {
    type: Boolean,
    default: true // true means deliver, false means skip
  },
  lunch: {
    type: Boolean,
    default: true // true means deliver, false means skip
  },
  dinner: {
    type: Boolean,
    default: true // true means deliver, false means skip
  },
  informed: {
    type: Boolean,
    default: false // true when user has confirmed their choices
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true 
});

// Indexes for better query performance
foodPreferenceSchema.index({ customerPhone: 1 });
foodPreferenceSchema.index({ date: 1 });
foodPreferenceSchema.index({ customerPhone: 1, date: 1 }, { unique: true }); // One preference per customer per date
foodPreferenceSchema.index({ informed: 1 });

// Compound indexes
foodPreferenceSchema.index({ date: 1, informed: 1 });
foodPreferenceSchema.index({ customerPhone: 1, date: -1 });

export const FoodPreference = mongoose.model<IFoodPreference>('FoodPreference', foodPreferenceSchema);