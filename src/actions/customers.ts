'use server';
/**
 * Customer Management Actions (Partner-facing)
 * Partners can only access their own customers (enforced by RLS + explicit checks).
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { customerSchema, renewalSchema, crmNoteSchema } from '@/lib/validations/customer';
import { calcContractEnd } from '@/lib/utils';
import type { ActionResult, RentalDuration } from '@/types';

async function requirePartner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht authentifiziert');

  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active, first_name, last_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'partner' || !profile.is_active) {
    throw new Error('Keine Berechtigung');
  }

  return { user, profile, supabase };
}

export async function createCustomerAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, supabase } = await requirePartner();

    const raw = Object.fromEntries(formData.entries());
    const parsed = customerSchema.safeParse({
      ...raw,
      rental_duration_months: Number(raw.rental_duration_months),
      salutation: raw.salutation || null,
      size_top: raw.size_top || null,
      size_pants: raw.size_pants || null,
      birth_date: raw.birth_date || null,
      order_number: raw.order_number || null,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { order_number, ...coreData } = parsed.data;
    const contractEndDate = calcContractEnd(coreData.order_date, coreData.rental_duration_months);

    const { data: customer, error } = await supabase
      .from('bt_customers')
      .insert({
        partner_id: user.id,
        ...coreData,
        contract_end_date: contractEndDate,
        // order_number only included when non-empty (requires migration 002)
        ...(order_number ? { order_number } : {}),
      })
      .select('id')
      .single();

    if (error || !customer) {
      console.error('[createCustomerAction] DB error:', error?.message);
      return { success: false, error: 'Kunde konnte nicht angelegt werden.' };
    }

    // Initial contract history entry
    await supabase.from('bt_contract_history').insert({
      customer_id: customer.id,
      order_date: coreData.order_date,
      rental_duration_months: coreData.rental_duration_months,
      contract_end_date: contractEndDate,
      change_type: 'initial',
      changed_by: user.id,
    });

    revalidatePath('/partner/customers');
    return { success: true, data: { id: customer.id } };
  } catch (err) {
    console.error('[createCustomerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function updateCustomerAction(
  customerId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    // Verify ownership before update (defense in depth on top of RLS)
    const { data: existing } = await supabase
      .from('bt_customers')
      .select('partner_id, order_date, rental_duration_months, contract_end_date')
      .eq('id', customerId)
      .single();

    if (!existing || existing.partner_id !== user.id) {
      return { success: false, error: 'Keine Berechtigung.' };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = customerSchema.safeParse({
      ...raw,
      rental_duration_months: Number(raw.rental_duration_months),
      salutation: raw.salutation || null,
      size_top: raw.size_top || null,
      size_pants: raw.size_pants || null,
      birth_date: raw.birth_date || null,
      order_number: raw.order_number || null,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { order_number, ...coreData } = parsed.data;
    const contractChanged =
      coreData.order_date !== existing.order_date ||
      coreData.rental_duration_months !== existing.rental_duration_months;

    const contractEndDate = calcContractEnd(coreData.order_date, coreData.rental_duration_months);

    const { error } = await supabase
      .from('bt_customers')
      .update({
        ...coreData,
        contract_end_date: contractEndDate,
        updated_at: new Date().toISOString(),
        // order_number only included when non-empty (requires migration 002)
        ...(order_number ? { order_number } : {}),
      })
      .eq('id', customerId);

    if (error) {
      console.error('[updateCustomerAction] DB error:', error);
      return { success: false, error: 'Aktualisierung fehlgeschlagen.' };
    }

    // If contract data changed, add a modification history entry
    if (contractChanged) {
      await supabase.from('bt_contract_history').insert({
        customer_id: customerId,
        order_date: coreData.order_date,
        rental_duration_months: coreData.rental_duration_months,
        contract_end_date: contractEndDate,
        change_type: 'modification',
        changed_by: user.id,
      });
    }

    revalidatePath(`/partner/customers/${customerId}`);
    revalidatePath('/partner/customers');
    return { success: true };
  } catch (err) {
    console.error('[updateCustomerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function renewContractAction(
  customerId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    const { data: existing } = await supabase
      .from('bt_customers')
      .select('partner_id')
      .eq('id', customerId)
      .single();

    if (!existing || existing.partner_id !== user.id) {
      return { success: false, error: 'Keine Berechtigung.' };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = renewalSchema.safeParse({
      ...raw,
      rental_duration_months: Number(raw.rental_duration_months),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { order_date, rental_duration_months, change_notes } = parsed.data;
    const contractEndDate = calcContractEnd(order_date, rental_duration_months);

    // Update current contract data + reset reminder flag (new contract = new reminder cycle)
    const { error } = await supabase
      .from('bt_customers')
      .update({
        order_date,
        rental_duration_months,
        contract_end_date: contractEndDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId);

    if (error) return { success: false, error: 'Verlängerung fehlgeschlagen.' };

    // Append renewal to history (append-only, never overwrite)
    await supabase.from('bt_contract_history').insert({
      customer_id: customerId,
      order_date,
      rental_duration_months,
      contract_end_date: contractEndDate,
      change_type: 'renewal',
      change_notes: change_notes || null,
      changed_by: user.id,
    });

    // If a reminder was already sent for the old end_date, delete it so no duplicate
    // (the unique constraint on customer_id + contract_end_date handles idempotency)

    revalidatePath(`/partner/customers/${customerId}`);
    revalidatePath('/partner/customers');
    revalidatePath('/partner/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[renewContractAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function addCrmNoteAction(
  customerId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    // Verify customer belongs to this partner
    const { data: customer } = await supabase
      .from('bt_customers')
      .select('partner_id')
      .eq('id', customerId)
      .single();

    if (!customer || customer.partner_id !== user.id) {
      return { success: false, error: 'Keine Berechtigung.' };
    }

    const parsed = crmNoteSchema.safeParse({ note: formData.get('note') });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    const { error } = await supabase.from('bt_crm_notes').insert({
      customer_id: customerId,
      partner_id: user.id,
      note: parsed.data.note,
    });

    if (error) return { success: false, error: 'Notiz konnte nicht gespeichert werden.' };

    revalidatePath(`/partner/customers/${customerId}`);
    return { success: true };
  } catch (err) {
    console.error('[addCrmNoteAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    const { data: existing } = await supabase
      .from('bt_customers')
      .select('partner_id')
      .eq('id', customerId)
      .single();

    if (!existing || existing.partner_id !== user.id) {
      return { success: false, error: 'Keine Berechtigung.' };
    }

    const { error } = await supabase
      .from('bt_customers')
      .delete()
      .eq('id', customerId);

    if (error) return { success: false, error: 'Kunde konnte nicht gelöscht werden.' };

    revalidatePath('/partner/customers');
    revalidatePath('/partner/dashboard');
    return { success: true };
  } catch (err) {
    console.error('[deleteCustomerAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function deleteCrmNoteAction(noteId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    // Only delete if this partner owns the note
    const { error } = await supabase
      .from('bt_crm_notes')
      .delete()
      .eq('id', noteId)
      .eq('partner_id', user.id);

    if (error) return { success: false, error: 'Notiz konnte nicht gelöscht werden.' };

    return { success: true };
  } catch (err) {
    console.error('[deleteCrmNoteAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
