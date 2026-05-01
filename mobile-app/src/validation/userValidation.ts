import { z } from 'zod';
import { UserRole } from '../core/enums';

export const userFormSchema = z.object({
  name: z.string().min(1, 'Full Name is required').min(4, 'Full Name must be at least 4 characters'),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  password: z.string().optional(),
  role: z.nativeEnum(UserRole),
  phone: z.string().min(1, 'Phone number is required').min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(1, 'Address is required').min(5, 'Address must be at least 5 characters'),
  id: z.string().optional(),
}).superRefine(({ password, id }, ctx) => {
  if (!id && (!password || password.length < 8)) {
    ctx.addIssue({
      code: "custom",
      message: "Password is required and must be at least 8 characters",
      path: ["password"],
    });
  } else if (password && password.length > 0 && password.length < 8) {
    ctx.addIssue({
      code: "custom",
      message: "Password must be at least 8 characters",
      path: ["password"],
    });
  }
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').or(z.literal('')),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters').or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
