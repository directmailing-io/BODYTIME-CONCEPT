import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate, isExpired, isExpiringSoon } from '@/lib/utils';
import AdminCustomersTable from '@/components/admin/AdminCustomersTable';

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from('bt_customers')
    .select(`
      id, first_name, last_name, email, order_date, rental_duration_months,
      contract_end_date, is_active, created_at,
      partner_id,
      partner:bt_profiles!partner_id(first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alle Kunden</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(customers ?? []).length} Kunden gesamt</p>
      </div>
      <AdminCustomersTable customers={customers ?? []} />
    </div>
  );
}
