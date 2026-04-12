import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  iconName?: string;
  iconImage?: string;
}


const categorySchema: Schema = new Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], unique: true },
    description: { type: String },
    iconName: { type: String },
    iconImage: { type: String },
  },

  { timestamps: true }
);

export default mongoose.model<ICategory>('Category', categorySchema);
