import mongoose, { Schema, Document } from 'mongoose';
import { RequestStatus, PriceUnit, BidStatus } from '../../core/enums.js';

export interface IBid {
  _id: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  price: number;
  priceUnit: PriceUnit;
  message?: string;
  status: BidStatus;
  createdAt: Date;
}

export interface IRequest extends Document {
  userId: mongoose.Types.ObjectId;
  providerId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  status: RequestStatus;
  budget?: number;
  priceUnit?: PriceUnit;
  price?: number;
  bids: IBid[];
}

const bidSchema = new Schema({
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  priceUnit: {
    type: String,
    enum: Object.values(PriceUnit),
    default: PriceUnit.HOUR,
  },
  message: { type: String },
  status: {
    type: String,
    enum: Object.values(BidStatus),
    default: BidStatus.PENDING,
  },
}, { timestamps: true });

const requestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.OPEN,
    },
    budget: { type: Number },
    priceUnit: {
      type: String,
      enum: Object.values(PriceUnit),
      default: PriceUnit.HOUR,
    },
    price: { type: Number },
    bids: [bidSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IRequest>('Request', requestSchema);

