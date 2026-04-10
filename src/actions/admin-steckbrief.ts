'use server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');

  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    throw new Error('Keine Berechtigung');
  }

  return { user, supabase };
}

export async function approveSteckbriefAction(steckbriefId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('bt_steckbriefe')
      .update({
        status: 'approved',
        rejection_reason: null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', steckbriefId);

    if (error) {
      console.error('[approveSteckbrief]', error);
      return { success: false, error: 'Freigabe fehlgeschlagen.' };
    }

    revalidatePath('/admin/freigabezentrale');
    return { success: true };
  } catch (err) {
    console.error('[approveSteckbriefAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function rejectSteckbriefAction(
  steckbriefId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    if (!reason.trim()) {
      return { success: false, error: 'Bitte einen Ablehnungsgrund angeben.' };
    }

    const { error } = await adminClient
      .from('bt_steckbriefe')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim().slice(0, 1000),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', steckbriefId);

    if (error) {
      console.error('[rejectSteckbrief]', error);
      return { success: false, error: 'Ablehnung fehlgeschlagen.' };
    }

    revalidatePath('/admin/freigabezentrale');
    return { success: true };
  } catch (err) {
    console.error('[rejectSteckbriefAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function adminDeleteSteckbriefAction(steckbriefId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const adminClient = createAdminClient();

    // Fetch to get partner_id for storage cleanup
    const { data: bio } = await adminClient
      .from('bt_steckbriefe')
      .select('partner_id')
      .eq('id', steckbriefId)
      .single();

    if (bio?.partner_id) {
      await adminClient.storage
        .from('bt_steckbriefe')
        .remove([
          `${bio.partner_id}/profile.jpg`,
          `${bio.partner_id}/profile.png`,
          `${bio.partner_id}/profile.webp`,
        ]);
    }

    const { error } = await adminClient
      .from('bt_steckbriefe')
      .delete()
      .eq('id', steckbriefId);

    if (error) {
      console.error('[adminDeleteSteckbrief]', error);
      return { success: false, error: 'Löschen fehlgeschlagen.' };
    }

    revalidatePath('/admin/freigabezentrale');
    return { success: true };
  } catch (err) {
    console.error('[adminDeleteSteckbriefAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
