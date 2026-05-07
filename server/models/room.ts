import mongoose, { Document, Schema } from 'mongoose';

export type RoomGender = 'boy' | 'girl';
export type RoomBedType = 'single' | 'double';

export interface IRoom extends Document {
  lodgeName: string;
  ownerName: string;
  ownerContact: string;
  address: string;
  googleMapLink: string;
  latitude?: number;
  longitude?: number;
  gender: RoomGender;
  bedType: RoomBedType;
  rentPrice?: number;
  description?: string;
  images: { url: string; publicId?: string }[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    lodgeName: { type: String, required: true, trim: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    ownerContact: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Contact number must be 10 digits'],
    },
    address: { type: String, required: true, trim: true },
    googleMapLink: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    gender: {
      type: String,
      enum: ['boy', 'girl'],
      required: true,
      index: true,
    },
    bedType: {
      type: String,
      enum: ['single', 'double'],
      required: true,
      index: true,
    },
    rentPrice: { type: Number, min: 0 },
    description: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index for fast filtering
RoomSchema.index({ gender: 1, bedType: 1, isAvailable: 1 });

export default mongoose.model<IRoom>('Room', RoomSchema);