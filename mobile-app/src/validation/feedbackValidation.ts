import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating'),
  comment: z.string().min(4, 'Comment must be at least 4 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
