import { z } from 'zod';

export const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  priceUnit: z.enum(['Hour', 'Day', 'Week', 'Month', 'Year']),
  categoryId: z.string().min(1, 'Please select a category'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
