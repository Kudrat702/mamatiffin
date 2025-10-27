// import mongoose, { Schema, Document } from 'mongoose';
// import { SliderImage } from '../types/slider';

// interface SliderImageDocument extends Omit<SliderImage, '_id'>, Document {}

// const SliderImageSchema = new Schema<SliderImageDocument>(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100
//     },
//     alt: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200
//     },
//     src: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     dataAiHint: {
//       type: String,
//       trim: true,
//       maxlength: 50
//     },
//     isActive: {
//       type: Boolean,
//       default: true
//     },
//     order: {
//       type: Number,
//       default: 0
//     }
//   },
//   {
//     timestamps: true
//   }
// );

// // Create index for efficient querying
// SliderImageSchema.index({ isActive: 1, order: 1 });

// export default mongoose.model<SliderImageDocument>('SliderImage', SliderImageSchema);

import mongoose, { Schema, Document } from 'mongoose';
import { SliderImage } from '../types/slider';

interface SliderImageDocument extends Omit<SliderImage, '_id'>, Document {
  imagePublicId?: string;
}

const SliderImageSchema = new Schema<SliderImageDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    src: {
      type: String,
      required: true,
      trim: true
    },
    // NEW: Cloudinary public ID for image management
    imagePublicId: {
      type: String,
      required: false,  // Optional because old records won't have it
      trim: true
    },
    dataAiHint: {
      type: String,
      trim: true,
      maxlength: 50
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Create index for efficient querying
SliderImageSchema.index({ isActive: 1, order: 1 });

export default mongoose.model<SliderImageDocument>('SliderImage', SliderImageSchema);