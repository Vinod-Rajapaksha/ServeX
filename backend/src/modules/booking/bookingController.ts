import { Response, NextFunction } from 'express';
import * as bookingService from './bookingService.js';
import { sendResponse } from '../../core/responseFormatter.js';
import { uploadImage } from '../../utils/cloudinary.js';

export const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { images, ...rest } = req.body;
    let uploadedImages: string[] = [];

    if (images && Array.isArray(images)) {
      uploadedImages = await Promise.all(
        images.map((img: string) => uploadImage(img, 'bookings'))
      );
    }

    const bookingData = { ...rest, images: uploadedImages, userId: req.user._id };
    const result = await bookingService.createBooking(bookingData);
    sendResponse(res, 201, result, 'Booking created successfully');
  } catch (error) {
    next(error);
  }
};

export const getMy = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.getMyBookings(req.user._id, req.user.role);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.getBookingById(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    const result = await bookingService.updateBooking(
      req.params.id,
      { status, notes },
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, result, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: any, res: Response, next: NextFunction) => {
  return update(req, res, next);
};

export const remove = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await bookingService.deleteBooking(req.params.id, req.user._id, req.user.role);
    sendResponse(res, 200, result, 'Booking deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const result = await bookingService.addMessage(req.params.id, req.user._id, text);
    sendResponse(res, 201, result, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};
