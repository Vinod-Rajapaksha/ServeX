import mongoose, { Schema, Document } from 'mongoose';
import { BookingStatus, PriceUnit } from '../../core/enums.js';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  bookingDate: Date;
  status: BookingStatus;
  totalPrice: number;
  priceUnit?: PriceUnit;
  notes?: string;
  images?: string[];
  address: string;
  isReviewed?: boolean;
  messages: IMessage[];
}


const bookingSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    totalPrice: { type: Number, required: true },
    priceUnit: {
      type: String,
      enum: Object.values(PriceUnit),
      default: PriceUnit.HOUR,
    },
    notes: { type: String, default: '' },
    images: [{ type: String }],
    address: { type: String, required: true },
    isReviewed: { type: Boolean, default: false },
    messages: [

      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', bookingSchema);

