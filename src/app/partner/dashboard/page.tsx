import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertTriangle, UserPlus, ArrowRight, CalendarDays, Cake, TrendingUp } from 'lucide-react';
import { formatDate, daysUntilEnd } from '@/lib/utils';

interface KpiCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ icon: Icon, value, label, iconBg, iconColor }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExpiringCustomer {
  id: string;
  first_name: string;
  last_name: string;
  contract_end_date: string;
}

function UrgencyBadge({ days }: { days: number }) {
  const label = days === 0 ? 'Heute' : `${days} Tag${days === 1 ? '' : 'e'}`;
  if (days < 30) return <Badge variant="danger">{label}</Badge>;
  if (days < 60) return <Badge variant="warning">{label}</Badge>;
  return <Badge variant="neutral">{label}</Badge>;
}

export default async function PartnerDashboardPage() {
  const supabase = await createClient();

  // Verify authenticated partner
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all active customers for this partner
  const { data: allCustomers } = await supabase
    .from('bt_customers')
    .select('id, first_name, last_name, contract_end_date, is_active, created_at, birth_date, rental_duration_months')
    .eq('partner_id', user.id)
    .eq('is_active', true);

  const customers = allCustomers ?? [];

  // Fetch customer price items to calculate total Kundenwert
  const customerIds = customers.map(c => c.id);
  let totalKundenwert = 0;
  if (customerIds.length > 0) {
    const { data: allPriceItems } = await supabase
      .from('bt_customer_price_items')
      .select('customer_id, billing_type, amount')
      .in('customer_id', customerIds);

    if (allPriceItems) {
      for (const customer of customers) {
        const items = allPriceItems.filter(i => i.customer_id === customer.id);
        const once = items.filter(i => i.billing_type === 'once').reduce((s, i) => s + Number(i.amount), 0);
        const monthly = items.filter(i => i.billing_type === 'monthly').reduce((s, i) => s + Number(i.amount), 0);
        totalKundenwert += once + monthly * (customer.rental_duration_months ?? 12);
      }
    }
  }
  const now = new Date();

  // KPI: total active customers
  const totalCustomers = customers.length;

  // KPI: expiring soon (within 90 days, not yet expired)
  const expiringSoonCustomers = customers.filter((c) => {
    const days = daysUntilEnd(c.contract_end_date);
    return days >= 0 && days <= 90;
  });

  // KPI: already expired (contract_end_date in the past)
  const expiredCustomers = customers.filter((c) => daysUntilEnd(c.contract_end_date) < 0);

  // KPI: new this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newThisMonth = customers.filter((c) => c.created_at >= startOfMonth).length;

  // Expiring soon list — sorted by contract_end_date ascending (within 90 days)
  const expiringSoonSorted: ExpiringCustomer[] = [...expiringSoonCustomers].sort(
    (a, b) =>
      new Date(a.contract_end_date).getTime() - new Date(b.contract_end_date).getTime(),
  );

  // Recently added customers (last 3)
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Birthday this month
  const currentMonth = now.getMonth() + 1; // 1-12
  const birthdayCustomers = customers
    .filter(c => {
      if (!c.birth_date) return false;
      const month = parseInt(c.birth_date.split('-')[1], 10);
      return month === currentMonth;
    })
    .sort((a, b) => {
      const dayA = parseInt(a.birth_date!.split('-')[2], 10);
      const dayB = parseInt(b.birth_date!.split('-')[2], 10);
      return dayA - dayB;
    });

  const kpiCards: KpiCardProps[] = [
    {
      icon: Users,
      value: totalCustomers,
      label: 'Total Kunden',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: Clock,
      value: expiringSoonCustomers.length,
      label: 'Bald ablaufend',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      icon: AlertTriangle,
      value: expiredCustomers.length,
      label: 'Bereits abgelaufen',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      icon: UserPlus,
      value: newThisMonth,
      label: 'Neue diesen Monat',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Übersicht deiner Kunden und Verträge</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* Kundenwert total */}
      <div className="mb-8">
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Gesamter Kundenwert (aktive Kunden)</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {totalKundenwert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </p>
                <p className="text-xs text-blue-600 mt-1">Summe aller Vertragswerte anhand Laufzeit und Preisposten</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring contracts — takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Bald ablaufende Verträge
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Verträge, die in den nächsten 90 Tagen enden
                  </p>
                </div>
                <Link
                  href="/partner/customers"
                  className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  Alle
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {expiringSoonSorted.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    Keine Verträge laufen bald ab
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Alle Verträge sind noch mehr als 90 Tage gültig.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {expiringSoonSorted.map((customer) => {
                    const days = daysUntilEnd(customer.contract_end_date);
                    return (
                      <li key={customer.id}>
                        <Link
                          href={`/partner/customers/${customer.id}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-600">
                                {customer.first_name.charAt(0).toUpperCase()}
                                {customer.last_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {customer.first_name} {customer.last_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Vertragsende: {formatDate(customer.contract_end_date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <UrgencyBadge days={days} />
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 hidden sm:block" />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Birthdays + Quick actions + Recent customers */}
        <div className="flex flex-col gap-6">
          {/* Birthdays this month */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Cake className="w-4 h-4 text-pink-400" />
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Geburtstage im {now.toLocaleString('de-DE', { month: 'long' })}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{birthdayCustomers.length} Geburtstag{birthdayCustomers.length !== 1 ? 'e' : ''}</p>
                </div>
              </div>
              {birthdayCustomers.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-400">Keine Geburtstage diesen Monat</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {birthdayCustomers.map(c => {
                    const parts = c.birth_date!.split('-');
                    const day = parseInt(parts[2], 10);
                    const today = now.getDate();
                    const isToday = day === today;
                    return (
                      <li key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors">
                        <Link href={`/partner/customers/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1 hover:text-gray-900">
                          <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-pink-500">
                              {c.first_name.charAt(0).toUpperCase()}{c.last_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{c.first_name} {c.last_name}</p>
                            <p className="text-xs text-gray-500">{day}. {now.toLocaleString('de-DE', { month: 'long' })}</p>
                          </div>
                        </Link>
                        {isToday && <Badge variant="success">Heute</Badge>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href="/partner/customers/new"
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                  Kunde anlegen
                </Link>
                <Link
                  href="/partner/customers"
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-4 h-4 flex-shrink-0 text-gray-400" strokeWidth={2} />
                  Alle Kunden anzeigen
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recently added customers */}
          <Card>
            <CardContent className="p-0">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Zuletzt hinzugefügt</h2>
                <p className="text-sm text-gray-500 mt-0.5">Die letzten 3 Kunden</p>
              </div>

              {recentCustomers.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Users className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Noch keine Kunden vorhanden</p>
                  <Link
                    href="/partner/customers/new"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-900 hover:underline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Ersten Kunden anlegen
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {recentCustomers.map((customer) => (
                    <li
                      key={customer.id}
                      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-600">
                          {customer.first_name.charAt(0).toUpperCase()}
                          {customer.last_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Seit {formatDate(customer.created_at)}
                        </p>
                      </div>
                      <Link
                        href={`/partner/customers/${customer.id}`}
                        className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors"
                        aria-label="Details anzeigen"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
