import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, daysUntilEnd, isExpiringSoon, isExpired } from '@/lib/utils';
import CustomerDetailClient from '@/components/partner/CustomerDetailClient';
import DeleteCustomerButton from '@/components/partner/DeleteCustomerButton';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('bt_customers')
    .select('*')
    .eq('id', id)
    .single();

  if (!customer) notFound();

  // Security: verify ownership
  if (customer.partner_id !== user.id) notFound();

  const [{ data: history }, { data: notes }] = await Promise.all([
    supabase.from('bt_contract_history')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabase.from('bt_crm_notes')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const days = daysUntilEnd(customer.contract_end_date);
  const expired = isExpired(customer.contract_end_date);
  const expiringSoon = isExpiringSoon(customer.contract_end_date);
  const profileIncomplete = !customer.order_date || !customer.first_name || !customer.last_name || !customer.email || !customer.rental_duration_months;

  return (
    <div className="max-w-3xl">
      <Link href="/partner/customers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Alle Kunden
      </Link>

      {/* Profile incomplete banner */}
      {profileIncomplete && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Profil unvollständig</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Dieser Kunde wurde über deinen Bestelllink angelegt. Bitte vervollständige das Profil.
            </p>
          </div>
          <Link href={`/partner/customers/${customer.id}/edit`} className="ml-auto shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 underline">
            Profil bearbeiten
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.salutation ? `${customer.salutation} ` : ''}{customer.first_name} {customer.last_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{customer.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {expired && <Badge variant="danger">Abgelaufen</Badge>}
          {expiringSoon && !expired && <Badge variant="warning">Läuft bald ab</Badge>}
          {!expired && !expiringSoon && <Badge variant="success">Aktiv</Badge>}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/partner/customers/${id}/edit`}>Bearbeiten</Link>
          </Button>
          <DeleteCustomerButton
            customerId={id}
            customerName={`${customer.first_name} ${customer.last_name}`}
          />
        </div>
      </div>

      {/* Alert banners */}
      {expired && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Vertrag ist seit {Math.abs(days)} Tagen abgelaufen – bitte verlängern.
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
      />
    </div>
  );
}
