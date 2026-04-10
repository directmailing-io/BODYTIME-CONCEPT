'use client';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Wie es funktioniert', href: '#wie-es-funktioniert' },
  { label: 'Das Produkt',          href: '#produkt' },
  { label: 'Trainer finden',       href: '#trainer' },
  { label: 'Über uns',             href: '#team' },
  { label: 'FAQ',                  href: '#faq' },
];

const LEGAL_LINKS = [
  { label: 'Impressum',    href: '/impressum' },
  { label: 'Datenschutz',  href: '/datenschutz' },
  { label: 'AGB',          href: '/agb' },
];

export default function SiteFooter() {
  return (
    <footer
      className="relative"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #050d18 100%)', borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px 24px 0 0' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" aria-label="BODYTIME concept">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="BODYTIME concept"
                className="h-14 sm:h-20 w-auto mb-5"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-5">
              EMS Training für zuhause. Persönlich begleitet von zertifizierten Experten.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/25 uppercase tracking-wider font-medium">Partner von</span>
              <span className="text-[13px] font-semibold text-white/50">ANTELOPE by beurer</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-4">
              Navigation
            </p>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Partner + Legal */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-4">
              Partner & Rechtliches
            </p>
            <ul className="flex flex-col gap-2.5 mb-6">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/55 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Partner-Login
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">Trainer</span>
                </Link>
              </li>
            </ul>
            <ul className="flex flex-col gap-2.5">
              {LEGAL_LINKS.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('showCookieConsent'))}
                  className="text-sm text-white/55 hover:text-white transition-colors text-left"
                >
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} BODYTIME concept. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-white/20">
            EMS Training · Deutschland
          </p>
        </div>

      </div>
    </footer>
  );
}
