import Service from '../../database/models/Service.js';
import { AppError } from '../../core/appError.js';
import { uploadImage } from '../../utils/cloudinary.js';

export const getAllServices = async (filter: any = {}) => {
  return await Service.find(filter).populate('providerId', 'name profileImage').populate('categoryId', 'name');
};

export const getServiceById = async (id: string) => {
  const service = await Service.findById(id).populate('providerId', 'name profileImage').populate('categoryId', 'name');
  if (!service) throw new AppError('Service not found', 404);
  return service;
};

export const createService = async (serviceData: any) => {
  if (serviceData.images && serviceData.images.length > 0) {
    const uploadedImages = [];
    for (const img of serviceData.images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img, 'services');
        uploadedImages.push(url);
      } else {
        uploadedImages.push(img);
      }
    }
    serviceData.images = uploadedImages;
  }
  return await Service.create(serviceData);
};

export const updateService = async (id: string, serviceData: any, providerId: string) => {
  const service = await Service.findOne({ _id: id, providerId });
  if (!service) throw new AppError('Service not found or you do not have permission', 404);

  if (serviceData.images && serviceData.images.length > 0) {
    const uploadedImages = [];
    for (const img of serviceData.images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img, 'services');
        uploadedImages.push(url);
      } else {
        uploadedImages.push(img);
      }
    }
    serviceData.images = uploadedImages;
  }
  
  Object.assign(service, serviceData);
  await service.save();
  return service;
};

export const deleteService = async (id: string, providerId: string) => {
  const service = await Service.findOneAndDelete({ _id: id, providerId });
  if (!service) throw new AppError('Service not found or you do not have permission', 404);
  return service;
};
