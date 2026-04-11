import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('role, is_active, first_name, last_name, email, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    redirect('/login');
  }

  const adminClient = createAdminClient();
  const { count: newReferralCount } = await adminClient
    .from('bt_referrals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'eingegangen');

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">
      <AdminSidebar profile={profile} newReferralCount={newReferralCount ?? 0} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pb-24 lg:p-8 lg:pb-8">{children}</div>
      </main>
    </div>
  );
}
