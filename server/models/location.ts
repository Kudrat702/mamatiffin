// server/models/location.ts - UPDATED VERSION

import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  id?: string;  // ✅ Made optional to support existing locations
  createdAt?: Date;
  updatedAt?: Date;
}

const locationSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true  // ✅ Remove extra spaces
    },
    id: { 
      type: String, 
      required: false,  // ✅ NOT required (for backward compatibility)
      unique: true,     // ✅ Still unique when provided
      sparse: true,     // ✅ CRITICAL: Allows multiple null/undefined values
      trim: true
    },
  },
  { 
    timestamps: true  // ✅ Auto-add createdAt and updatedAt
  }
);

// ✅ Index for faster queries
locationSchema.index({ name: 1 });
locationSchema.index({ id: 1 }, { sparse: true });

export default mongoose.model<ILocation>('Location', locationSchema);