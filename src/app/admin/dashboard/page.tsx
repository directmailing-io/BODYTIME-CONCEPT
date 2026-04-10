import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Clock, AlertTriangle, ArrowRight, Gift } from 'lucide-react';
import { formatDate, fullName, daysUntilEnd } from '@/lib/utils';
import AdminMonthlyStats from '@/components/admin/AdminMonthlyStats';

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

function ExpiryBadge({ days }: { days: number }) {
  if (days < 30) return <Badge variant="danger">{days}d</Badge>;
  if (days < 60) return <Badge variant="warning">{days}d</Badge>;
  return <Badge variant="neutral">{days}d</Badge>;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const in90days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const adminClient = createAdminClient();

  const [
    { data: partners },
    { data: expiringCustomers },
    { data: recentCustomers },
    { data: allCustomers },
    { data: newReferrals },
  ] = await Promise.all([
    supabase
      .from('bt_profiles')
      .select('id, first_name, last_name, email, is_active, created_at')
      .eq('role', 'partner')
      .order('created_at', { ascending: false }),
    supabase
      .from('bt_customers')
      .select(`
        id, first_name, last_name, contract_end_date, is_active,
        partner:bt_profiles!partner_id(id, first_name, last_name)
      `)
      .eq('is_active', true)
      .gte('contract_end_date', today)
      .lte('contract_end_date', in90days)
      .order('contract_end_date', { ascending: true })
      .limit(20),
    supabase
      .from('bt_customers')
      .select(`
        id, first_name, last_name, created_at,
        partner:bt_profiles!partner_id(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('bt_customers')
      .select('created_at')
      .order('created_at', { ascending: true }),
    adminClient
      .from('bt_referrals')
      .select(`
        id, first_name, last_name, created_at,
        partner:bt_profiles!partner_id(id, first_name, last_name)
      `)
      .eq('status', 'eingegangen')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const totalPartners = partners?.length ?? 0;
  const activePartners = partners?.filter(p => p.is_active).length ?? 0;
  const totalCustomers = allCustomers?.length ?? 0;
  const expiringSoonCount = expiringCustomers?.length ?? 0;

  const kpiCards: KpiCardProps[] = [
    { icon: Users, value: totalPartners, label: 'Partner gesamt', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: UserCheck, value: activePartners, label: 'Aktive Partner', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { icon: Clock, value: totalCustomers, label: 'Kunden gesamt', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: AlertTriangle, value: expiringSoonCount, label: 'Ablaufend (90 Tage)', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  // Build monthly data for the stats chart (all-time)
  const customersByMonth: Record<string, number> = {};
  (allCustomers ?? []).forEach(c => {
    const key = c.created_at.slice(0, 7); // YYYY-MM
    customersByMonth[key] = (customersByMonth[key] ?? 0) + 1;
  });

  const partnersByMonth: Record<string, number> = {};
  (partners ?? []).forEach(p => {
    const key = p.created_at.slice(0, 7);
    partnersByMonth[key] = (partnersByMonth[key] ?? 0) + 1;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Übersicht aller wichtigen Kennzahlen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(card => <KpiCard key={card.label} {...card} />)}
      </div>

      {/* Expiring contracts + Recently added customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Expiring contracts */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Bald ablaufende Verträge</h2>
                <p className="text-sm text-gray-500 mt-0.5">Nächste 90 Tage</p>
              </div>
              <Link href="/admin/customers" className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {!expiringCustomers || expiringCustomers.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400">Keine Verträge laufen bald ab</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {expiringCustomers.map(c => {
                  const days = daysUntilEnd(c.contract_end_date);
                  const partner = c.partner as any;
                  return (
                    <li key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.first_name} {c.last_name}
                        </p>
                        {partner && (
                          <Link
                            href={`/admin/partners/${partner.id}`}
                            className="text-xs text-gray-400 hover:underline hover:text-gray-600 truncate"
                          >
                            {partner.first_name} {partner.last_name}
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <span className="text-xs text-gray-500">{formatDate(c.contract_end_date)}</span>
                        <ExpiryBadge days={days} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recently added customers */}
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Zuletzt hinzugefügte Kunden</h2>
                <p className="text-sm text-gray-500 mt-0.5">Die letzten 10 Kunden</p>
              </div>
              <Link href="/admin/customers" className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {!recentCustomers || recentCustomers.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400">Noch keine Kunden vorhanden</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentCustomers.map(c => {
                  const partner = c.partner as any;
                  return (
                    <li key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.first_name} {c.last_name}
                        </p>
                        {partner && (
                          <p className="text-xs text-gray-400 truncate">
                            {partner.first_name} {partner.last_name}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 ml-3 flex-shrink-0">{formatDate(c.created_at)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New referrals */}
      {(newReferrals?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-500" />
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Neue Empfehlungen</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Noch nicht bearbeitet</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {newReferrals!.length}
                </span>
                <Link href="/admin/empfehlungszentrale" className="text-sm text-gray-400 hover:text-gray-700 flex items-center gap-1">
                  Alle <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-gray-50">
              {newReferrals!.map((r: any) => {
                const partner = r.partner;
                return (
                  <li key={r.id}>
                    <Link
                      href={`/admin/empfehlungszentrale/${r.id}`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {r.first_name} {r.last_name}
                        </p>
                        {partner && (
                          <p className="text-xs text-gray-400 truncate">
                            von {partner.first_name} {partner.last_name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0">
                        <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                        <Badge variant="neutral">Eingegangen</Badge>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Monthly growth stats */}
      <AdminMonthlyStats
        customersByMonth={customersByMonth}
        partnersByMonth={partnersByMonth}
      />
    </div>
  );
}
