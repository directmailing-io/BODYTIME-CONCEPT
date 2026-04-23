import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import MarketingNav from '@/components/marketing/MarketingNav';
import SiteFooter from '@/components/marketing/SiteFooter';
import { ContactForm } from '@/components/marketing/ContactForm';

export const metadata = {
  title: 'Kostenlose Beratung sichern – BODYTIME concept',
  description: 'Buche jetzt dein persönliches und kostenloses Beratungsgespräch. Wir zeigen dir, wie EMS-Training dein Leben verändern kann.',
};

const BENEFITS = [
  'Persönliches Gespräch – telefonisch oder per Video',
  'Wir finden gemeinsam heraus, was am besten zu dir passt',
  'Das Gespräch findet komplett ohne Druck statt',
];

export default function BeratungPage() {
  return (
    <>
      <MarketingNav />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left: Copy */}
            <div className="lg:sticky lg:top-32">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
                style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.12) 0%, rgba(37,99,235,0.12) 100%)', color: '#2563EB' }}>
                ✦ Kostenlos & unverbindlich
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                Deine kostenlose{' '}
                <span
                  className="gradient-text-animated"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #25A8E0, #2563EB, #60C8F0, #1E88E5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Beratung
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Gerne beraten wir dich persönlich und überprüfen gemeinsam, ob unser BODYTIME concept und dessen zahlreiche Vorteile genau das Richtige für dich sind. Das Gespräch findet komplett ohne Druck und ohne Verpflichtungen statt.
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {BENEFITS.map(b => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-[15px]">{b}</span>
                  </li>
                ))}
              </ul>

              {/* Trust note */}
              <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 leading-relaxed">
                  <strong className="text-gray-800">Was passiert nach deiner Anfrage?</strong><br />
                  Wir melden uns in der Regel <strong className="text-gray-800">innerhalb von 24 Stunden</strong> telefonisch bei dir. Unter Umständen auch per E-Mail – schau also bitte auch kurz in deinen Spam-Ordner, falls du nichts von uns hörst.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Kontaktformular</h2>
              <p className="text-sm text-gray-500 mb-6">Felder mit <span className="text-red-500">*</span> sind Pflichtfelder.</p>
              <ContactForm variant="b2c" />
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
