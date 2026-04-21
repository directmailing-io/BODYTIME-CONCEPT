import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PublicOrderFlow from './PublicOrderFlow';
import { VOUCHER_SETTING_KEY } from '@/lib/constants';

export default async function BestellungPage({ params }: { params: Promise<{ partnerId: string }> }) {
  const { partnerId } = await params;
  const adminClient = createAdminClient();

  const [{ data: partner }, { data: setting }] = await Promise.all([
    adminClient
      .from('bt_profiles')
      .select('id, first_name, last_name')
      .eq('id', partnerId)
      .eq('role', 'partner')
      .eq('is_active', true)
      .single(),
    adminClient
      .from('bt_documents')
      .select('file_url')
      .eq('title', VOUCHER_SETTING_KEY)
      .maybeSingle(),
  ]);

  if (!partner) notFound();

  const voucherCode = setting?.file_url ?? 'BODYCONCEPT1';
  const partnerName = `${partner.first_name ?? ''} ${partner.last_name ?? ''}`.trim();

  return (
    <PublicOrderFlow
      partnerId={partnerId}
      partnerName={partnerName}
      voucherCode={voucherCode}
    />
  );
}
