import Booking from '../../database/models/Booking.js';
import Request from '../../database/models/Request.js';
import { AppError } from '../../core/appError.js';
import { BookingStatus, UserRole, RequestStatus } from '../../core/enums.js';
import { deleteImage } from '../../utils/cloudinary.js';

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

export const createBooking = async (bookingData: any) => {

  return await Booking.create(bookingData);
};

export const getMyBookings = async (userId: string, role: UserRole) => {
  const query = role === UserRole.PROVIDER ? { providerId: userId } : { userId };
  return await Booking.find(query)
    .populate('serviceId', 'title images')
    .populate('userId', 'name phone email address')
    .populate('providerId', 'name phone email address')
    .sort({ createdAt: -1 });
};

export const getBookingById = async (id: string, userId: string, role: UserRole) => {
  const booking = await Booking.findById(id)
    .populate('serviceId', 'title images')
    .populate('userId', 'name phone email address')
    .populate('providerId', 'name phone email address');

  if (!booking) throw new AppError('Booking not found', 404);

  if (role === UserRole.USER && booking.userId._id.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to view this booking', 403);
  } else if (role === UserRole.PROVIDER && booking.providerId._id.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to view this booking', 403);
  }

  return booking;
};

export const updateBooking = async (id: string, updateData: { status?: BookingStatus, notes?: string }, userId: string, role: UserRole) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (role === UserRole.USER && booking.userId.toString() !== userId.toString()) {
    if (updateData.status && updateData.status !== BookingStatus.CANCELLED) {
      throw new AppError('You can only cancel your own bookings', 403);
    }
  } else if (role === UserRole.PROVIDER && booking.providerId.toString() !== userId.toString()) {
    throw new AppError('You can only manage your own service bookings', 403);
  }

  if (role === UserRole.PROVIDER) {
    if (updateData.status === BookingStatus.CANCELLED && booking.status !== BookingStatus.PENDING) {
      throw new AppError('You can only cancel bookings that are still pending', 400);
    }
  }

  if (updateData.status) {
    booking.status = updateData.status;

    if (updateData.status === BookingStatus.COMPLETED && (booking as any).requestId) {
      await Request.findByIdAndUpdate((booking as any).requestId, {
        status: RequestStatus.RESOLVED,
      });
    }
  }

  if (updateData.notes !== undefined) {
    booking.notes = updateData.notes;
  }

  await booking.save();
  return booking;
};

export const updateBookingStatus = async (id: string, status: BookingStatus, userId: string, role: UserRole) => {
  return await updateBooking(id, { status }, userId, role);
};

export const deleteBooking = async (id: string, userId: string, role: UserRole) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this booking', 403);
  }
  if (booking.status !== BookingStatus.PENDING) {
    throw new AppError('You can only delete bookings that are still pending', 400);
  }

  if (booking.images && booking.images.length > 0) {
    for (const imageUrl of booking.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }
  }

  await Booking.findByIdAndDelete(id);
  return { id };
};

export const addMessage = async (bookingId: string, userId: string, text: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  booking.messages.push({
    senderId: userId as any,
    text,
    createdAt: new Date()
  });

  await booking.save();
  return booking;
};