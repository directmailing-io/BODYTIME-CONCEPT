import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CustomersTable from '@/components/partner/CustomersTable';

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customers } = await supabase
    .from('bt_customers')
    .select('*')
    .eq('partner_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meine Kunden</h1>
          <p className="text-sm text-gray-500 mt-0.5">{(customers ?? []).length} Kunden gesamt</p>
        </div>
        <Button asChild>
          <Link href="/partner/customers/new">
            <Plus className="h-4 w-4" />
            Kunde anlegen
          </Link>
        </Button>
      </div>
      <CustomersTable customers={customers ?? []} />
    </div>
  );
}
