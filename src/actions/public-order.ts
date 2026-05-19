'use server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { calcContractEnd } from '@/lib/utils';
import { sendMail } from '@/lib/email/mailer';
import { newCustomerEmail } from '@/lib/email/templates';

const publicOrderSchema = z.object({
  partnerId: z.string().uuid(),
  first_name: z.string().min(1).max(50).trim(),
  last_name: z.string().min(1).max(50).trim(),
  email: z.string().email().max(254).trim().toLowerCase(),
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rental_duration_months: z.number().int().min(1).max(60).optional(),
  order_number: z.string().max(50).optional(),
  ems_suit_type: z.string().max(100).optional(),
  size_top: z.string().max(10).optional(),
  size_pants: z.string().max(10).optional(),
});

export type PublicOrderInput = z.input<typeof publicOrderSchema>;

export interface PublicOrderResult {
  success: boolean;
  error?: string;
}

export async function createPublicOrderAction(input: PublicOrderInput): Promise<PublicOrderResult> {
  const parsed = publicOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Ungültige Eingaben.' };
  }
  const data = parsed.data;

  try {
    const adminClient = createAdminClient();

    // Verify partner exists and is active
    const { data: partner } = await adminClient
      .from('bt_profiles')
      .select('id, is_active, role, email, first_name')
      .eq('id', data.partnerId)
      .eq('role', 'partner')
      .single();

    if (!partner || !partner.is_active) {
      return { success: false, error: 'Partner nicht gefunden.' };
    }

    const orderDate = data.order_date || new Date().toISOString().split('T')[0];
    const durationMonths = data.rental_duration_months || 12;
    const contractEndDate = calcContractEnd(orderDate, durationMonths);

    const insertData: Record<string, unknown> = {
      partner_id: data.partnerId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      order_date: orderDate,
      rental_duration_months: durationMonths,
      contract_end_date: contractEndDate,
      profile_complete: false,
      source: 'partner_link',
    };

    if (data.order_number?.trim()) insertData.order_number = data.order_number.trim();
    if (data.ems_suit_type?.trim()) insertData.ems_suit_type = data.ems_suit_type.trim();
    if (data.size_top) insertData.size_top = data.size_top;
    if (data.size_pants) insertData.size_pants = data.size_pants;

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
        customerFirstName: data.first_name,
        customerLastName: data.last_name,
        customerEmail: data.email,
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
