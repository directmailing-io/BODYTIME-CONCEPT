'use server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { REFERRAL_BONUS_KEY } from '@/lib/constants';
import type { ActionResult } from '@/types';

// ── Auth helpers ────────────────────────────────────────────────────────────

async function requirePartner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  return { user, supabase };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') throw new Error('Keine Berechtigung');
  return { user, supabase };
}

// ── Partner: submit referral ────────────────────────────────────────────────

export async function submitReferralAction(formData: FormData): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    const first_name = String(formData.get('first_name') ?? '').trim();
    const last_name  = String(formData.get('last_name')  ?? '').trim();
    const phone      = String(formData.get('phone')      ?? '').trim();
    const email      = String(formData.get('email')      ?? '').trim();
    const note       = String(formData.get('note')       ?? '').trim() || null;

    if (!first_name || !last_name || !phone) {
      return { success: false, error: 'Bitte alle Pflichtfelder ausfüllen.' };
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Bitte eine gültige E-Mail-Adresse eingeben.' };
    }

    const { error } = await supabase
      .from('bt_referrals')
      .insert({ partner_id: user.id, first_name, last_name, phone, email, note });

    if (error) {
      console.error('[submitReferral]', error);
      return { success: false, error: 'Empfehlung konnte nicht gespeichert werden.' };
    }

    revalidatePath('/partner/empfehlung');
    return { success: true };
  } catch (err) {
    console.error('[submitReferralAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

// ── Admin: update referral status ───────────────────────────────────────────

export async function updateReferralStatusAction(
  referralId: string,
  status: 'eingegangen' | 'in_bearbeitung' | 'gewonnen' | 'kein_interesse',
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_referrals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', referralId);

    if (error) {
      console.error('[updateReferralStatus]', error);
      return { success: false, error: 'Status konnte nicht aktualisiert werden.' };
    }

    revalidatePath('/admin/empfehlungszentrale');
    revalidatePath(`/admin/empfehlungszentrale/${referralId}`);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[updateReferralStatusAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

// ── Admin: referral notes (add / update / delete) ───────────────────────────

export async function addReferralNoteAction(
  referralId: string,
  content: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: 'Notiz darf nicht leer sein.' };

    const { error } = await adminClient
      .from('bt_referral_notes')
      .insert({ referral_id: referralId, content: trimmed });

    if (error) {
      console.error('[addReferralNote]', error);
      return { success: false, error: 'Notiz konnte nicht gespeichert werden.' };
    }

    revalidatePath(`/admin/empfehlungszentrale/${referralId}`);
    return { success: true };
  } catch (err) {
    console.error('[addReferralNoteAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function updateReferralNoteAction(
  noteId: string,
  referralId: string,
  content: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();
    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: 'Notiz darf nicht leer sein.' };

    const { error } = await adminClient
      .from('bt_referral_notes')
      .update({ content: trimmed, updated_at: new Date().toISOString() })
      .eq('id', noteId);

    if (error) {
      console.error('[updateReferralNote]', error);
      return { success: false, error: 'Notiz konnte nicht aktualisiert werden.' };
    }

    revalidatePath(`/admin/empfehlungszentrale/${referralId}`);
    return { success: true };
  } catch (err) {
    console.error('[updateReferralNoteAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deleteReferralNoteAction(
  noteId: string,
  referralId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_referral_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('[deleteReferralNote]', error);
      return { success: false, error: 'Notiz konnte nicht gelöscht werden.' };
    }

    revalidatePath(`/admin/empfehlungszentrale/${referralId}`);
    return { success: true };
  } catch (err) {
    console.error('[deleteReferralNoteAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

// ── Admin: save referral bonus description ──────────────────────────────────

export async function updateReferralBonusAction(formData: FormData): Promise<ActionResult> {
  try {
    const { user } = await requireAdmin();
    const adminClient = createAdminClient();
    const bonus = String(formData.get('referral_bonus') ?? '').trim();

    const { data: existing } = await adminClient
      .from('bt_documents')
      .select('id')
      .eq('title', REFERRAL_BONUS_KEY)
      .maybeSingle();

    let dbError;
    if (existing) {
      ({ error: dbError } = await adminClient
        .from('bt_documents')
        .update({ file_url: bonus })
        .eq('id', existing.id));
    } else {
      ({ error: dbError } = await adminClient
        .from('bt_documents')
        .insert({
          title: REFERRAL_BONUS_KEY,
          type: 'link',
          file_url: bonus,
          is_published: true,
          created_by: user.id,
        }));
    }

    if (dbError) {
      console.error('[updateReferralBonus]', dbError);
      return { success: false, error: 'Einstellung konnte nicht gespeichert werden.' };
    }

    revalidatePath('/admin/empfehlungszentrale');
    revalidatePath('/partner/empfehlung');
    return { success: true };
  } catch (err) {
    console.error('[updateReferralBonusAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
