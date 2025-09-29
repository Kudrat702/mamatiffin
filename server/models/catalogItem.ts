// ===== FILE: models/catalogItem.ts (UPDATED) =====
import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogItem extends Document {
  category: string;
  imageUrl: string;
  price: number;
  type: 'veg' | 'non-veg';
  menuDetailId?: mongoose.Types.ObjectId; // ADDED: Reference to menu details
  createdAt: Date;
  updatedAt: Date;
}

const CatalogItemSchema: Schema = new Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Breakfast',
      'Lunch',
      'Dinner',
      'Breakfast + Lunch',
      'Breakfast + Dinner',
      'Lunch + Dinner',
      'Breakfast + Lunch + Dinner'
    ]
  },
  imageUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['veg', 'non-veg']
  },
  menuDetailId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuDetails', // FIXED: Changed from 'Menu' to 'MenuDetails'
    default: null
  }
}, {
  timestamps: true
});

// ADDED: Index for better performance
CatalogItemSchema.index({ category: 1, type: 1 });
CatalogItemSchema.index({ menuDetailId: 1 });

export default mongoose.model<ICatalogItem>('CatalogItem', CatalogItemSchema);