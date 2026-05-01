import { z } from 'zod';

export const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    budget: z.number().optional(),
    priceUnit: z.string().optional(),
  }),
});

export const acceptRequestSchema = z.object({
  body: z.object({
    price: z.number().min(0, 'Price must be positive'),
  }),
});

export const placeBidSchema = z.object({
  body: z.object({
    price: z.number().min(0, 'Price must be positive'),
    message: z.string().optional(),
  }),
});
