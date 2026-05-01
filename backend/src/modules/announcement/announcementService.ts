import Announcement from '../../database/models/Announcement.js';
import { AppError } from '../../core/appError.js';
import { uploadImage, deleteImage } from '../../utils/cloudinary.js';

const extractPublicId = (url: string) => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
    return publicIdWithExt.split('.')[0];
  } catch (error) {
    return null;
  }
};

export const createAnnouncement = async (data: any) => {
  if (data.image && data.image.startsWith('data:image')) {
    data.image = await uploadImage(data.image, 'announcements');
  }
  return await Announcement.create(data);
};

export const updateAnnouncement = async (id: string, data: any) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) throw new AppError('Announcement not found', 404);

  if (data.image && data.image.startsWith('data:image')) {
    if (announcement.image) {
      const publicId = extractPublicId(announcement.image);
      if (publicId) await deleteImage(publicId);
    }
    data.image = await uploadImage(data.image, 'announcements');
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return updatedAnnouncement;
};

export const getAllAnnouncements = async () => {
  return await Announcement.find().populate('createdBy', 'name').sort('-createdAt');
};

export const getAnnouncementsByRole = async (role: string) => {
  const now = new Date();
  return await Announcement.find({
    targetAudience: { $in: [role as any, 'ALL'] },

    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  }).sort('-createdAt');
};

export const deleteAnnouncement = async (id: string) => {
  const announcement = await Announcement.findById(id);
  if (!announcement) throw new AppError('Announcement not found', 404);

  if (announcement.image) {
    const publicId = extractPublicId(announcement.image);
    if (publicId) await deleteImage(publicId);
  }

  await Announcement.findByIdAndDelete(id);
  return announcement;
};
