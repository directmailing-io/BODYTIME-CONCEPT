import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSettingsForm from '@/components/admin/AdminSettingsForm';
import { VOUCHER_SETTING_KEY } from '@/lib/constants';

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: voucherSetting } = await supabase
    .from('bt_documents')
    .select('file_url')
    .eq('title', VOUCHER_SETTING_KEY)
    .maybeSingle();

  const voucherCode = voucherSetting?.file_url ?? '';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Globale Konfiguration für alle Partner</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Gutschein-Code</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Dieser Code wird allen Partnern auf der Bestellseite angezeigt und muss beim Checkout eingetragen werden.
          </p>
          <AdminSettingsForm voucherCode={voucherCode} />
        </CardContent>
      </Card>
    </div>
  );
}
