import mongoose, { Document, Schema, model, Types } from 'mongoose';

// Weekly Menu Day Interface
export interface IWeeklyMenuDay {
  day: string;
  items: string[];
}

// UPDATED: Added imagePublicId for Cloudinary AND priceWeekly
export interface IMenuDetails extends Document {
  category: 'veg' | 'non-veg';          
  menuType: string;                      
  title: string;                        
  description: string;
  imageUrl: string;
  imagePublicId?: string;                // Cloudinary public ID
  deliveryTime: string;
  priceMonthly: number; 
  priceWeekly: number;                   // ✅ Weekly price
  priceTrial: number;                    
  weeklyMenu: IWeeklyMenuDay[];
  catalogItemId?: string;                
  _id: Types.ObjectId;
}

// Weekly Menu Day Schema
const weeklyMenuDaySchema = new Schema<IWeeklyMenuDay>({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  items: {
    type: [String],
    required: true,
    validate: {
      validator: function(items: string[]) {
        return items.length > 0 && items.every(item => item.trim().length > 0);
      },
      message: 'Each day must have at least one non-empty menu item'
    }
  }
}, { _id: false });

const menuDetailsSchema = new Schema<IMenuDetails>({
  category: {
    type: String,
    enum: ['veg', 'non-veg'],
    required: true
  },
  menuType: {
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePublicId: {
    type: String,
    required: false
  },
  deliveryTime: {
    type: String,
    required: true
  },
  priceMonthly: {
    type: Number,
    required: true
  },
  // ✅ NEW: priceWeekly field added to schema
  priceWeekly: {
    type: Number,
    required: false,
    default: 0
  },
  priceTrial: {
    type: Number,
    required: true
  },
  weeklyMenu: {
    type: [weeklyMenuDaySchema],
    required: true,
    validate: {
      validator: function(weeklyMenu: IWeeklyMenuDay[]) {
        return weeklyMenu.length === 7;
      },
      message: 'Weekly menu must have exactly 7 days'
    }
  },
  catalogItemId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Compound unique index
menuDetailsSchema.index({ category: 1, menuType: 1 }, { unique: true });

export const MenuDetails = mongoose.model<IMenuDetails>('Menus', menuDetailsSchema);