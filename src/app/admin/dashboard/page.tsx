import { createClient, createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, AlertTriangle, Gift, ArrowRight, Clock, CalendarClock } from 'lucide-react';
import { formatDate, daysUntilEnd, fullName } from '@/lib/utils';
import { getLicenseInfo } from '@/lib/utils/license';
import AdminMonthlyStats from '@/components/admin/AdminMonthlyStats';

function KpiCard({ icon: Icon, value, label, iconBg, iconColor, href }: {
  icon: React.ElementType; value: number; label: string;
  iconBg: string; iconColor: string; href?: string;
}) {
  const content = (
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none tracking-tight">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </CardContent>
  );
  return (
    <Card className={href ? 'hover:shadow-sm transition-shadow' : ''}>
      {href ? <Link href={href}>{content}</Link> : content}
    </Card>
  );
}

function ExpiryBadge({ days }: { days: number }) {
  if (days < 30) return <Badge variant="danger">{days}d</Badge>;
  if (days < 60) return <Badge variant="warning">{days}d</Badge>;
  return <Badge variant="neutral">{days}d</Badge>;
}

interface PartnerWithLicense {
  id: string;
  first_name: string | null;
  last_name: string | null;
  license_start: string | null;
  license_duration_months: number;
  daysToInitialEnd: number;
  status: string;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const todayStr = new Date().toISOString().split('T')[0];
  const in90days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [
    { data: partners },
    { data: expiringCustomers },
    { data: recentCustomers },
    { data: allCustomers },
    { data: newReferrals },
    { data: partnersWithLicense },
  ] = await Promise.all([
    supabase.from('bt_profiles')
      .select('id, first_name, last_name, is_active, created_at')
      .eq('role', 'partner').order('created_at', { ascending: false }),
    supabase.from('bt_customers')
      .select('id, first_name, last_name, contract_end_date, partner:bt_profiles!partner_id(id, first_name, last_name)')
      .eq('is_active', true).gte('contract_end_date', todayStr).lte('contract_end_date', in90days)
      .order('contract_end_date', { ascending: true }).limit(20),
    supabase.from('bt_customers')
      .select('id, first_name, last_name, created_at, partner:bt_profiles!partner_id(first_name, last_name)')
      .order('created_at', { ascending: false }).limit(8),
    supabase.from('bt_customers').select('created_at').order('created_at', { ascending: true }),
    adminClient.from('bt_referrals')
      .select('id, first_name, last_name, created_at, partner:bt_profiles!partner_id(id, first_name, last_name)')
      .eq('status', 'eingegangen').order('created_at', { ascending: false }).limit(8),
    supabase.from('bt_profiles')
      .select('id, first_name, last_name, bt_partner_profiles(license_start, license_duration_months, is_cancelled)')
      .eq('role', 'partner')
      .eq('is_active', true),
  ]);

  const totalPartners = partners?.length ?? 0;
  const totalCustomers = allCustomers?.length ?? 0;

  const customersByMonth: Record<string, number> = {};
  (allCustomers ?? []).forEach(c => {
    const k = c.created_at.slice(0, 7);
    customersByMonth[k] = (customersByMonth[k] ?? 0) + 1;
  });
  const partnersByMonth: Record<string, number> = {};
  (partners ?? []).forEach(p => {
    const k = p.created_at.slice(0, 7);
    partnersByMonth[k] = (partnersByMonth[k] ?? 0) + 1;
  });

  // Compute license warnings
  const expiringLicenses: PartnerWithLicense[] = [];
  (partnersWithLicense ?? []).forEach((p: any) => {
    const pp = Array.isArray(p.bt_partner_profiles) ? p.bt_partner_profiles[0] : p.bt_partner_profiles;
    if (!pp?.license_start || pp?.is_cancelled) return;
    const info = getLicenseInfo(pp.license_start, pp.license_duration_months ?? 12, false);
    if (info.status === 'expiring_warning' || info.status === 'auto_renewing') {
      expiringLicenses.push({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        license_start: pp.license_start,
        license_duration_months: pp.license_duration_months ?? 12,
        daysToInitialEnd: info.daysToInitialEnd,
        status: info.status,
      });
    }
  });
  expiringLicenses.sort((a, b) => a.daysToInitialEnd - b.daysToInitialEnd);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Übersicht</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Users}         value={totalPartners}                    label="Partner gesamt"       iconBg="bg-blue-50"   iconColor="text-blue-600"   href="/admin/partners" />
        <KpiCard icon={UserCheck}     value={totalCustomers}                   label="Kunden gesamt"        iconBg="bg-purple-50" iconColor="text-purple-600" href="/admin/customers" />
        <KpiCard icon={AlertTriangle} value={expiringCustomers?.length ?? 0}   label="Verträge ablaufend"   iconBg="bg-amber-50"  iconColor="text-amber-600"  href="/admin/customers" />
        <KpiCard icon={Gift}          value={newReferrals?.length ?? 0}        label="Offene Empfehlungen"  iconBg="bg-orange-50" iconColor="text-orange-500" href="/admin/empfehlungszentrale" />
      </div>

      {/* Growth chart */}
      <AdminMonthlyStats customersByMonth={customersByMonth} partnersByMonth={partnersByMonth} />

      {/* Action lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Expiring contracts */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Bald ablaufende Verträge</h2>
              <Link href="/admin/customers" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!expiringCustomers?.length ? (
              <div className="px-5 py-8 text-center">
                <Clock className="w-7 h-7 text-gray-100 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Keine Verträge laufen bald ab</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {expiringCustomers.map(c => {
                  const days = daysUntilEnd(c.contract_end_date);
                  const partner = c.partner as any;
                  return (
                    <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.first_name} {c.last_name}</p>
                        {partner && (
                          <Link href={`/admin/partners/${partner.id}`} className="text-xs text-gray-400 hover:underline truncate">
                            via {partner.first_name} {partner.last_name}
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:inline">{formatDate(c.contract_end_date)}</span>
                        <ExpiryBadge days={days} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent customers */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Zuletzt hinzugefügte Kunden</h2>
              <Link href="/admin/customers" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!recentCustomers?.length ? (
              <div className="px-5 py-8 text-center">
                <UserCheck className="w-7 h-7 text-gray-100 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Noch keine Kunden vorhanden</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentCustomers.map(c => {
                  const partner = c.partner as any;
                  return (
                    <li key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                      <div className="min-w-0 flex-1 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-gray-500">
                            {(c.first_name?.charAt(0) ?? '?').toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.first_name} {c.last_name}</p>
                          {partner && <p className="text-xs text-gray-400 truncate">via {partner.first_name} {partner.last_name}</p>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-3 shrink-0 whitespace-nowrap">{formatDate(c.created_at)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Expiring licenses */}
      {expiringLicenses.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Lizenzen laufen aus</h2>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold">
                  {expiringLicenses.length}
                </span>
              </div>
              <Link href="/admin/partners" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle Partner <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {expiringLicenses.map(p => (
                <li key={p.id}>
                  <Link href={`/admin/partners/${p.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <CalendarClock className="w-4 h-4 text-gray-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fullName(p.first_name ?? '', p.last_name ?? '') || '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {p.status === 'auto_renewing' ? 'Verlängert sich automatisch' : 'Bald verlängerbar'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {p.status === 'auto_renewing'
                        ? <Badge variant="warning">+{p.daysToInitialEnd}d</Badge>
                        : <Badge variant="neutral">{p.daysToInitialEnd}d</Badge>
                      }
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* New referrals */}
      {(newReferrals?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Neue Empfehlungen</h2>
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold">
                  {newReferrals!.length}
                </span>
              </div>
              <Link href="/admin/empfehlungszentrale" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
                Alle <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {newReferrals!.map((r: any) => (
                <li key={r.id}>
                  <Link href={`/admin/empfehlungszentrale/${r.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.first_name} {r.last_name}</p>
                      {r.partner && <p className="text-xs text-gray-400 truncate">von {r.partner.first_name} {r.partner.last_name}</p>}
                    </div>
                    <span className="text-xs text-gray-400 ml-3 shrink-0">{formatDate(r.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
