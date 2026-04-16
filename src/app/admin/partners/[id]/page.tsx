import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Globe, MapPin, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, fullName, isExpired, isExpiringSoon } from '@/lib/utils';
import PartnerActions from '@/components/admin/PartnerActions';
import PartnerNotes from '@/components/admin/PartnerNotes';

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
      .eq('id', id)
      .eq('role', 'partner')
      .single(),
    supabase
      .from('bt_partner_profiles')
      .select('company_name, address_street, address_zip, address_city, address_country, phone, website, admin_notes')
      .eq('user_id', id)
      .single(),
    supabase
      .from('bt_customers')
      .select('id, first_name, last_name, email, contract_end_date, rental_duration_months, is_active')
      .eq('partner_id', id)
      .eq('is_active', true)
      .order('contract_end_date', { ascending: true }),
    adminClient
      .from('bt_referrals')
      .select('id, first_name, last_name, email, phone, status, created_at')
      .eq('partner_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!profile) notFound();

  const referrals = (referralsRaw ?? []) as ReferralRow[];
  const name = fullName(profile.first_name ?? '', profile.last_name ?? '');

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Alle Partner
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">
              {(profile.first_name?.charAt(0) ?? '?').toUpperCase()}
              {(profile.last_name?.charAt(0) ?? '').toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{name || '—'}</h1>
            {partnerProfile?.company_name && (
              <p className="text-sm text-gray-500 mt-0.5">{partnerProfile.company_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={profile.is_active ? 'success' : 'neutral'}>
            {profile.is_active ? 'Aktiv' : 'Deaktiviert'}
          </Badge>
          <PartnerActions
            partner={{
              id: profile.id,
              is_active: profile.is_active,
              first_name: profile.first_name,
              last_name: profile.last_name,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact */}
          <Card>
            <CardHeader><CardTitle>Kontakt</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {profile.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {partnerProfile?.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{partnerProfile.phone}</span>
                </div>
              )}
              {partnerProfile?.website && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={partnerProfile.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-gray-600">
                    {partnerProfile.website}
                  </a>
                </div>
              )}
              {(partnerProfile?.address_city || partnerProfile?.address_street) && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    {partnerProfile.address_street && <p>{partnerProfile.address_street}</p>}
                    {(partnerProfile.address_zip || partnerProfile.address_city) && (
                      <p>{[partnerProfile.address_zip, partnerProfile.address_city].filter(Boolean).join(' ')}</p>
                    )}
                    {partnerProfile.address_country && partnerProfile.address_country !== 'Deutschland' && (
                      <p>{partnerProfile.address_country}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-1 border-t border-gray-50 text-xs text-gray-400">
                Registriert am {formatDate(profile.created_at)}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader><CardTitle>Interne Notizen</CardTitle></CardHeader>
            <CardContent>
              <PartnerNotes
                partnerId={profile.id}
                initialNotes={partnerProfile?.admin_notes ?? null}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customers */}
          <Card>
            <CardHeader>
              <CardTitle>Kunden ({customers?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!customers || customers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Noch keine Kunden vorhanden.</p>
              ) : (
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
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {c.first_name} {c.last_name}
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.email}</td>
                          <td className="px-4 py-3">
                            <span className={expired ? 'text-red-600 font-medium' : expiring ? 'text-amber-600 font-medium' : 'text-gray-700'}>
                              {formatDate(c.contract_end_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {expired
                              ? <Badge variant="danger">Abgelaufen</Badge>
                              : expiring
                              ? <Badge variant="warning">Bald ablaufend</Badge>
                              : <Badge variant="success">Aktiv</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Referrals */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gray-400" />
                <CardTitle>Empfehlungen ({referrals.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {referrals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">Noch keine Empfehlungen eingereicht.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Kontakt</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Eingereicht</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.first_name} {r.last_name}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-gray-600 text-xs">{r.email}</p>
                            {r.phone && <p className="text-gray-400 text-xs">{r.phone}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={REFERRAL_STATUS_VARIANT[r.status] ?? 'neutral'}>
                            {REFERRAL_STATUS_LABEL[r.status] ?? r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell whitespace-nowrap">
                          {formatDate(r.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
