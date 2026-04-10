import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendMail } from '@/lib/email/mailer';
import { expiryReminderEmail } from '@/lib/email/templates';
import { daysUntilEnd, formatDate } from '@/lib/utils';

/**
 * Cron job: send reminder emails for contracts expiring within 60 days.
 *
 * Idempotency: uses reminder_logs table with unique constraint
 * (customer_id, contract_end_date) to prevent duplicate emails.
 *
 * Run via: GET /api/cron/reminders
 * Protected by: Authorization: Bearer {CRON_SECRET}
 *
 * Recommended schedule: daily at 08:00 UTC
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  try {
    const today = new Date();
    const in60Days = new Date(today);
    in60Days.setDate(in60Days.getDate() + 60);

    // Find customers whose contracts expire within 60 days and haven't been reminded yet
    // for this specific contract_end_date
    const { data: customers, error } = await adminClient
      .from('bt_customers')
      .select(`
        id, first_name, last_name, email, contract_end_date, partner_id,
        partner:profiles!partner_id(id, first_name, last_name, email),
        reminder_logs(id)
      `)
      .eq('is_active', true)
      .gte('contract_end_date', today.toISOString().split('T')[0])
      .lte('contract_end_date', in60Days.toISOString().split('T')[0]);

    if (error) throw error;

    let sent = 0;
    let skipped = 0;

    for (const customer of customers ?? []) {
      // Check if reminder already sent for this exact contract_end_date
      const { data: existingReminder } = await adminClient
        .from('bt_reminder_logs')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('contract_end_date', customer.contract_end_date)
        .single();

      if (existingReminder) {
        skipped++;
        continue;
      }

      const partner = customer.partner as any;
      if (!partner?.email) { skipped++; continue; }

      const days = daysUntilEnd(customer.contract_end_date);
      const customerDetailUrl = `${APP_URL}/partner/customers/${customer.id}`;

      const { subject, html } = expiryReminderEmail({
        partnerFirstName: partner.first_name,
        customerName: `${customer.first_name} ${customer.last_name}`,
        contractEndDate: formatDate(customer.contract_end_date),
        daysLeft: days,
        customerDetailUrl,
      });

      try {
        await sendMail({ to: partner.email, subject, html });

        // Log the reminder (idempotent – unique constraint prevents duplicates)
        await adminClient.from('bt_reminder_logs').insert({
          customer_id: customer.id,
          partner_id: customer.partner_id,
          reminder_type: 'expiry_warning',
          contract_end_date: customer.contract_end_date,
        });

        // Update customer's reminder_sent flag
        await adminClient
          .from('bt_customers')
          .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
          .eq('id', customer.id);

        sent++;
      } catch (emailError) {
        console.error(`[cron/reminders] Failed to send to ${partner.email}:`, emailError);
        skipped++;
      }
    }

    console.log(`[cron/reminders] Sent: ${sent}, Skipped: ${skipped}`);
    return NextResponse.json({ success: true, sent, skipped });
  } catch (error) {
    console.error('[cron/reminders] Fatal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
