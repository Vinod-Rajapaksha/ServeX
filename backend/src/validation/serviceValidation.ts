import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().min(0, 'Price must be positive'),
    priceUnit: z.string().min(1, 'Price unit is required'),
    categoryId: z.string().min(1, 'Category is required'),
    images: z.array(z.string()).optional(),
  }),
});

export const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    priceUnit: z.string().optional(),
    categoryId: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});
