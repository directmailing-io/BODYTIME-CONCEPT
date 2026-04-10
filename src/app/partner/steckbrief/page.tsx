import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { IdCard } from 'lucide-react';
import SteckbriefForm from '@/components/partner/SteckbriefForm';
import type { Steckbrief } from '@/types';

export default async function SteckbriefPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: bio }, { data: profile }] = await Promise.all([
    supabase.from('bt_steckbriefe').select('*').eq('partner_id', user.id).maybeSingle(),
    supabase.from('bt_profiles').select('first_name, last_name').eq('id', user.id).single(),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <IdCard className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mein Steckbrief</h1>
        </div>
        <p className="text-sm text-gray-500">
          Erstelle deinen persönlichen Steckbrief für die öffentliche Webseite.
          Nach dem Einreichen wird dein Steckbrief von einem Admin geprüft und freigeschaltet.
        </p>
      </div>

      <SteckbriefForm
        bio={bio as Steckbrief | null}
        partnerFirstName={profile?.first_name ?? ''}
        partnerLastName={profile?.last_name ?? ''}
      />
    </div>
  );
}
