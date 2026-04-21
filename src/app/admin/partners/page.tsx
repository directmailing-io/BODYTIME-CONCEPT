import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import CreatePartnerDialog from '@/components/admin/CreatePartnerDialog';
import PartnersSearchFilter from '@/components/admin/PartnersSearchFilter';

interface PartnerProfile {
  phone: string | null;
  license_start: string | null;
  license_duration_months: number | null;
  is_cancelled: boolean | null;
  cancellation_date: string | null;
}

interface CustomerCount {
  count: number;
}

interface Partner {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  bt_partner_profiles: PartnerProfile[] | PartnerProfile | null;
  bt_customers: CustomerCount[] | { count: number } | null;
}

function getCustomerCount(customers: Partner['bt_customers']): number {
  if (!customers) return 0;
  if (Array.isArray(customers)) return customers[0]?.count ?? 0;
  return (customers as { count: number }).count ?? 0;
}

function getPartnerProfile(pp: Partner['bt_partner_profiles']): PartnerProfile | null {
  if (!pp) return null;
  if (Array.isArray(pp)) return pp[0] ?? null;
  return pp;
}

export default async function PartnersPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from('bt_profiles')
    .select(`
      id, first_name, last_name, email, is_active, created_at,
      bt_partner_profiles (phone, license_start, license_duration_months, is_cancelled, cancellation_date),
      bt_customers (count)
    `)
    .eq('role', 'partner')
    .order('created_at', { ascending: false });

  const typedPartners = (partners ?? []) as Partner[];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner</h1>
          <p className="text-sm text-gray-500 mt-1">
            {typedPartners.length} Partner insgesamt
          </p>
        </div>
        <CreatePartnerDialog />
      </div>

      <PartnersSearchFilter partners={typedPartners.map(p => {
        const pp = getPartnerProfile(p.bt_partner_profiles);
        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          is_active: p.is_active,
          created_at: p.created_at,
          customer_count: getCustomerCount(p.bt_customers),
          license_start: pp?.license_start ?? null,
          license_duration_months: pp?.license_duration_months ?? 12,
          is_cancelled: pp?.is_cancelled ?? false,
          cancellation_date: pp?.cancellation_date ?? null,
        };
      })} />
    </div>
  );
}
