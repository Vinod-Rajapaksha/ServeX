import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  image?: string;
  targetAudience: 'CUSTOMER' | 'PROVIDER' | 'ALL';
  isActive: boolean;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const announcementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    targetAudience: { 
      type: String, 
      enum: ['CUSTOMER', 'PROVIDER', 'ALL'], 
      default: 'ALL' 
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },

  { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', announcementSchema);
