/**
 * Nodemailer transporter configuration.
 * All credentials come from server-side environment variables only.
 * Never import this file in client components.
 */
import nodemailer, { type Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export const FROM_ADDRESS = `"${process.env.SMTP_FROM_NAME ?? 'BODYTIME concept'}" <${process.env.SMTP_FROM_EMAIL ?? 'noreply@bodytime-concept.de'}>`;

/** Send a pre-built mail options object; throws on failure */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const t = getTransporter();
  await t.sendMail({
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? options.html.replace(/<[^>]+>/g, ''),
  });
}
