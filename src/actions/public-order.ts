'use server';
import { createAdminClient } from '@/lib/supabase/server';
import { calcContractEnd } from '@/lib/utils';
import { sendMail } from '@/lib/email/mailer';
import { newCustomerEmail } from '@/lib/email/templates';

export interface PublicOrderInput {
  partnerId: string;
  first_name: string;
  last_name: string;
  email: string;
  order_date?: string;
  rental_duration_months?: number;
  order_number?: string;
  ems_suit_type?: string;
  size_top?: string;
  size_pants?: string;
}

export interface PublicOrderResult {
  success: boolean;
  error?: string;
}

export async function createPublicOrderAction(input: PublicOrderInput): Promise<PublicOrderResult> {
  try {
    const adminClient = createAdminClient();

    // Verify partner exists and is active
    const { data: partner } = await adminClient
      .from('bt_profiles')
      .select('id, is_active, role, email, first_name')
      .eq('id', input.partnerId)
      .eq('role', 'partner')
      .single();

    if (!partner || !partner.is_active) {
      return { success: false, error: 'Partner nicht gefunden.' };
    }

    const orderDate = input.order_date || new Date().toISOString().split('T')[0];
    const durationMonths = input.rental_duration_months || 12;
    const contractEndDate = calcContractEnd(orderDate, durationMonths);

    const insertData: Record<string, unknown> = {
      partner_id: input.partnerId,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: input.email.trim().toLowerCase(),
      order_date: orderDate,
      rental_duration_months: durationMonths,
      contract_end_date: contractEndDate,
      profile_complete: false,
      source: 'partner_link',
    };

    if (input.order_number?.trim()) insertData.order_number = input.order_number.trim();
    if (input.ems_suit_type?.trim()) insertData.ems_suit_type = input.ems_suit_type.trim();
    if (input.size_top) insertData.size_top = input.size_top;
    if (input.size_pants) insertData.size_pants = input.size_pants;

    const { data: customer, error } = await adminClient
      .from('bt_customers')
      .insert(insertData)
      .select('id')
      .single();

    if (error || !customer) {
      console.error('[createPublicOrderAction]', error);
      return { success: false, error: 'Daten konnten nicht gespeichert werden.' };
    }

    // Initial contract history
    await adminClient.from('bt_contract_history').insert({
      customer_id: customer.id,
      order_date: orderDate,
      rental_duration_months: durationMonths,
      contract_end_date: contractEndDate,
      change_type: 'initial',
      changed_by: null,
    });

    // Notify partner about new customer (fire-and-forget)
    if (partner.email) {
      const template = newCustomerEmail({
        partnerFirstName: partner.first_name ?? 'Partner',
        customerFirstName: input.first_name.trim(),
        customerLastName: input.last_name.trim(),
        customerEmail: input.email.trim(),
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/partner/customers/${customer.id}`,
      });
      sendMail({ to: partner.email, subject: template.subject, html: template.html })
        .catch(err => console.error('[createPublicOrderAction] notify email failed:', err));
    }

    return { success: true };
  } catch (err) {
    console.error('[createPublicOrderAction]', err);
    return { success: false, error: 'Ein Fehler ist aufgetreten.' };
  }
}
