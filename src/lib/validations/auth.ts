import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mindestens 8 Zeichen')
      .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
      .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe')
      .regex(/[0-9]/, 'Mindestens eine Zahl'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Aktuelles Passwort ist erforderlich'),
    newPassword: z
      .string()
      .min(8, 'Mindestens 8 Zeichen')
      .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
      .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe')
      .regex(/[0-9]/, 'Mindestens eine Zahl'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
