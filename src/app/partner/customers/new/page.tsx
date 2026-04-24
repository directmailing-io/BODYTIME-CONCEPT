import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewCustomerForm from './NewCustomerForm';

export default async function NewCustomerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: packages } = await supabase
    .from('bt_partner_packages')
    .select('*, bt_package_items(*)')
    .eq('partner_id', user.id)
    .eq('is_active', true)
    .order('name');

  return <NewCustomerForm packages={packages ?? []} />;
}
