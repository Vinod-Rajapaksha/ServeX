import { z } from 'zod';

export const categoryFormSchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().min(5, 'Description is required'),
  iconName: z.string().optional(),
  iconImage: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
