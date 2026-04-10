'use server';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { VOUCHER_SETTING_KEY } from '@/lib/constants';

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

export async function updateVoucherCodeAction(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await requireAdmin();
    const supabaseAdmin = createAdminClient();
    const code = String(formData.get('voucher_code') ?? '').trim();

    // Check if the setting record already exists
    const { data: existing } = await supabaseAdmin
      .from('bt_documents')
      .select('id')
      .eq('title', VOUCHER_SETTING_KEY)
      .maybeSingle();

    let dbError;
    if (existing) {
      const { error } = await supabaseAdmin
        .from('bt_documents')
        .update({ file_url: code })
        .eq('id', existing.id);
      dbError = error;
    } else {
      const { error } = await supabaseAdmin
        .from('bt_documents')
        .insert({
          title: VOUCHER_SETTING_KEY,
          type: 'link',
          file_url: code,
          is_published: true,
          created_by: user.id,
        });
      dbError = error;
    }

    if (dbError) {
      console.error('[updateVoucherCodeAction] DB error:', dbError.message);
      return { success: false, error: 'Einstellung konnte nicht gespeichert werden.' };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/partner/order');
    return { success: true };
  } catch (err) {
    console.error('[updateVoucherCodeAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
