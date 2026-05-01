import Feedback from '../../database/models/Feedback.js';
import Service from '../../database/models/Service.js';
import User from '../../database/models/User.js';
import Booking from '../../database/models/Booking.js';
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

const updateRatings = async (serviceId?: any, providerId?: any) => {
  if (serviceId) {
    const serviceStats = await Feedback.aggregate([
      { $match: { serviceId } },
      {
        $group: {
          _id: '$serviceId',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (serviceStats.length > 0) {
      await Service.findByIdAndUpdate(serviceId, {
        rating: serviceStats[0].avgRating,
        numReviews: serviceStats[0].nRating,
      });
    } else {
      await Service.findByIdAndUpdate(serviceId, { rating: 0, numReviews: 0 });
    }
  }

  if (providerId) {
    const providerStats = await Feedback.aggregate([
      { $match: { providerId } },
      {
        $group: {
          _id: '$providerId',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (providerStats.length > 0) {
      await User.findByIdAndUpdate(providerId, {
        rating: providerStats[0].avgRating,
        numReviews: providerStats[0].nRating,
      });
    } else {
      await User.findByIdAndUpdate(providerId, { rating: 0, numReviews: 0 });
    }
  }
};

export const addFeedback = async (feedbackData: any) => {
  const existingFeedback = await Feedback.findOne({ bookingId: feedbackData.bookingId });
  if (existingFeedback) throw new AppError('You have already reviewed this booking', 400);

  if (feedbackData.images && feedbackData.images.length > 0) {
    const uploadedImages = [];
    for (const img of feedbackData.images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img, 'feedbacks');
        uploadedImages.push(url);
      } else {
        uploadedImages.push(img);
      }
    }
    feedbackData.images = uploadedImages;
  }

  const feedback = await Feedback.create(feedbackData);
  await updateRatings(feedback.serviceId, feedback.providerId);
  await Booking.findByIdAndUpdate(feedback.bookingId, { isReviewed: true });

  return feedback;
};

export const updateFeedback = async (id: string, userId: string, updateData: any) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new AppError('Feedback not found', 404);
  if (feedback.userId.toString() !== userId.toString()) {
    throw new AppError('You can only update your own feedback', 403);
  }

  if (updateData.images && updateData.images.length > 0) {
    const uploadedImages = [];
    for (const img of updateData.images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img, 'feedbacks');
        uploadedImages.push(url);
      } else {
        uploadedImages.push(img);
      }
    }
    updateData.images = uploadedImages;
  }

  const updatedFeedback = await Feedback.findByIdAndUpdate(id, updateData, { new: true });
  await updateRatings(updatedFeedback?.serviceId, updatedFeedback?.providerId);

  return updatedFeedback;
};

export const deleteFeedback = async (id: string, userId: string) => {
  const feedback = await Feedback.findById(id);
  if (!feedback) throw new AppError('Feedback not found', 404);
  if (feedback.userId.toString() !== userId.toString()) {
    throw new AppError('You can only delete your own feedback', 403);
  }

  if (feedback.images && feedback.images.length > 0) {
    for (const imgUrl of feedback.images) {
      const publicId = extractPublicId(imgUrl);
      if (publicId) await deleteImage(publicId);
    }
  }

  await Feedback.findByIdAndDelete(id);
  await updateRatings(feedback.serviceId, feedback.providerId);
  await Booking.findByIdAndUpdate(feedback.bookingId, { isReviewed: false });

  return { id };
};

export const getServiceFeedback = async (serviceId: string) => {
  return await Feedback.find({ serviceId }).populate('userId', 'name profileImage');
};

export const getProviderFeedback = async (providerId: string) => {
  return await Feedback.find({ providerId }).populate('userId', 'name profileImage');
};
