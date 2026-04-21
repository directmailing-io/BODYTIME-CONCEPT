import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Globe, MapPin, UserPlus, Calendar, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, fullName, isExpired, isExpiringSoon } from '@/lib/utils';
import { getLicenseInfo } from '@/lib/utils/license';
import PartnerActions from '@/components/admin/PartnerActions';
import PartnerNotes from '@/components/admin/PartnerNotes';
import PartnerLicenseEditDialog from '@/components/admin/PartnerLicenseEditDialog';

interface ReferralRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

const REFERRAL_STATUS_LABEL: Record<string, string> = {
  eingegangen: 'Eingegangen',
  in_bearbeitung: 'In Bearbeitung',
  gewonnen: 'Gewonnen',
  kein_interesse: 'Kein Interesse',
};

const REFERRAL_STATUS_VARIANT: Record<string, 'success' | 'warning' | 'neutral' | 'danger'> = {
  eingegangen: 'neutral',
  in_bearbeitung: 'warning',
  gewonnen: 'success',
  kein_interesse: 'danger',
};

export default async function AdminPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [{ data: profile }, { data: partnerProfile }, { data: customers }, { data: referralsRaw }] = await Promise.all([
    supabase
      .from('bt_profiles')
      .select('id, first_name, last_name, email, is_active, created_at, role')
      .eq('id', id).eq('role', 'partner').single(),
    supabase
      .from('bt_partner_profiles')
      .select('company_name, address_street, address_zip, address_city, address_country, phone, website, admin_notes, license_start, license_duration_months, cancellation_notice_months, is_cancelled, cancellation_reason, cancellation_date')
      .eq('user_id', id).single(),
    supabase
      .from('bt_customers')
      .select('id, first_name, last_name, email, contract_end_date, is_active')
      .eq('partner_id', id).eq('is_active', true)
      .order('contract_end_date', { ascending: true }),
    adminClient
      .from('bt_referrals')
      .select('id, first_name, last_name, email, phone, status, created_at')
      .eq('partner_id', id).order('created_at', { ascending: false }),
  ]);

  if (!profile) notFound();

  const referrals = (referralsRaw ?? []) as ReferralRow[];
  const name = fullName(profile.first_name ?? '', profile.last_name ?? '');

  const licenseInfo = partnerProfile?.license_start
    ? getLicenseInfo(
        partnerProfile.license_start,
        partnerProfile.license_duration_months ?? 12,
        partnerProfile.is_cancelled ?? false,
        partnerProfile.cancellation_date ?? null,
        partnerProfile.cancellation_notice_months ?? null,
      )
    : null;

  const showExpiryWarning =
    licenseInfo &&
    !partnerProfile?.is_cancelled &&
    (licenseInfo.status === 'expiring_warning' || licenseInfo.status === 'auto_renewing');

  return (
    <div className="max-w-4xl mx-auto">

      {/* Back link */}
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5"
      >
        <ArrowLeft className="h-4 w-4" /> Alle Partner
      </Link>

      {/* Warning banner */}
      {showExpiryWarning && (
        <div className={`mb-4 rounded-xl border px-4 py-3 flex items-start gap-3 ${
          licenseInfo!.status === 'auto_renewing'
            ? 'bg-blue-50 border-blue-100'
            : 'bg-amber-50 border-amber-100'
        }`}>
          {licenseInfo!.status === 'auto_renewing' ? (
            <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          )}
          <div>
            {licenseInfo!.status === 'auto_renewing' ? (
              <p className="text-sm font-medium text-blue-800">
                Lizenz verlängert sich automatisch — Kündigung bis {formatDate(licenseInfo!.cancellationDeadline.toISOString())} möglich.
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-800">
                Lizenz läuft in {licenseInfo!.daysToInitialEnd} Tagen ab (am {formatDate(licenseInfo!.initialEnd.toISOString())}).
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-base sm:text-lg font-bold text-white">
              {(profile.first_name?.charAt(0) ?? '?').toUpperCase()}
              {(profile.last_name?.charAt(0) ?? '').toUpperCase()}
            </span>
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{name || '—'}</h1>
              <Badge variant={profile.is_active ? 'success' : 'neutral'} className="shrink-0">
                {profile.is_active ? 'Aktiv' : 'Deaktiviert'}
              </Badge>
              {partnerProfile?.is_cancelled && licenseInfo && (
                licenseInfo.contractEnded
                  ? <Badge variant="danger" className="shrink-0">Gekündigt</Badge>
                  : <Badge variant="warning" className="shrink-0">Gekündigt, endet {formatDate(licenseInfo.possibleEnd.toISOString())}</Badge>
              )}
              {licenseInfo && !partnerProfile?.is_cancelled && licenseInfo.status === 'auto_renewing' && (
                <Badge variant="warning" className="shrink-0">Verlängert sich automatisch</Badge>
              )}
            </div>
            {partnerProfile?.company_name && (
              <p className="text-sm text-gray-500">{partnerProfile.company_name}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />{profile.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />seit {formatDate(profile.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions row — below on all screens */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
          <PartnerActions
            partner={{
              id: profile.id,
              is_active: profile.is_active,
              first_name: profile.first_name,
              last_name: profile.last_name,
              is_cancelled: partnerProfile?.is_cancelled ?? false,
            }}
          />
        </div>
      </div>

      {/* ── Stats row (mobile-friendly) ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{customers?.length ?? 0}</p>
            <p className="text-xs text-gray-400 leading-tight">Kunden</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <UserPlus className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{referrals.length}</p>
            <p className="text-xs text-gray-400 leading-tight">Empfehlungen</p>
          </div>
        </div>
        {(partnerProfile?.phone || partnerProfile?.website) && (
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="space-y-2 text-sm text-gray-600">
              {partnerProfile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{partnerProfile.phone}</span>
                </div>
              )}
              {partnerProfile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={partnerProfile.website} target="_blank" rel="noopener noreferrer"
                    className="truncate text-gray-600 hover:underline hover:text-gray-900">
                    {partnerProfile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {(partnerProfile?.address_city || partnerProfile?.address_street) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{[partnerProfile.address_zip, partnerProfile.address_city].filter(Boolean).join(' ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Main grid — sidebar left, content right ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Left: License info + Notes */}
        <div className="md:col-span-1 space-y-4">

          {/* License information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lizenzinformationen</CardTitle>
                <PartnerLicenseEditDialog
                  partnerId={profile.id}
                  current={{
                    license_start: partnerProfile?.license_start ?? null,
                    license_duration_months: partnerProfile?.license_duration_months ?? null,
                    cancellation_notice_months: partnerProfile?.cancellation_notice_months ?? null,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!partnerProfile?.license_start ? (
                <p className="text-sm text-gray-400">Kein Lizenzstart hinterlegt.</p>
              ) : (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Lizenzstart</span>
                    <span className="font-medium text-gray-900">{formatDate(partnerProfile.license_start)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Laufzeit</span>
                    <span className="font-medium text-gray-900">
                      {(partnerProfile.license_duration_months ?? 12) >= 12 ? '12 Monate' : 'Monatlich'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Kündigungsfrist</span>
                    <span className="font-medium text-gray-900">
                      {(partnerProfile.cancellation_notice_months ?? (partnerProfile.license_duration_months === 1 ? 1 : 3)) === 1 ? '1 Monat' : '3 Monate'}
                    </span>
                  </div>
                  {licenseInfo && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Erstlaufzeit bis</span>
                        <span className="font-medium text-gray-900">{formatDate(licenseInfo.initialEnd.toISOString())}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Mögliches Ende</span>
                        <span className="font-medium text-gray-900">{formatDate(licenseInfo.possibleEnd.toISOString())}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Kündigung bis</span>
                        <span className="font-medium text-gray-900">{formatDate(licenseInfo.cancellationDeadline.toISOString())}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-1">
                        <span className="text-gray-500">Status</span>
                        {licenseInfo.status === 'cancelled_ended' && <Badge variant="danger">Gekündigt</Badge>}
                        {licenseInfo.status === 'cancelled' && <Badge variant="warning">Gekündigt, endet {formatDate(licenseInfo.possibleEnd.toISOString())}</Badge>}
                        {licenseInfo.status === 'monthly' && <Badge variant="neutral">Monatlich</Badge>}
                        {licenseInfo.status === 'auto_renewing' && <Badge variant="warning">Verlängert sich</Badge>}
                        {licenseInfo.status === 'expiring_warning' && <Badge variant="warning">Bald verlängerbar</Badge>}
                        {licenseInfo.status === 'active' && <Badge variant="success">Aktiv</Badge>}
                      </div>
                    </>
                  )}
                  {partnerProfile.is_cancelled && (
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      {partnerProfile.cancellation_date && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Gekündigt am</span>
                          <span className="font-medium text-gray-900">{formatDate(partnerProfile.cancellation_date)}</span>
                        </div>
                      )}
                      {partnerProfile.cancellation_reason && (
                        <div className="text-sm">
                          <p className="text-gray-500 mb-0.5">Grund</p>
                          <p className="text-gray-700 text-xs leading-relaxed">{partnerProfile.cancellation_reason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Internal notes */}
          <Card>
            <CardHeader><CardTitle>Interne Notizen</CardTitle></CardHeader>
            <CardContent>
              <PartnerNotes partnerId={profile.id} initialNotes={partnerProfile?.admin_notes ?? null} />
            </CardContent>
          </Card>
        </div>

        {/* Right: Customers + Referrals */}
        <div className="md:col-span-2 space-y-4">

          {/* Customers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kunden ({customers?.length ?? 0})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!customers || customers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Noch keine Kunden vorhanden.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">E-Mail</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vertragsende</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {customers.map(c => {
                        const expired = isExpired(c.contract_end_date);
                        const expiring = isExpiringSoon(c.contract_end_date);
                        return (
                          <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.first_name} {c.last_name}</td>
                            <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={expired ? 'text-red-600 font-medium' : expiring ? 'text-amber-600 font-medium' : 'text-gray-700'}>
                                {formatDate(c.contract_end_date)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {expired ? <Badge variant="danger">Abgelaufen</Badge>
                                : expiring ? <Badge variant="warning">Bald ablaufend</Badge>
                                : <Badge variant="success">Aktiv</Badge>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>Empfehlungen ({referrals.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {referrals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Noch keine Empfehlungen eingereicht.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Kontakt</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Datum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {referrals.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.first_name} {r.last_name}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div>
                              <p className="text-gray-600 text-xs">{r.email}</p>
                              {r.phone && <p className="text-gray-400 text-xs">{r.phone}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={REFERRAL_STATUS_VARIANT[r.status] ?? 'neutral'}>
                              {REFERRAL_STATUS_LABEL[r.status] ?? r.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell whitespace-nowrap">
                            {formatDate(r.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
