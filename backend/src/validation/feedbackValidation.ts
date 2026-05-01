import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service ID is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(1, 'Comment is required'),
    images: z.array(z.string()).optional(),
  }),
});

export const updateFeedbackSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});
