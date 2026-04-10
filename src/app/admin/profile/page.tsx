import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminPasswordForm from '@/components/admin/AdminPasswordForm';

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('bt_profiles')
    .select('first_name, last_name, email')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Admin'} · {profile?.email ?? user.email}
        </p>
      </div>
      <AdminPasswordForm />
    </div>
  );
}
