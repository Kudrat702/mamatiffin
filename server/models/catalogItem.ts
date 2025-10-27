// models/catalogItem.ts - UPDATED WITH CLOUDINARY SUPPORT
import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogItem extends Document {
  category: string;
  imageUrl: string;
  imagePublicId?: string;              // NEW: Cloudinary public ID
  price: number;
  type: 'veg' | 'non-veg';
  menuDetailId?: mongoose.Types.ObjectId;
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
  // NEW: Cloudinary public ID for image management
  imagePublicId: {
    type: String,
    required: false  // Optional because old records won't have it
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
    ref: 'MenuDetails',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
CatalogItemSchema.index({ category: 1, type: 1 });
CatalogItemSchema.index({ menuDetailId: 1 });

export default mongoose.model<ICatalogItem>('CatalogItem', CatalogItemSchema);