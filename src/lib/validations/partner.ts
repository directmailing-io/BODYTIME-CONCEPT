import { z } from 'zod';

export const createPartnerSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich').max(100),
  last_name: z.string().min(1, 'Nachname ist erforderlich').max(100),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  // Optional: admin can set a password directly, or leave empty to send invite
  password: z
    .string()
    .min(8, 'Mindestens 8 Zeichen')
    .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
    .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe')
    .regex(/[0-9]/, 'Mindestens eine Zahl')
    .optional()
    .or(z.literal('')),
  send_invite: z.boolean(),
});

export const updatePartnerProfileSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich').max(100),
  last_name: z.string().min(1, 'Nachname ist erforderlich').max(100),
  company_name: z.string().max(200).optional().or(z.literal('')),
  address_street: z.string().max(200).optional().or(z.literal('')),
  address_zip: z.string().max(20).optional().or(z.literal('')),
  address_city: z.string().max(100).optional().or(z.literal('')),
  address_country: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerProfileInput = z.infer<typeof updatePartnerProfileSchema>;
