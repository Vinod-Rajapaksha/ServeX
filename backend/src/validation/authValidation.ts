import { z } from 'zod';
import { UserRole } from '../core/enums.js';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    phone: z.string().min(1, 'Phone number is required').min(10, 'Phone number must be at least 10 characters'),
    address: z.string().min(1, 'Address is required').min(5, 'Address must be at least 5 characters'),
    role: z.nativeEnum(UserRole).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});
