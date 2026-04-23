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

export interface CustomerPriceItemInput {
  id?: string;
  name: string;
  billing_type: 'once' | 'monthly';
  amount: number;
  sort_order: number;
}

// Add months to a date string (YYYY-MM-DD)
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

function formatMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

// Generate payment entries from price items and contract data
function buildPaymentEntries(
  customerId: string,
  items: CustomerPriceItemInput[],
  orderDate: string,
  durationMonths: number
) {
  const entries: { customer_id: string; due_date: string; amount: number; description: string; billing_type: string; status: string }[] = [];
  for (const item of items) {
    if (item.billing_type === 'once') {
      entries.push({ customer_id: customerId, due_date: orderDate, amount: item.amount, description: item.name, billing_type: 'once', status: 'pending' });
    } else {
      for (let m = 0; m < durationMonths; m++) {
        const due = addMonths(orderDate, m);
        entries.push({ customer_id: customerId, due_date: due, amount: item.amount, description: `${item.name} – ${formatMonthLabel(due)}`, billing_type: 'monthly', status: 'pending' });
      }
    }
  }
  return entries;
}

export async function saveCustomerPricingAction(
  customerId: string,
  data: { packageId?: string; packageName?: string; items: CustomerPriceItemInput[] }
): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();

    // Verify ownership
    const { data: customer } = await supabase.from('bt_customers').select('partner_id, order_date, rental_duration_months').eq('id', customerId).single();
    if (!customer || customer.partner_id !== user.id) return { success: false, error: 'Keine Berechtigung.' };

    // Replace customer price items
    await supabase.from('bt_customer_price_items').delete().eq('customer_id', customerId);
    if (data.items.length > 0) {
      await supabase.from('bt_customer_price_items').insert(
        data.items.map((item, i) => ({
          customer_id: customerId,
          package_id: data.packageId ?? null,
          package_name: data.packageName ?? null,
          name: item.name,
          billing_type: item.billing_type,
          amount: item.amount,
          sort_order: i,
        }))
      );
    }

    // Regenerate pending payment entries (keep paid ones)
    await supabase.from('bt_payment_entries').delete().eq('customer_id', customerId).eq('status', 'pending');
    if (data.items.length > 0 && customer.order_date && customer.rental_duration_months) {
      const entries = buildPaymentEntries(customerId, data.items, customer.order_date, customer.rental_duration_months);
      if (entries.length > 0) await supabase.from('bt_payment_entries').insert(entries);
    }

    revalidatePath(`/partner/customers/${customerId}`);
    return { success: true };
  } catch (err) {
    console.error('[saveCustomerPricingAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function markPaymentPaidAction(entryId: string, customerId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();
    // Verify via customer ownership
    const { data: entry } = await supabase.from('bt_payment_entries').select('customer_id').eq('id', entryId).single();
    if (!entry) return { success: false, error: 'Eintrag nicht gefunden.' };
    const { data: customer } = await supabase.from('bt_customers').select('partner_id').eq('id', entry.customer_id).single();
    if (!customer || customer.partner_id !== user.id) return { success: false, error: 'Keine Berechtigung.' };

    await supabase.from('bt_payment_entries').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', entryId);
    revalidatePath(`/partner/customers/${customerId}`);
    return { success: true };
  } catch (err) {
    console.error('[markPaymentPaidAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

export async function markPaymentUnpaidAction(entryId: string, customerId: string): Promise<ActionResult> {
  try {
    const { user, supabase } = await requirePartner();
    const { data: entry } = await supabase.from('bt_payment_entries').select('customer_id').eq('id', entryId).single();
    if (!entry) return { success: false, error: 'Eintrag nicht gefunden.' };
    const { data: customer } = await supabase.from('bt_customers').select('partner_id').eq('id', entry.customer_id).single();
    if (!customer || customer.partner_id !== user.id) return { success: false, error: 'Keine Berechtigung.' };

    await supabase.from('bt_payment_entries').update({ status: 'pending', paid_at: null }).eq('id', entryId);
    revalidatePath(`/partner/customers/${customerId}`);
    return { success: true };
  } catch (err) {
    console.error('[markPaymentUnpaidAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}

// Called after a contract renewal to regenerate payment entries for the new period
export async function regeneratePaymentsAfterRenewalAction(
  customerId: string,
  newOrderDate: string,
  newDurationMonths: number
): Promise<void> {
  try {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    // Get customer's current price items
    const { data: items } = await supabase.from('bt_customer_price_items').select('*').eq('customer_id', customerId).order('sort_order');
    if (!items || items.length === 0) return;

    // Delete pending entries (keep paid)
    await supabase.from('bt_payment_entries').delete().eq('customer_id', customerId).eq('status', 'pending');

    // Generate new entries for the new contract period — skip one-time items (already paid in original contract)
    const monthlyItems = items.filter((i: { billing_type: string }) => i.billing_type === 'monthly');
    const entries = buildPaymentEntries(customerId, monthlyItems, newOrderDate, newDurationMonths);
    if (entries.length > 0) await supabase.from('bt_payment_entries').insert(entries);
  } catch (err) {
    console.error('[regeneratePaymentsAfterRenewalAction]', err);
  }
}
