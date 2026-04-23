import Link from 'next/link';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';
import { ContactForm } from '@/components/marketing/ContactForm';

export const metadata = {
  title: 'Kostenloses Erstgespräch – BODYTIME concept Partner',
  description: 'Sichere dir jetzt dein persönliches und kostenloses Erstgespräch. Wir zeigen dir, wie du mit BODYTIME concept als Partner erfolgreich wirst.',
};

const BENEFITS = [
  { icon: <TrendingUp className="h-4 w-4" />, text: 'Verdiene direkt ab dem ersten Kunden – ohne lange Anlaufzeit' },
  { icon: <Zap className="h-4 w-4" />, text: 'Kein Equipment kaufen – deine Kunden mieten den EMS-Anzug direkt bei beurer' },
  { icon: <Users className="h-4 w-4" />, text: '100 % ortsunabhängig – skalierbar von 2 bis 10.000 Kunden, ohne neue Fixkosten' },
];

export default function B2BBeratungPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0F172A' }}>

      {/* Minimal B2B Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/8"
        style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-18 flex items-center justify-between"
          style={{ height: '72px' }}>
          <Link href="/b2b" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-white.svg" alt="BODYTIME concept" className="h-11" />
          </Link>
          <Link
            href="/b2b"
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* Left: Copy */}
            <div className="lg:sticky lg:top-32">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
                style={{ background: 'rgba(37,168,224,0.15)', color: '#60C8F0' }}>
                ✦ Kostenloses Erstgespräch
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
                Starte als{' '}
                <span style={{
                  backgroundImage: 'linear-gradient(90deg, #25A8E0, #60C8F0, #2563EB)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  BODYTIME Partner
                </span>
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Gerne beraten wir dich persönlich und überprüfen gemeinsam, ob unser BODYTIME concept und dessen zahlreiche Vorteile genau das Richtige für dich sind. Das Gespräch findet komplett ohne Druck und ohne Verpflichtungen statt.
              </p>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                      style={{ background: 'rgba(37,168,224,0.15)', color: '#60C8F0' }}>
                      {b.icon}
                    </span>
                    <span className="text-[15px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{b.text}</span>
                  </li>
                ))}
              </ul>

              {/* Trust note */}
              <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Was passiert nach deiner Anfrage?</strong><br />
                  Wir melden uns in der Regel <strong style={{ color: 'rgba(255,255,255,0.8)' }}>innerhalb von 24 Stunden</strong> telefonisch bei dir. Unter Umständen auch per E-Mail – schau also bitte auch kurz in deinen Spam-Ordner, falls du nichts von uns hörst.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="rounded-3xl border p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <h2 className="text-xl font-bold text-white mb-1">Kontaktformular</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Felder mit <span className="text-red-400">*</span> sind Pflichtfelder.
              </p>

              <ContactForm variant="b2b" dark={true} />
            </div>

          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t py-8 px-5 sm:px-8 text-center" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} BODYTIME concept ·{' '}
          <Link href="/datenschutz" className="hover:text-white/60 transition-colors">Datenschutz</Link>
          {' · '}
          <Link href="/impressum" className="hover:text-white/60 transition-colors">Impressum</Link>
        </p>
      </footer>
    </div>
  );
}
