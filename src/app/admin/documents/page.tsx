import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdminDocumentsClient from '@/components/admin/AdminDocumentsClient';

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('bt_documents')
    .select('*')
    .not('title', 'like', '__setting:%')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dokumente & Videos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Inhalte für Partner verwalten</p>
      </div>
      <AdminDocumentsClient documents={documents ?? []} />
    </div>
  );
}
