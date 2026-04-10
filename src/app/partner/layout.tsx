import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PartnerSidebar from '@/components/partner/PartnerSidebar';

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
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

  if (!profile || profile.role !== 'partner' || !profile.is_active) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#f5f5f7] overflow-hidden">
      <PartnerSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
