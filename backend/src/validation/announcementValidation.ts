import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    image: z.string().optional(),
    targetAudience: z.enum(['ALL', 'CUSTOMER', 'PROVIDER']).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().optional().nullable(),
  }),
});

export const updateAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').optional(),
    content: z.string().min(1, 'Content is required').optional(),
    image: z.string().optional(),
    targetAudience: z.enum(['ALL', 'CUSTOMER', 'PROVIDER']).optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().optional().nullable(),
  }),
});
