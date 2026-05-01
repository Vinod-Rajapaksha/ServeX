import { z } from 'zod';

export const announcementFormSchema = z.object({
  title: z.string().min(1, 'Title is required').min(3, 'Title must be at least 3 characters'),
  content: z.string().min(1, 'Content is required').min(10, 'Content must be at least 10 characters'),
  targetAudience: z.enum(['ALL', 'CUSTOMER', 'PROVIDER']),
  isActive: z.boolean().optional(),
  expiresAt: z.date().optional().nullable(),
  image: z.string().optional(),
});

export type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
