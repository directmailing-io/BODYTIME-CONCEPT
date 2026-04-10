import { z } from 'zod';

const RENTAL_DURATIONS = [3, 6, 12, 24] as const;
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;
const SALUTATIONS = ['Herr', 'Frau', 'Divers'] as const;

export const customerSchema = z.object({
  salutation: z.enum(SALUTATIONS).optional().nullable(),
  first_name: z.string().min(1, 'Vorname ist erforderlich').max(100),
  last_name: z.string().min(1, 'Nachname ist erforderlich').max(100),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().max(50).optional().or(z.literal('')),
  birth_date: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      'Ungültiges Datumsformat (YYYY-MM-DD)',
    ),
  address_street: z.string().max(200).optional().or(z.literal('')),
  address_zip: z.string().max(20).optional().or(z.literal('')),
  address_city: z.string().max(100).optional().or(z.literal('')),
  order_date: z
    .string()
    .min(1, 'Bestelldatum ist erforderlich')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  rental_duration_months: z.union([z.literal(3), z.literal(6), z.literal(12), z.literal(24)]).refine(Boolean, 'Ungültige Mietlaufzeit'),
  ems_suit_type: z.string().max(100).optional().or(z.literal('')),
  size_top: z.enum(CLOTHING_SIZES).optional().nullable(),
  size_pants: z.enum(CLOTHING_SIZES).optional().nullable(),
  notes: z.string().max(2000).optional().or(z.literal('')),
  order_number: z.string().max(100).optional().nullable().or(z.literal('')),
});

export const renewalSchema = z.object({
  order_date: z
    .string()
    .min(1, 'Verlängerungsdatum ist erforderlich')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  rental_duration_months: z.union([z.literal(3), z.literal(6), z.literal(12), z.literal(24)]).refine(Boolean, 'Ungültige Mietlaufzeit'),
  change_notes: z.string().max(500).optional().or(z.literal('')),
});

export const crmNoteSchema = z.object({
  note: z.string().min(1, 'Notiz ist erforderlich').max(2000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type RenewalInput = z.infer<typeof renewalSchema>;
export type CrmNoteInput = z.infer<typeof crmNoteSchema>;
