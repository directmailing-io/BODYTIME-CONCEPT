'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LogIn } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/ButtonColorful';

const NAV_LINKS = [
  { label: 'Wie es funktioniert', href: '#wie-es-funktioniert' },
  { label: 'Das Produkt',          href: '#produkt' },
  { label: 'Trainer finden',       href: '#trainer' },
  { label: 'Über uns',             href: '#team' },
  { label: 'FAQ',                  href: '#faq' },
];

export default function MarketingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    // Check on mount in case page is already scrolled
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const transparent = !scrolled && !menuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/96 backdrop-blur-xl shadow-sm border-b border-gray-100/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[72px] lg:h-20">

            {/* ── Logo ── */}
            <Link href="/" className="flex-shrink-0" aria-label="BODYTIME concept">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="BODYTIME concept"
                width={64}
                height={64}
                className="h-14 lg:h-16 w-auto block transition-all duration-300"
                style={transparent ? { filter: 'brightness(0) invert(1)' } : undefined}
              />
            </Link>

            {/* ── Desktop nav links ── */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Hauptnavigation">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    transparent
                      ? 'text-white/85 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/b2b"
                className={`text-sm font-medium transition-colors duration-200 ${
                  transparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Partner werden
              </Link>
              <Link
                href="/login"
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl border transition-all duration-200 ${
                  transparent
                    ? 'text-white/80 border-white/30 hover:border-white/60 hover:text-white'
                    : 'text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Partner Zugang
              </Link>
              <ButtonColorful href="#beratung" label="Beratung sichern" />
            </div>

            {/* ── Mobile: CTA + Hamburger ── */}
            <div className="flex items-center gap-2 lg:hidden">
              <ButtonColorful href="#beratung" label="Beratung" className="h-9 px-4 text-xs" />
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={`p-2 rounded-lg transition-colors ${
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ── Mobile flyout ── */}
      <div
        className={`lg:hidden fixed left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-xl
          transition-all duration-300 ease-in-out ${
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ top: '72px' }}
        aria-hidden={!menuOpen}
      >
        <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/b2b"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Partner werden
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Partner Zugang zur Plattform
            </Link>
            <ButtonColorful
              href="#beratung"
              label="Kostenlose Beratung sichern"
              className="w-full justify-center"
              onClick={() => setMenuOpen(false)}
            />
          </div>
        </nav>
      </div>

      {/* ── Mobile backdrop ── */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
