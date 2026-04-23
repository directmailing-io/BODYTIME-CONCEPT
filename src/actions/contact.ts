'use server';

import { sendMail } from '@/lib/email/mailer';
import { b2cContactEmail, b2bContactEmail } from '@/lib/email/templates';

const CONTACT_EMAIL = 'onboarding@resend.dev'; // TODO: change to info@bodytime-fitness.de once domain is verified in Resend

export interface ContactResult {
  success: boolean;
  error?: string;
}

export async function submitB2CContact(data: {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_country: string;
}): Promise<ContactResult> {
  const { first_name, last_name, phone } = data;
  if (!first_name?.trim() || !last_name?.trim() || !phone?.trim()) {
    return { success: false, error: 'Bitte alle Pflichtfelder ausfüllen.' };
  }
  // Fire email but never let it block the success response
  const template = b2cContactEmail(data);
  sendMail({ to: CONTACT_EMAIL, subject: template.subject, html: template.html })
    .catch(err => console.error('[submitB2CContact] email failed:', err));
  return { success: true };
}

export async function submitB2BContact(data: {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  phone_country: string;
  employment_status?: string;
  business_area?: string;
  business_area_custom?: string;
}): Promise<ContactResult> {
  const { first_name, last_name, phone } = data;
  if (!first_name?.trim() || !last_name?.trim() || !phone?.trim()) {
    return { success: false, error: 'Bitte alle Pflichtfelder ausfüllen.' };
  }
  // Fire email but never let it block the success response
  const template = b2bContactEmail(data);
  sendMail({ to: CONTACT_EMAIL, subject: template.subject, html: template.html })
    .catch(err => console.error('[submitB2BContact] email failed:', err));
  return { success: true };
}
