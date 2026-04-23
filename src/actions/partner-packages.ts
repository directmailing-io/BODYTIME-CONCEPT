'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';

async function requirePartner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');
  const { data: profile } = await supabase.from('bt_profiles').select('role, is_active').eq('id', user.id).single();
  if (!profile || profile.role !== 'partner' || !profile.is_active) throw new Error('Keine Berechtigung');
  return { user, supabase };
}

export interface PackageItemInput {
  id?: string; // existing item id for updates
  name: string;
  billing_type: 'once' | 'monthly';
  amount: number;
  sort_order: number;
}

export async function upsertPackageAction(
  data: { id?: string; name: string; items: PackageItemInput[] }
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, supabase } = await requirePartner();

    let packageId: string;

    if (data.id) {
      // Update existing
      const { data: existing } = await supabase.from('bt_partner_packages').select('partner_id').eq('id', data.id).single();
      if (!existing || existing.partner_id !== user.id) return { success: false, error: 'Keine Berechtigung.' };
      await supabase.from('bt_partner_packages').update({ name: data.name, updated_at: new Date().toISOString() }).eq('id', data.id);
      packageId = data.id;
    } else {
      // Create new
      const { data: pkg, error } = await supabase.from('bt_partner_packages').insert({ partner_id: user.id, name: data.name }).select('id').single();
      if (error || !pkg) return { success: false, error: 'Paket konnte nicht erstellt werden.' };
      packageId = pkg.id;
    }

    // Replace all items: delete existing, insert new
    await supabase.from('bt_package_items').delete().eq('package_id', packageId);
    if (data.items.length > 0) {
      await supabase.from('bt_package_items').insert(
        data.items.map((item, i) => ({
          package_id: packageId,
          name: item.name,
          billing_type: item.billing_type,
          amount: item.amount,
          sort_order: i,
        }))
      );
    }

    revalidatePath('/partner/pakete');
    return { success: true, data: { id: packageId } };
  } catch (err) {
    console.error('[upsertPackageAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deletePackageAction(packageId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();
    const { data: existing } = await supabase.from('bt_partner_packages').select('partner_id').eq('id', packageId).single();
    if (!existing || existing.partner_id !== user.id) return { success: false, error: 'Keine Berechtigung.' };
    await supabase.from('bt_partner_packages').delete().eq('id', packageId);
    revalidatePath('/partner/pakete');
    return { success: true };
  } catch (err) {
    console.error('[deletePackageAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
