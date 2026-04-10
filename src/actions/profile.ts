'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { updatePartnerProfileSchema } from '@/lib/validations/partner';
import { changePasswordSchema } from '@/lib/validations/auth';
import type { ActionResult } from '@/types';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  return { user, supabase };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const { user, supabase } = await getAuthUser();

    const raw = Object.fromEntries(formData.entries());
    const parsed = updatePartnerProfileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { first_name, last_name, ...partnerFields } = parsed.data;

    // Update base profile
    const { error: profileError } = await supabase
      .from('bt_profiles')
      .update({ first_name, last_name })
      .eq('id', user.id);

    if (profileError) return { success: false, error: 'Profil konnte nicht aktualisiert werden.' };

    // Upsert partner profile details
    const { error: ppError } = await supabase
      .from('bt_partner_profiles')
      .upsert({ user_id: user.id, ...partnerFields }, { onConflict: 'user_id' });

    if (ppError) return { success: false, error: 'Profildetails konnten nicht gespeichert werden.' };

    revalidatePath('/partner/profile');
    return { success: true };
  } catch (err) {
    console.error('[updateProfileAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await getAuthUser();

    const parsed = changePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    // Update password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (error) return { success: false, error: 'Passwort konnte nicht geändert werden.' };

    return { success: true };
  } catch (err) {
    console.error('[changePasswordAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const { user, supabase } = await getAuthUser();

    const file = formData.get('avatar') as File | null;
    if (!file) return { success: false, error: 'Keine Datei ausgewählt.' };

    // Security: validate file type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Nur JPG, PNG und WebP-Dateien erlaubt.' };
    }

    // Security: validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'Datei darf maximal 2 MB groß sein.' };
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filePath = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('bt_profiles')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) return { success: false, error: 'Upload fehlgeschlagen.' };

    const { data: { publicUrl } } = supabase.storage
      .from('bt_profiles')
      .getPublicUrl(filePath);

    // Add cache-busting to prevent stale browser caching of old avatar
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from('bt_profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    revalidatePath('/partner/profile');
    return { success: true, data: { url: avatarUrl } };
  } catch (err) {
    console.error('[uploadAvatarAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
