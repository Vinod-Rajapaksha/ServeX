import Category from '../../database/models/Category.js';
import { AppError } from '../../core/appError.js';
import { uploadImage } from '../../utils/cloudinary.js';

export const getAllCategories = async () => {
  return await Category.find();
};

export const getCategoryById = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

export const createCategory = async (categoryData: any) => {
  if (categoryData.iconImage && categoryData.iconImage.startsWith('data:image')) {
    categoryData.iconImage = await uploadImage(categoryData.iconImage, 'categories');
  }
  return await Category.create(categoryData);
};

export const updateCategory = async (id: string, categoryData: any) => {
  if (categoryData.iconImage && categoryData.iconImage.startsWith('data:image')) {
    categoryData.iconImage = await uploadImage(categoryData.iconImage, 'categories');
  }
  const category = await Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);
  return category;
};

export const deleteCategory = async (id: string) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new AppError('Category not found', 404);
  return category;
};
