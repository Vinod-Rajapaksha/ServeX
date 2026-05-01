import { z } from 'zod';

export const bookingSchema = z.object({
  notes: z.string().min(5, 'Please describe what needs to be done (min 5 characters)'),
  address: z.string().min(5, 'Address is required and must be detailed'),
  useDefaultAddress: z.boolean(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
