import { createAdminClient } from '@/lib/supabase/server';
import { REFERRAL_BONUS_KEY } from '@/lib/constants';
import AdminReferralsClient from '@/components/admin/AdminReferralsClient';

export default async function EmpfehlungszentralePage() {
  const adminClient = createAdminClient();

  const [{ data: referrals }, { data: bonusSetting }] = await Promise.all([
    adminClient
      .from('bt_referrals')
      .select(`
        id, first_name, last_name, phone, email, note, status, created_at, updated_at,
        partner:bt_profiles!partner_id(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false }),
    adminClient
      .from('bt_documents')
      .select('file_url')
      .eq('title', REFERRAL_BONUS_KEY)
      .maybeSingle(),
  ]);

  return (
    <AdminReferralsClient
      referrals={referrals ?? []}
      bonusText={bonusSetting?.file_url ?? ''}
    />
  );
}
