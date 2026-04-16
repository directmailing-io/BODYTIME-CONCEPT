import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatDate, fullName } from '@/lib/utils';
import CreatePartnerDialog from '@/components/admin/CreatePartnerDialog';
import PartnerActions from '@/components/admin/PartnerActions';
import PartnersSearchFilter from '@/components/admin/PartnersSearchFilter';

interface PartnerProfile {
  company_name: string | null;
  address_city: string | null;
  phone: string | null;
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
  if (Array.isArray(customers)) {
    return customers[0]?.count ?? 0;
  }
  return (customers as { count: number }).count ?? 0;
}

function getPartnerProfile(partner_profiles: Partner['bt_partner_profiles']): PartnerProfile | null {
  if (!partner_profiles) return null;
  if (Array.isArray(partner_profiles)) return partner_profiles[0] ?? null;
  return partner_profiles;
}

export default async function PartnersPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from('bt_profiles')
    .select(`
      id, first_name, last_name, email, is_active, created_at,
      bt_partner_profiles (company_name, address_city, phone),
      bt_customers (count)
    `)
    .eq('role', 'partner')
    .order('created_at', { ascending: false });

  const typedPartners = (partners ?? []) as Partner[];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner</h1>
          <p className="text-sm text-gray-500 mt-1">
            {typedPartners.length} Partner{typedPartners.length !== 1 ? '' : ''} insgesamt
          </p>
        </div>
        <CreatePartnerDialog />
      </div>

      {/* Search + list */}
      <PartnersSearchFilter partners={typedPartners.map((p) => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        is_active: p.is_active,
        created_at: p.created_at,
        company_name: getPartnerProfile(p.bt_partner_profiles)?.company_name ?? null,
        customer_count: getCustomerCount(p.bt_customers),
      }))} />
    </div>
  );
}
