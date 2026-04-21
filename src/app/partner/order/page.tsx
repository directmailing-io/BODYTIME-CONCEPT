import Link from 'next/link';
import { ExternalLink, AlertTriangle, UserPlus, Venus, Mars, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CopyCodeButton from '@/components/partner/CopyCodeButton';
import ShareOrderLink from '@/components/partner/ShareOrderLink';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { VOUCHER_SETTING_KEY } from '@/lib/constants';

const SHOP_WOMEN = 'https://www.antelope-shop.com/de/p/as0013-mm/';
const SHOP_MEN   = 'https://www.antelope-shop.com/de/p/as0014-mm/';

function toUtmTerm(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Neue Bestellung</h1>
        <p className="text-sm text-gray-500 mt-1">Folge diesen 3 Schritten, um eine Bestellung für deinen Kunden aufzugeben.</p>
      </div>

      <ShareOrderLink url={`${process.env.NEXT_PUBLIC_APP_URL}/bestellung/${user.id}`} />

      {/* Steps */}
      <div className="space-y-3 md:space-y-4">

        {/* ── Step 1 — Voucher code (critical) ─────────────────── */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-amber-200">
            <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <h3 className="font-bold text-amber-900 text-sm leading-tight">Gutschein-Code UNBEDINGT eintragen!</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4 pt-3">
            <p className="text-sm text-amber-800 mb-4 leading-relaxed">
              Trage diesen Code beim Checkout im Warenkorb ein. <strong>Ohne diesen Code verliert dein Kunde seinen Vorteil und kann dir nicht zugeordnet werden!</strong>
            </p>
            {/* Voucher code — hero */}
            <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-center justify-between gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-widest font-mono">{voucherCode}</span>
              <CopyCodeButton code={voucherCode} />
            </div>
          </div>
        </div>

        {/* ── Step 2 — Select product & order ──────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <h3 className="font-semibold text-gray-900 text-sm">Produkt auswählen &amp; Bestellung aufgeben</h3>
          </div>
          <div className="px-4 pb-4 pt-3">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Wähle gemeinsam mit deinem Kunden das passende Produkt und schließe die Bestellung im Shop ab.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={womenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 hover:border-pink-300 transition-colors active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center shrink-0">
                  <Venus className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-pink-800 text-sm">Für Frauen</p>
                  <p className="text-xs text-pink-500 truncate">antelope-shop.com</p>
                </div>
                <ExternalLink className="h-4 w-4 text-pink-400 shrink-0" />
              </a>
              <a
                href={menUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                  <Mars className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-800 text-sm">Für Männer</p>
                  <p className="text-xs text-blue-500 truncate">antelope-shop.com</p>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-400 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Step 3 — Register customer ────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <h3 className="font-semibold text-gray-900 text-sm">Kunden hier im System eintragen</h3>
          </div>
          <div className="px-4 pb-4 pt-3">
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Nach der Bestellung den Kunden in der Plattform anlegen, damit du Laufzeit und Verlängerungen im Blick behältst.
            </p>
            <Link
              href="/partner/customers/new"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-900 hover:bg-gray-800 transition-colors active:scale-[0.98] w-full"
            >
              <UserPlus className="h-5 w-5 text-white shrink-0" />
              <span className="font-semibold text-white flex-1">Neuen Kunden anlegen</span>
              <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
