import mongoose, { Document, Schema, Types } from 'mongoose';

export type BookClass = '9th' | '10th' | '11th' | '12th';
export type BookCondition = 'New' | 'Good' | 'Fair';
export type BookStatus = 'Available' | 'Sold';

export interface IBookImage {
  url: string;
  publicId: string;
}

export interface IBook extends Document {
  userId: Types.ObjectId;
  bookName: string;
  price: number;
  images: IBookImage[];
  class: BookClass;
  subject: string;
  condition: BookCondition;
  description: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  status: BookStatus;
  soldDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookName: { type: String, required: true, trim: true, maxlength: 150 },
    price: { type: Number, required: true, min: 0 },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: (arr: IBookImage[]) => arr.length >= 1 && arr.length <= 3,
        message: 'Please upload between 1 and 3 images',
      },
    },
    class: {
      type: String,
      required: true,
      enum: ['9th', '10th', '11th', '12th'],
      index: true,
    },
    subject: { type: String, required: true, index: true },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair'],
      default: 'Good',
    },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    sellerName: { type: String, required: true },
    sellerPhone: { type: String, required: true },
    sellerAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ['Available', 'Sold'],
      default: 'Available',
      index: true,
    },
    soldDate: { type: Date, default: null },
  },
  { timestamps: true }
);

bookSchema.index({ status: 1, class: 1, subject: 1 });

export default mongoose.model<IBook>('Book', bookSchema);