import mongoose, { Schema, Document } from 'mongoose';
import { PriceUnit } from '../../core/enums.js';

export interface IService extends Document {
  providerId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  priceUnit: PriceUnit;
  images: string[];
  rating: number;
  numReviews: number;
}

const serviceSchema: Schema = new Schema(
  {
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: [true, 'Service title is required'] },
    description: { type: String, required: [true, 'Service description is required'] },
    price: { type: Number, required: [true, 'Service price is required'] },
    priceUnit: {
      type: String,
      enum: Object.values(PriceUnit),
      default: PriceUnit.HOUR,
    },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);


export default mongoose.model<IService>('Service', serviceSchema);
