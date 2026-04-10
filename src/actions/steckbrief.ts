'use server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { steckbriefSchema } from '@/lib/validations/steckbrief';
import type { ActionResult } from '@/types';

async function getPartner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  return { user, supabase };
}

export async function upsertSteckbriefAction(
  formData: FormData,
  submit: boolean,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, supabase } = await getPartner();

    // Parse array fields from JSON (FormData doesn't support arrays natively)
    let services: string[] = [];
    let training_modes: string[] = [];
    try {
      services = JSON.parse(formData.get('services') as string || '[]');
      training_modes = JSON.parse(formData.get('training_modes') as string || '[]');
    } catch {
      return { success: false, error: 'Ungültige Eingabe.' };
    }

    const raw = {
      contact_first_name: formData.get('contact_first_name') || '',
      contact_last_name:  formData.get('contact_last_name') || '',
      contact_email:      formData.get('contact_email') || '',
      contact_phone:      formData.get('contact_phone') || '',
      contact_zip:        formData.get('contact_zip') || '',
      contact_city:       formData.get('contact_city') || '',
      philosophy:         formData.get('philosophy') || '',
      social_instagram:   formData.get('social_instagram') || '',
      social_facebook:    formData.get('social_facebook') || '',
      social_youtube:     formData.get('social_youtube') || '',
      social_linkedin:    formData.get('social_linkedin') || '',
      social_tiktok:      formData.get('social_tiktok') || '',
      image_url:          formData.get('image_url') || '',
      services,
      training_modes,
    };

    const parsed = steckbriefSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    // Fetch existing row to determine status transition
    const { data: existing } = await supabase
      .from('bt_steckbriefe')
      .select('id, status')
      .eq('partner_id', user.id)
      .maybeSingle();

    const currentStatus = existing?.status ?? 'draft';

    let newStatus: string;
    if (submit) {
      newStatus = 'pending';
    } else if (currentStatus === 'approved' || currentStatus === 'rejected') {
      newStatus = 'pending';
    } else {
      newStatus = 'draft';
    }

    const payload = {
      partner_id:         user.id,
      status:             newStatus,
      rejection_reason:   newStatus === 'pending' ? null : undefined,
      submitted_at:       newStatus === 'pending' && currentStatus !== 'pending'
                            ? new Date().toISOString()
                            : undefined,
      contact_first_name: parsed.data.contact_first_name || null,
      contact_last_name:  parsed.data.contact_last_name || null,
      contact_email:      parsed.data.contact_email || null,
      contact_phone:      parsed.data.contact_phone || null,
      contact_zip:        parsed.data.contact_zip || null,
      contact_city:       parsed.data.contact_city || null,
      services:           parsed.data.services,
      training_modes:     parsed.data.training_modes,
      philosophy:         parsed.data.philosophy || null,
      social_instagram:   parsed.data.social_instagram || null,
      social_facebook:    parsed.data.social_facebook || null,
      social_youtube:     parsed.data.social_youtube || null,
      social_linkedin:    parsed.data.social_linkedin || null,
      social_tiktok:      parsed.data.social_tiktok || null,
      image_url:          parsed.data.image_url || null,
    };

    let id: string;

    if (existing) {
      const { error } = await supabase
        .from('bt_steckbriefe')
        .update(payload)
        .eq('id', existing.id);
      if (error) {
        console.error('[upsertSteckbrief] update error', error);
        return { success: false, error: 'Steckbrief konnte nicht gespeichert werden.' };
      }
      id = existing.id;
    } else {
      const { data: inserted, error } = await supabase
        .from('bt_steckbriefe')
        .insert(payload)
        .select('id')
        .single();
      if (error || !inserted) {
        console.error('[upsertSteckbrief] insert error', error);
        return { success: false, error: 'Steckbrief konnte nicht erstellt werden.' };
      }
      id = inserted.id;
    }

    revalidatePath('/partner/steckbrief');
    return { success: true, data: { id } };
  } catch (err) {
    console.error('[upsertSteckbriefAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function uploadSteckbriefImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { user } = await getPartner();
    // Use admin client for storage to bypass RLS — path is always scoped to user.id
    const adminClient = createAdminClient();

    const file = formData.get('image') as File | null;
    if (!file || file.size === 0) return { success: false, error: 'Keine Datei ausgewählt.' };

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      return { success: false, error: 'Nur JPG, PNG und WebP erlaubt.' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Datei darf max. 5 MB groß sein.' };
    }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filePath = `${user.id}/profile.${ext}`;

    // Convert File to ArrayBuffer for reliable upload in server actions
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from('bt_steckbriefe')
      .upload(filePath, buffer, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('[uploadSteckbriefImage] storage error', uploadError);
      return { success: false, error: `Upload fehlgeschlagen: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('bt_steckbriefe')
      .getPublicUrl(filePath);

    const url = `${publicUrl}?t=${Date.now()}`;
    return { success: true, data: { url } };
  } catch (err) {
    console.error('[uploadSteckbriefImageAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deleteSteckbriefAction(): Promise<ActionResult> {
  try {
    const { user, supabase } = await getPartner();
    const adminClient = createAdminClient();

    // Remove all possible image variants from storage
    await adminClient.storage
      .from('bt_steckbriefe')
      .remove([`${user.id}/profile.jpg`, `${user.id}/profile.png`, `${user.id}/profile.webp`]);

    const { error } = await supabase
      .from('bt_steckbriefe')
      .delete()
      .eq('partner_id', user.id);

    if (error) return { success: false, error: 'Löschen fehlgeschlagen.' };

    revalidatePath('/partner/steckbrief');
    return { success: true };
  } catch (err) {
    console.error('[deleteSteckbriefAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
