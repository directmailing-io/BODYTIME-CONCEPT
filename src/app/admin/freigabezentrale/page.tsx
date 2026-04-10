import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClipboardCheck } from 'lucide-react';
import FreigabezentraleClient from '@/components/admin/FreigabezentraleClient';
import type { SteckbriefWithPartner } from '@/types';

export default async function FreigabezentralePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    redirect('/login');
  }

  const adminClient = createAdminClient();

  // Fetch all steckbriefe (service role bypasses RLS)
  const { data: rawBios } = await adminClient
    .from('bt_steckbriefe')
    .select('*')
    .order('submitted_at', { ascending: false, nullsFirst: false });

  const bios = rawBios ?? [];
  const partnerIds = [...new Set(bios.map((b: { partner_id: string }) => b.partner_id))];

  let profiles: { id: string; first_name: string | null; last_name: string | null; email: string | null }[] = [];
  let partnerProfiles: { user_id: string; company_name: string | null }[] = [];

  if (partnerIds.length > 0) {
    const [{ data: p }, { data: pp }] = await Promise.all([
      adminClient
        .from('bt_profiles')
        .select('id, first_name, last_name, email')
        .in('id', partnerIds),
      adminClient
        .from('bt_partner_profiles')
        .select('user_id, company_name')
        .in('user_id', partnerIds),
    ]);
    profiles = p ?? [];
    partnerProfiles = pp ?? [];
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
  const ppMap = Object.fromEntries(partnerProfiles.map(pp => [pp.user_id, pp]));

  const enrichedBios: SteckbriefWithPartner[] = bios.map((bio: Record<string, unknown>) => {
    const p = profileMap[bio.partner_id as string];
    const pp = ppMap[bio.partner_id as string];
    return {
      ...bio,
      partner_first_name: p?.first_name ?? null,
      partner_last_name:  p?.last_name ?? null,
      partner_email:      p?.email ?? null,
      partner_company:    pp?.company_name ?? null,
    } as SteckbriefWithPartner;
  });

  const pendingCount = enrichedBios.filter(b => b.status === 'pending').length;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Freigabezentrale</h1>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
              {pendingCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Eingereichte Steckbriefe prüfen, freigeben oder ablehnen.
        </p>
      </div>

      <FreigabezentraleClient bios={enrichedBios} />
    </div>
  );
}
