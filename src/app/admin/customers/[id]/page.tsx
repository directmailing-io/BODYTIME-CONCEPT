import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, daysUntilEnd, isExpiringSoon, isExpired } from '@/lib/utils';
import CustomerDetailClient from '@/components/partner/CustomerDetailClient';

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from('bt_customers')
    .select('*, partner:bt_profiles!partner_id(first_name, last_name, email)')
    .eq('id', id)
    .single();

  if (!customer) notFound();

  const [{ data: history }, { data: notes }] = await Promise.all([
    supabase
      .from('bt_contract_history')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bt_crm_notes')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const days = daysUntilEnd(customer.contract_end_date);
  const expired = isExpired(customer.contract_end_date);
  const expiringSoon = isExpiringSoon(customer.contract_end_date);

  const partnerName = customer.partner
    ? `${customer.partner.first_name ?? ''} ${customer.partner.last_name ?? ''}`.trim()
    : null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Alle Kunden
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.salutation ? `${customer.salutation} ` : ''}
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{customer.email}</p>
          {partnerName && (
            <p className="text-sm text-gray-400 mt-1">
              Partner:{' '}
              <Link
                href={`/admin/partners/${customer.partner_id}`}
                className="text-gray-600 hover:text-gray-900 underline underline-offset-2"
              >
                {partnerName}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {expired && <Badge variant="danger">Abgelaufen</Badge>}
          {expiringSoon && !expired && <Badge variant="warning">Läuft bald ab</Badge>}
          {!expired && !expiringSoon && <Badge variant="success">Aktiv</Badge>}
        </div>
      </div>

      {/* Alert banners */}
      {expired && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Vertrag ist seit {Math.abs(days)} Tagen abgelaufen.
          </p>
        </div>
      )}
      {expiringSoon && !expired && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            Vertrag läuft in {days} Tagen ab ({formatDate(customer.contract_end_date)}).
          </p>
        </div>
      )}

      <CustomerDetailClient
        customer={customer}
        history={history ?? []}
        notes={notes ?? []}
        readOnly
      />
    </div>
  );
}
