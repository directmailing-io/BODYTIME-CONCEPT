import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminPasswordForm from '@/components/admin/AdminPasswordForm';

export default async function PartnerSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Passwort und Zugangsdaten verwalten.</p>
      </div>
      <AdminPasswordForm />
    </div>
  );
}
