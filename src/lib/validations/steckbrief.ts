import { z } from 'zod';

const optionalUrl = z.string().url('Bitte eine gültige URL eingeben').or(z.literal('')).optional();

export const steckbriefSchema = z.object({
  contact_first_name: z.string().max(100).optional().or(z.literal('')),
  contact_last_name:  z.string().max(100).optional().or(z.literal('')),
  contact_email:      z.string().email('Ungültige E-Mail').optional().or(z.literal('')),
  contact_phone:      z.string().max(50).optional().or(z.literal('')),
  contact_zip:        z.string().max(20).optional().or(z.literal('')),
  contact_city:       z.string().max(100).optional().or(z.literal('')),
  services:           z.array(z.string().min(1).max(100)).max(30),
  training_modes:     z.array(z.enum(['online', 'offline'])).min(0),
  philosophy:         z.string().max(2000).optional().or(z.literal('')),
  social_instagram:   optionalUrl,
  social_facebook:    optionalUrl,
  social_youtube:     optionalUrl,
  social_linkedin:    optionalUrl,
  social_tiktok:      optionalUrl,
  image_url:          z.string().optional().or(z.literal('')),
});

export type SteckbriefInput = z.infer<typeof steckbriefSchema>;
