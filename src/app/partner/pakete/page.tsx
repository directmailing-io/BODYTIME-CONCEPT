import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PackagesManager from '@/components/partner/PackagesManager';

export const metadata = { title: 'Meine Pakete – BODYTIME concept' };

export default async function PaketePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: packages } = await supabase
    .from('bt_partner_packages')
    .select('*, bt_package_items(*)')
    .eq('partner_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meine Pakete</h1>
        <p className="text-sm text-gray-500 mt-1">Erstelle Preispakete, die du Kunden zuweisen kannst.</p>
      </div>
      <PackagesManager initialPackages={packages ?? []} />
    </div>
  );
}
