import { z } from 'zod';
import { BookingStatus } from '../core/enums.js';

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    providerId: z.string().min(1, 'Provider ID is required'),
    bookingDate: z.string().min(1, 'Booking date is required'),
    totalPrice: z.number().min(0, 'Total price must be positive'),
    notes: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    notes: z.string().optional(),
  }),
});
