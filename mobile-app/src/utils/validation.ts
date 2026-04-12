import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  role: z.enum(['USER', 'PROVIDER']),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const serviceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  priceUnit: z.enum(['Hour', 'Day', 'Week', 'Month', 'Year']),
  categoryId: z.string().min(1, 'Please select a category'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0), 'Budget must be a positive number').optional(),
  priceUnit: z.enum(['Hour', 'Day', 'Week', 'Month', 'Year']),
});

export type RequestFormData = z.infer<typeof requestSchema>;
