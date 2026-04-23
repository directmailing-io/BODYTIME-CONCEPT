'use server';
/**
 * Auth Server Actions
 * All sensitive operations happen server-side only.
 * Passwords are never sent to the client; tokens are managed by Supabase.
 */
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations/auth';
import { sendMail } from '@/lib/email/mailer';
import { resetPasswordEmail } from '@/lib/email/templates';
import type { ActionResult } from '@/types';

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Ungültige Eingaben.' };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Check whether this email belongs to a deactivated account before showing the generic error.
    // We use the admin client so we can query by email without exposing user enumeration in
    // the happy-path (only triggered on auth failure).
    const { createAdminClient } = await import('@/lib/supabase/server');
    const adminClient = createAdminClient();
    const { data: userList } = await adminClient.auth.admin.listUsers();
    const authUser = userList?.users?.find(
      (u: { email?: string; id: string }) => u.email?.toLowerCase() === parsed.data.email.toLowerCase(),
    );
    if (authUser) {
      const { data: profile } = await adminClient
        .from('bt_profiles')
        .select('is_active')
        .eq('id', authUser.id)
        .maybeSingle();
      if (profile && !profile.is_active) {
        return {
          success: false,
          error: 'Dein Konto wurde vorübergehend deaktiviert. Bitte wende dich an einen Administrator.',
        };
      }
    }
    return {
      success: false,
      error: 'E-Mail oder Passwort ist falsch. Bitte versuchen Sie es erneut.',
    };
  }

  // Check if account is active (covers is_active flag even when Supabase auth still works)
  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single();

  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'Dein Konto wurde vorübergehend deaktiviert. Bitte wende dich an einen Administrator.',
    };
  }

  const destination =
    profile?.role === 'admin' ? '/admin/dashboard' : '/partner/dashboard';

  revalidatePath('/', 'layout');
  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return { success: false, error: 'Ungültige E-Mail-Adresse.' };
  }

  // Generate reset link via admin API, then send via our custom mailer (Resend)
  const adminClient = createAdminClient();
  const { data: linkData, error } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email: parsed.data.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/reset-password`,
    },
  });

  // Always return success to prevent email enumeration
  if (error) {
    console.error('[forgotPassword] generateLink error:', error);
  } else if (linkData?.properties?.action_link) {
    const template = resetPasswordEmail({ firstName: '', resetUrl: linkData.properties.action_link });
    sendMail({ to: parsed.data.email, subject: template.subject, html: template.html })
      .catch(err => console.error('[forgotPassword] sendMail error:', err));
  }

  return {
    success: true,
    data: undefined,
  };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Ungültige Eingaben.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: 'Passwort konnte nicht geändert werden.' };
  }

  return { success: true };
}
