import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AdminReferralDetail from '@/components/admin/AdminReferralDetail';

export default async function AdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminClient = createAdminClient();

  const [{ data: referral }, { data: notes }] = await Promise.all([
    adminClient
      .from('bt_referrals')
      .select(`
        id, first_name, last_name, phone, email, note, status, created_at, updated_at,
        partner:bt_profiles!partner_id(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .single(),
    adminClient
      .from('bt_referral_notes')
      .select('id, content, created_at, updated_at')
      .eq('referral_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!referral) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/empfehlungszentrale"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Empfehlungen
      </Link>

      <AdminReferralDetail referral={referral} notes={notes ?? []} />
    </div>
  );
}
