import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CustomerEditForm from '@/components/partner/CustomerEditForm';

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: customer } = await supabase
    .from('bt_customers')
    .select('*')
    .eq('id', id)
    .single();

  if (!customer || customer.partner_id !== user.id) notFound();

  return (
    <div className="max-w-2xl">
      <Link href={`/partner/customers/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {customer.first_name} {customer.last_name} bearbeiten
      </h1>
      <CustomerEditForm customer={customer} />
    </div>
  );
}
