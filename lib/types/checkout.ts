import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['COD', 'ONLINE']);

export const CustomerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,16}$/, 'Enter a valid phone number'),
  shippingAddress: z.string().min(5, 'Shipping address is required'),
  note: z.string().optional().nullable(),
  paymentMethod: PaymentMethodSchema
});

export type CustomerFormValues = z.infer<typeof CustomerFormSchema>;

export const SettingsSchema = z.object({
  deliveryCost: z.number().optional()
});
export type Settings = z.infer<typeof SettingsSchema>;
