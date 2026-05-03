import Request from '../../database/models/Request.js';
import Booking from '../../database/models/Booking.js';
import { AppError } from '../../core/appError.js';
import { RequestStatus, BidStatus, BookingStatus } from '../../core/enums.js';
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

export const createRequest = async (requestData: any) => {
  if (requestData.images && requestData.images.length > 0) {
    const uploadedImages = [];
    for (const img of requestData.images) {
      if (img.startsWith('data:image')) {
        const url = await uploadImage(img, 'requests');
        uploadedImages.push(url);
      } else {
        uploadedImages.push(img);
      }
    }
    requestData.images = uploadedImages;
  }
  return await Request.create(requestData);
};

export const getMyRequests = async (userId: string) => {
  return await Request.find({ userId })
    .populate('providerId', 'name phone')
    .populate('bids.providerId', 'name phone profileImage')
    .sort('-createdAt');
};

export const getOpenRequests = async () => {
  return await Request.find({ status: RequestStatus.OPEN })
    .populate('userId', 'name phone profileImage')
    .sort('-createdAt');
};

export const getAllRequests = async () => {
  return await Request.find().populate('userId providerId', 'name email phone').sort('-createdAt');
};

export const placeBid = async (requestId: string, providerId: string, bidData: any) => {
  const request = await Request.findById(requestId);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== RequestStatus.OPEN) throw new AppError('Request is no longer open', 400);

  const existingBid = request.bids.find(b => b.providerId.toString() === providerId);
  if (existingBid) throw new AppError('You have already placed a bid on this request', 400);

  request.bids.push({
    providerId: providerId as any,
    price: bidData.price,
    priceUnit: bidData.priceUnit,
    message: bidData.message,
    status: BidStatus.PENDING,
    createdAt: new Date()
  } as any);

  await request.save();
  return request;
};

export const acceptBid = async (requestId: string, bidId: string, userId: string) => {
  const request = await Request.findOne({ _id: requestId, userId });
  if (!request) throw new AppError('Request not found or unauthorized', 404);
  if (request.status !== RequestStatus.OPEN) throw new AppError('Request is no longer open', 400);

  const bidIndex = request.bids.findIndex(b => b._id.toString() === bidId);
  if (bidIndex === -1) throw new AppError('Bid not found', 404);

  const bid = request.bids[bidIndex];

  request.bids.forEach((b, i) => {
    if (i === bidIndex) {
      b.status = BidStatus.ACCEPTED;
    } else {
      b.status = BidStatus.REJECTED;
    }
  });

  request.status = RequestStatus.IN_PROGRESS;
  request.providerId = bid.providerId;
  request.price = bid.price;
  request.priceUnit = bid.priceUnit;

  await request.save();

  const booking = await Booking.create({
    userId: request.userId,
    providerId: bid.providerId,
    requestId: request._id,
    totalPrice: bid.price,
    priceUnit: bid.priceUnit,
    status: BookingStatus.CONFIRMED,
    bookingDate: new Date(),
    address: 'Will be provided by customer',
  });


  return { request, booking };
};

export const acceptRequest = async (id: string, providerId: string, price: number) => {
  const request = await Request.findById(id);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== RequestStatus.OPEN) throw new AppError('Request is no longer open', 400);

  request.status = RequestStatus.IN_PROGRESS;
  request.providerId = providerId as any;
  request.price = price;

  await request.save();
  return request;
};

export const updateRequestStatus = async (id: string, status: RequestStatus) => {
  const request = await Request.findByIdAndUpdate(id, { status }, { new: true });
  if (!request) throw new AppError('Request not found', 404);
  return request;
};

export const deleteRequest = async (id: string, userId: string) => {
  const request = await Request.findById(id);
  if (!request) throw new AppError('Request not found', 404);

  if (request.userId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to delete this request', 403);
  }

  if (request.status !== RequestStatus.OPEN) {
    throw new AppError('You can only delete requests that are still open', 400);
  }

  if (request.images && request.images.length > 0) {
    for (const imageUrl of request.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }
  }

  await Request.findByIdAndDelete(id);
  return { id };
};
