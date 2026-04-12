import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../core/appError.js';
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const uploadImage = async (file: string, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `servex/${folder}`,
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw new AppError('Image upload failed', 500);
  }
};

export const deleteImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed', error);
  }
};
