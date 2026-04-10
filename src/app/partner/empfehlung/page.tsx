import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Gift } from 'lucide-react';
import { REFERRAL_BONUS_KEY } from '@/lib/constants';
import ReferralForm from '@/components/partner/ReferralForm';

export default async function EmpfehlungPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: bonusSetting }, { data: referrals }] = await Promise.all([
    supabase
      .from('bt_documents')
      .select('file_url')
      .eq('title', REFERRAL_BONUS_KEY)
      .maybeSingle(),
    supabase
      .from('bt_referrals')
      .select('id, first_name, last_name, phone, email, note, status, created_at')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const bonusText = bonusSetting?.file_url ?? null;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <Gift className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Empfehlung abgeben</h1>
        </div>
        <p className="text-sm text-gray-500">
          Empfehle einen Trainer oder Selbstständigen als neuen BODYTIME-Partner und erhalte
          einen Bonus bei erfolgreicher Vermittlung.
        </p>
      </div>

      <ReferralForm bonusText={bonusText} referrals={referrals ?? []} />
    </div>
  );
}
