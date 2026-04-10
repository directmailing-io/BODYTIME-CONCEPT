import Link from 'next/link';
import { ExternalLink, AlertTriangle, UserPlus, Venus, Mars } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CopyCodeButton from '@/components/partner/CopyCodeButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VOUCHER_SETTING_KEY } from '@/lib/constants';

const SHOP_WOMEN = 'https://www.antelope-shop.com/de/p/as0013-mm/';
const SHOP_MEN   = 'https://www.antelope-shop.com/de/p/as0014-mm/';

/** Converts a full name to a URL-safe slug (lowercase, umlauts replaced, spaces → hyphens). */
function toUtmTerm(firstName: string, lastName: string): string {
  const raw = `${firstName} ${lastName}`;
  return raw
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function buildShopUrl(base: string, utmTerm: string): string {
  const url = new URL(base);
  url.searchParams.set('utm_source', 'bodytime-concept');
  url.searchParams.set('utm_term', utmTerm);
  return url.toString();
}

export default async function OrderPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: setting }, { data: profile }] = await Promise.all([
    supabase.from('bt_documents').select('file_url').eq('title', VOUCHER_SETTING_KEY).maybeSingle(),
    supabase.from('bt_profiles').select('first_name, last_name').eq('id', user.id).single(),
  ]);

  const voucherCode = setting?.file_url ?? 'BODYCONCEPT1';
  const utmTerm = toUtmTerm(profile?.first_name ?? '', profile?.last_name ?? '');
  const womenUrl = buildShopUrl(SHOP_WOMEN, utmTerm);
  const menUrl   = buildShopUrl(SHOP_MEN, utmTerm);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bestellung aufgeben</h1>
        <p className="text-sm text-gray-500 mt-1">Hier erfährst du, wie du eine Bestellung für deinen Endkunden aufgibst.</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {/* Step 1 – Copy voucher code */}
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="font-bold text-amber-900">Gutschein-Code UNBEDINGT eintragen!</h3>
                </div>
                <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                  Trage diesen Code beim Checkout im Warenkorb ein. <strong>Ohne diesen Code verliert dein Endkunde seinen Vorteil und kann dir nicht korrekt zugeordnet werden!</strong>
                </p>
                <div className="bg-white rounded-xl border border-amber-300 p-4 flex items-center justify-between gap-4">
                  <span className="text-2xl font-bold text-gray-900 tracking-widest">{voucherCode}</span>
                  <CopyCodeButton code={voucherCode} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 – Select product */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Produkt auswählen &amp; Bestellung aufgeben</h3>
                <p className="text-sm text-gray-600 mb-5">
                  Wähle gemeinsam mit deinem Endkunden das passende Produkt aus und schließe die Bestellung im Shop ab.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" variant="outline" className="flex-1 border-pink-200 text-pink-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-800">
                    <a href={womenUrl} target="_blank" rel="noopener noreferrer">
                      <Venus className="h-4 w-4" />
                      Für Frauen
                      <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-50" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800">
                    <a href={menUrl} target="_blank" rel="noopener noreferrer">
                      <Mars className="h-4 w-4" />
                      Für Männer
                      <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-50" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 – Register customer */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Kunden hier im System eintragen</h3>
                <p className="text-sm text-gray-600 mb-4">Lege den Endkunden nach der Bestellung hier in der Plattform an, um Laufzeit und Verlängerungen zu verwalten.</p>
                <Button variant="outline" asChild>
                  <Link href="/partner/customers/new">
                    <UserPlus className="h-4 w-4" />
                    Neuen Kunden anlegen
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
