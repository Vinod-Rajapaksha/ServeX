import { z } from 'zod';

export const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0), 'Budget must be a positive number').optional(),
  priceUnit: z.enum(['Hour', 'Day', 'Week', 'Month', 'Year']),
});

export type RequestFormData = z.infer<typeof requestSchema>;
