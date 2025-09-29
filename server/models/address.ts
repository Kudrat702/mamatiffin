import mongoose, { Document, Schema } from 'mongoose';

export interface IAddress extends Document {
  district: string;
  blocks: string[];
  cities: string[];
  homeLodgeNames: string[];
}

const AddressSchema: Schema = new Schema({
  district: {
    type: String,
    required: true,
    unique: true
  },
  blocks: [{
    type: String,
    required: true
  }],
  cities: [{
    type: String,
    required: true
  }],
  homeLodgeNames: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

export default mongoose.model<IAddress>('Address', AddressSchema);