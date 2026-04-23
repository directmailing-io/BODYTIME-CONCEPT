/**
 * Email sending via Resend API.
 * All credentials come from server-side environment variables only.
 * Never import this file in client components.
 */
import { Resend } from 'resend';

const FROM_ADDRESS = 'onboarding@resend.dev';

/** Send a pre-built mail options object; throws on failure */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  if (error) throw new Error(error.message);
}
