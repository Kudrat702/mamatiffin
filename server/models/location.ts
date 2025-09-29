import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  id: string;
}

const locationSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
});

export default mongoose.model<ILocation>('Location', locationSchema);