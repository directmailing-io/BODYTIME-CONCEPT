'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Check, ChevronDown, Menu, X, LogIn,
  Zap, Package, HeadphonesIcon, GraduationCap,
  TrendingUp, Users, Clock, Shield,
  CalendarDays, MessageCircle, CheckCircle2, Plus,
  Building2, ArrowRight, BadgeCheck, Coins, UserX, Layers,
  Smartphone, MapPin, Heart, Dumbbell, Timer,
} from 'lucide-react';
import Image from 'next/image';
import { ButtonColorful } from '@/components/ui/ButtonColorful';
import SiteFooter from '@/components/marketing/SiteFooter';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const B2B_NAV_LINKS = [
  { label: 'Das Konzept',     href: '#konzept' },
  { label: 'Für Studios',     href: '#studio-betreiber' },
  { label: 'Was du bekommst', href: '#leistungen' },
  { label: 'Investition',     href: '#preise' },
  { label: 'FAQ',             href: '#faq' },
];

/* ─── Nav (same style as MarketingNav) ─────────────────────────── */
function B2BNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

            {/* Logo */}
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

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Partner-Navigation">
              {B2B_NAV_LINKS.map(link => (
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

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors duration-200 ${
                  transparent ? 'text-white/65 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Für Kunden
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
              <ButtonColorful href="#kontakt" label="Gespräch buchen" />
            </div>

            {/* Mobile: CTA + Hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <ButtonColorful href="#kontakt" label="Gespräch" className="h-9 px-4 text-xs" />
              <button
                onClick={() => setMenuOpen(o => !o)}
                className={`p-2 rounded-lg transition-colors ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'
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

      {/* Mobile flyout */}
      <div
        className={`lg:hidden fixed left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-xl
          transition-all duration-300 ease-in-out ${
          menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ top: '72px' }}
        aria-hidden={!menuOpen}
      >
        <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
          {B2B_NAV_LINKS.map(link => (
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
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
            >
              Zur Kundenseite
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
              href="#kontakt"
              label="Kostenloses Gespräch buchen"
              className="w-full justify-center"
              onClick={() => setMenuOpen(false)}
            />
          </div>
        </nav>
      </div>

      {/* Mobile backdrop */}
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

/* ─── Hero (background image + overlay, same as B2C) ───────────── */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100dvh',
        backgroundImage: 'url(/bodytime-concept-b2b.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 20%',
      }}
    >
      {/* Base darkening layer */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'rgba(8,12,24,0.45)' }} />
      {/* Gradient – Mobile */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,12,24,0.55) 0%, rgba(8,12,24,0.75) 38%, rgba(8,12,24,0.95) 65%, rgba(8,12,24,1) 100%)',
        }}
      />
      {/* Gradient – Desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'linear-gradient(to right, rgba(8,12,24,0.98) 0%, rgba(8,12,24,0.95) 28%, rgba(8,12,24,0.80) 50%, rgba(8,12,24,0.45) 70%, rgba(8,12,24,0.2) 88%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="hero-content w-full pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 md:max-w-lg lg:max-w-xl xl:max-w-2xl">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55 mb-5">
            Für sportaffine Selbstständige
          </p>

          <h1 className="font-semibold text-white leading-[1.02] tracking-tight mb-6
                         text-[42px] sm:text-[54px] md:text-[58px] lg:text-[68px] xl:text-[76px]">
            Dein EMS-Business{' '}
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              ohne Risiko starten.
            </span>
          </h1>

          <p className="text-white/60 text-base sm:text-[17px] leading-relaxed mb-9 max-w-md font-light">
            Ob du gerade erst anfängst oder schon ein Studio betreibst und dein Angebot erweitern willst:
            Mit BODYTIME concept bekommst du ein fertiges System, das bereits funktioniert,
            und Menschen, die dich wirklich begleiten, damit dir keine Fehler passieren.
          </p>

          <ul className="space-y-3.5 mb-10">
            {[
              'Führe dein EMS-Business von überall und verdiene ohne Wachstumsgrenze.',
              'Betreue Kunden aus dem gesamten DACH-Raum, ohne sie je vor Ort zu sehen.',
              'Starte ohne Ladenlokal, ohne Gerätekosten und ohne großes Startkapital.',
            ].map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-[14px] sm:text-[15px] text-white/80 font-light leading-snug"
              >
                <CheckCircle2
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#25A8E0' }}
                />
                {b}
              </li>
            ))}
          </ul>

          <ButtonColorful
            href="#kontakt"
            label="Kostenloses Gespräch buchen"
            className="h-12 px-7 text-[15px]"
          />

          <p className="mt-4 text-[11px] text-white/30 tracking-widest uppercase">
            Unverbindlich · Kostenlos · In 30 Minuten
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Reusable connector badge ──────────────────────────────────── */
function PlusBadge() {
  return (
    <div
      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl select-none"
      style={{
        background: 'linear-gradient(135deg, #25A8E0, #07C8DB)',
        boxShadow: '0 0 28px rgba(37,168,224,0.45)',
        lineHeight: '1',
      }}
    >
      <span style={{ lineHeight: 1, display: 'block' }}>+</span>
    </div>
  );
}

/* ─── Studio-Betreiber Section ──────────────────────────────────── */
function StudioBetreiberSection() {
  const WHAT_IT_MEANS = [
    {
      num: '01',
      title: 'Für viele ist dein Studio zu teuer.',
      desc: 'Nicht weil dein Preis falsch ist, sondern weil 120 Euro im Monat für viele Menschen schlicht nicht drin sind. Das ist eine riesige Zielgruppe, die du heute gar nicht erst erreichst.',
    },
    {
      num: '02',
      title: 'Wachstum im Studio hat natürliche Grenzen.',
      desc: 'Mehr Kunden bedeuten mehr Personal, mehr Fläche, mehr Aufwand. Irgendwann ist die Kapazität erreicht. Mit BODYTIME concept wächst du ohne diesen Engpass.',
    },
    {
      num: '03',
      title: 'Kunden, die aufhören, sind meistens einfach weg.',
      desc: 'Wer dein Studio verlässt, landet beim nächsten Anbieter. Bietest du selbst eine günstigere Option an, bleibt der Kunde in deinem System, unter deinem Namen.',
    },
  ];

  const cardBase = 'flex flex-col flex-1 overflow-hidden rounded-2xl';

  return (
    <section
      id="studio-betreiber"
      className="relative overflow-hidden"
      style={{ background: '#080c18', marginTop: '-1px' }}
    >
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.1) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Du bist Studiobesitzer?
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
            Mehr Reichweite.{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Gleiche Basis.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed font-light">
            Du hast die Erfahrung, die Kunden und das Know-how. Was dir fehlt, ist ein Angebot
            für die Menschen, die dein Studio wollen, aber den Preis nicht zahlen können.
            Genau da setzt BODYTIME concept an.
          </p>
        </motion.div>

        {/* ── Equation ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease }}
          className="mb-16"
        >

          {/* ── Mobile: stacked ── */}
          <div className="flex flex-col gap-3 md:hidden">

            {/* Card A */}
            <div className={cardBase} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-full overflow-hidden" style={{ height: '140px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/studio-existing.jpg" alt="Dein EMS-Studio" className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.18em] mb-3">Dein EMS-Studio</p>
                <ul className="flex flex-col gap-2.5">
                  {['Kunden, die Zeit haben vor Ort zu trainieren', 'Kunden, die 120 bis 160 Euro im Monat ausgeben', 'Nur so viele Kunden, wie dein Personal schafft', 'Nur relevant für Menschen aus deiner Region'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/45 leading-snug"><span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0 mt-[5px]" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* + connector */}
            <div className="flex items-center justify-center py-1"><PlusBadge /></div>

            {/* Card B */}
            <div className={cardBase} style={{ background: 'linear-gradient(160deg, rgba(37,168,224,0.12) 0%, rgba(37,99,235,0.07) 100%)', border: '1px solid rgba(37,168,224,0.25)' }}>
              <div className="w-full overflow-hidden" style={{ height: '140px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bodytime-home.jpg" alt="BODYTIME concept Training" className="w-full h-full object-cover object-center" />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#07C8DB' }}>BODYTIME concept</p>
                <ul className="flex flex-col gap-2.5">
                  {['Kunden, die jederzeit und überall trainieren wollen', 'Einstieg ab 55 Euro pro Monat möglich', 'Kein Limit, egal wie viele Kunden du hast', 'Kunden aus ganz Deutschland erreichbar'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/50 leading-snug"><span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: '#25A8E0' }} />{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* = connector */}
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-xl font-bold text-white/25">=</span>
            </div>

            {/* Result card */}
            <div className={cardBase} style={{ background: 'linear-gradient(160deg, rgba(37,168,224,0.2) 0%, rgba(37,99,235,0.13) 100%)', border: '1px solid rgba(37,168,224,0.32)', boxShadow: '0 0 48px rgba(37,168,224,0.1)' }}>
              <div className="flex items-center justify-center px-5 py-6" style={{ borderBottom: '1px solid rgba(37,168,224,0.15)' }}>
                <p className="text-[20px] font-semibold text-white leading-tight tracking-tight text-center">Ein Angebot. Jede Zielgruppe.</p>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: 'rgba(37,200,219,0.7)' }}>Was das ergibt</p>
                <ul className="flex flex-col gap-2.5">
                  {['Training wird für viel mehr Menschen erschwinglich', 'Dein Wachstum hat keine Deckelung mehr', 'Kunden, die gehen wollen, bleiben trotzdem bei dir', 'Umsatz steigt ohne höhere Fixkosten'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/65 leading-snug">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}><Check className="w-2 h-2 text-white" strokeWidth={3} /></div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Desktop/Tablet: horizontal with floating + ── */}
          <div className="hidden md:flex items-stretch gap-0">

            {/* Card A – fully rounded */}
            <div
              className="flex flex-col flex-1 overflow-hidden rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="w-full flex-shrink-0 overflow-hidden rounded-t-2xl" style={{ height: '160px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/studio-existing.jpg" alt="Dein EMS-Studio" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.18em] mb-4">Dein EMS-Studio</p>
                <ul className="flex flex-col gap-3 flex-1">
                  {['Kunden, die Zeit haben vor Ort zu trainieren', 'Kunden, die 120 bis 160 Euro im Monat ausgeben', 'Nur so viele Kunden, wie dein Personal schafft', 'Nur relevant für Menschen aus deiner Region'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/45 leading-snug"><span className="w-1.5 h-1.5 rounded-full bg-white/20 flex-shrink-0 mt-[5px]" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* + bridge connector */}
            <div className="flex-shrink-0 w-14 flex items-center justify-center relative">
              {/* faint connecting line behind the badge */}
              <div className="absolute inset-y-1/2 inset-x-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(37,168,224,0.35), rgba(255,255,255,0.08))' }} />
              <PlusBadge />
            </div>

            {/* Card B – fully rounded */}
            <div
              className="flex flex-col flex-1 overflow-hidden rounded-2xl"
              style={{ background: 'linear-gradient(160deg, rgba(37,168,224,0.12) 0%, rgba(37,99,235,0.07) 100%)', border: '1px solid rgba(37,168,224,0.25)' }}
            >
              <div className="w-full flex-shrink-0 overflow-hidden rounded-t-2xl" style={{ height: '160px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/bodytime-home.jpg" alt="BODYTIME concept Training" className="w-full h-full object-cover object-center" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>BODYTIME concept</p>
                <ul className="flex flex-col gap-3 flex-1">
                  {['Kunden, die jederzeit und überall trainieren wollen', 'Einstieg ab 55 Euro pro Monat möglich', 'Kein Limit, egal wie viele Kunden du hast', 'Kunden aus ganz Deutschland erreichbar'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/50 leading-snug"><span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[5px]" style={{ background: '#25A8E0' }} />{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* = connector */}
            <div className="flex-shrink-0 flex items-center justify-center w-10 text-xl font-bold text-white/25 select-none">=</div>

            {/* Result Card – fully rounded */}
            <div
              className="flex flex-col flex-1 overflow-hidden rounded-2xl"
              style={{ background: 'linear-gradient(160deg, rgba(37,168,224,0.2) 0%, rgba(37,99,235,0.13) 100%)', border: '1px solid rgba(37,168,224,0.32)', boxShadow: '0 0 60px rgba(37,168,224,0.1)' }}
            >
              <div className="flex items-center justify-center px-6 flex-shrink-0" style={{ height: '160px', borderBottom: '1px solid rgba(37,168,224,0.15)' }}>
                <p className="text-[22px] lg:text-[24px] font-semibold text-white leading-tight tracking-tight text-center">
                  Ein Angebot.<br />Jede Zielgruppe.
                </p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: 'rgba(37,200,219,0.7)' }}>Was das ergibt</p>
                <ul className="flex flex-col gap-3 flex-1">
                  {['Training wird für viel mehr Menschen erschwinglich', 'Dein Wachstum hat keine Deckelung mehr', 'Kunden, die gehen wollen, bleiben trotzdem bei dir', 'Umsatz steigt ohne höhere Fixkosten'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-[12px] text-white/65 leading-snug">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}><Check className="w-2 h-2 text-white" strokeWidth={3} /></div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── Realtalk intro + numbered rows ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-2xl mx-auto text-center mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3 text-white/30">
            Wenn wir mal ehrlich sind ...
          </p>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed font-light">
            Ganz egal wie gut dein Studio läuft: Jedes klassische EMS-Studio-Modell hat natürliche Grenzen,
            die irgendwann jeden Betreiber betreffen. Und genau diese Grenzen lassen sich mit BODYTIME concept
            sinnvoll erweitern.
          </p>
        </motion.div>

        <div className="rounded-3xl overflow-hidden mb-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {WHAT_IT_MEANS.map(({ num, title, desc }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="flex items-start gap-5 sm:gap-8 px-6 sm:px-10 py-6 sm:py-8"
              style={{ borderBottom: i < WHAT_IT_MEANS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
            >
              <span
                className="text-[13px] font-semibold tracking-widest flex-shrink-0 mt-[3px] font-mono"
                style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {num}
              </span>
              <div className="flex-1">
                <p className="text-[17px] sm:text-[19px] font-semibold text-white mb-1.5 leading-snug">{title}</p>
                <p className="text-sm sm:text-base text-white/45 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
          className="flex flex-col items-center gap-3"
        >
          <ButtonColorful href="#kontakt" label="Gespräch für Studio-Betreiber buchen" className="h-12 px-8 text-[15px]" />
          <p className="text-[11px] text-white/25 tracking-widest uppercase">Unverbindlich · Kostenlos · In 30 Minuten</p>
        </motion.div>

      </div>
    </section>
  );
}

/* ─── Konzept – 3-Step Visual Flow ─────────────────────────────── */
const KONZEPT_STEPS = [
  {
    num: '01',
    tagline: 'Das Produkt',
    title: 'Der EMS-Suit von beurer.',
    desc: 'Das einzige textile EMS-System, das Shirt und Hose kombiniert und damit gleichzeitig Ober- und Unterkörper trainiert. Kein Kabelgewirr, kein kompliziertes Handling. Deine Kunden kaufen nichts, sie mieten direkt bei beurer mit Sonderkonditionen.',
    tags: ['Shirt und Hose', 'Miete statt Kauf', 'Exklusive Konditionen'],
    visual: 'product',
    accent: false,
  },
  {
    num: '02',
    tagline: 'Deine Rolle',
    title: 'Du begleitest. Wir liefern das System.',
    desc: 'Du führst deine Kunden ins Konzept ein, berätst sie individuell und bist ihr fester Ansprechpartner. Konzept, Technik, Know-how und die direkte Schnittstelle zu beurer kommen von uns. Du bringst deine Leidenschaft und dein Netzwerk mit.',
    tags: ['Individuelles Onboarding', 'Direkter beurer-Zugang', 'Regelmäßige Zielanpassungen'],
    visual: 'role',
    accent: true,
  },
  {
    num: '03',
    tagline: 'Dein Verdienst',
    title: 'Ab dem ersten Kunden verdienen.',
    desc: 'Unsere Partner verdienen in der Regel direkt ab dem ersten Kunden. Weil du komplett ortsunabhängig arbeitest, sind deinem Wachstum keine Grenzen gesetzt. Ob 2 Kunden oder 10.000, das Modell skaliert mit.',
    tags: ['Ab Tag eins verdienen', 'Von überall aus', '2 bis 10.000 Kunden'],
    visual: 'revenue',
    accent: false,
  },
];

function KonzeptSection() {
  return (
    <section
      id="konzept"
      className="relative bg-white z-10 overflow-hidden"
      style={{
        marginTop: '-24px',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-3xl mx-auto mb-14 lg:mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-4">
            Dein schlüsselfertiges Konzept
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
            In drei Schritten erklärt.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-light">
            Viele scheitern in der Fitnessbranche, weil das Investment zu hoch ist, die Strukturen
            zu komplex sind oder schlicht das Know-how fehlt. BODYTIME concept löst genau das.
          </p>
        </motion.div>

        {/* ── 3-Step Cards ── */}
        <style>{`
          @keyframes infinityGlow {
            0%, 100% {
              text-shadow: 0 0 12px rgba(255,255,255,0.35), 0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.05);
              opacity: 0.8;
            }
            50% {
              text-shadow: 0 0 24px rgba(255,255,255,0.85), 0 0 60px rgba(255,255,255,0.45), 0 0 120px rgba(255,255,255,0.2);
              opacity: 1;
            }
          }
        `}</style>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KONZEPT_STEPS.map((step, i) => {
            const isBlue = step.num === '03';
            const isLightBlue = step.num === '02';
            return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease, delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={isBlue ? {
                background: 'linear-gradient(160deg, #1a8fc7 0%, #1252a3 100%)',
                border: '1px solid rgba(37,168,224,0.4)',
                boxShadow: '0 0 60px rgba(37,168,224,0.18)',
              } : isLightBlue ? {
                background: 'linear-gradient(160deg, rgba(37,168,224,0.10) 0%, rgba(37,99,235,0.06) 100%)',
                border: '1px solid rgba(37,168,224,0.28)',
                boxShadow: '0 0 48px rgba(37,168,224,0.07)',
              } : {
                background: '#f8fafc',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {/* Visual area */}
              <div
                className="relative w-full overflow-hidden flex items-center justify-center"
                style={{
                  height: '220px',
                  background: isBlue
                    ? 'rgba(0,0,0,0.15)'
                    : isLightBlue
                      ? 'rgba(37,168,224,0.07)'
                      : 'rgba(0,0,0,0.03)',
                }}
              >
                {step.visual === 'product' && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src="/ems-antelope-suit.jpg" alt="ANTELOPE EMS-Suit von beurer" className="w-full h-full object-cover object-center" />
                )}
                {step.visual === 'role' && (
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-2 h-full w-full">
                    <div className="flex items-center gap-3 w-full max-w-[240px]">
                      <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.25), rgba(37,99,235,0.18))', border: '1px solid rgba(37,168,224,0.4)' }}
                        >
                          <Users className="w-6 h-6" style={{ color: '#25A8E0' }} />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#25A8E0' }}>Du</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        {['Deutschland', 'Österreich', 'Schweiz'].map((country, ci) => (
                          <div key={country} className="flex items-center gap-2">
                            <div className="flex-1 border-t border-dashed" style={{ borderColor: `rgba(37,168,224,${0.55 - ci * 0.1})` }} />
                            <div
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-600"
                              style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(37,168,224,0.18)' }}
                            >
                              {country}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {[0, 1, 2].map(j => (
                          <div
                            key={j}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)', opacity: 1 - j * 0.2 }}
                          >
                            K
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-center font-medium" style={{ color: 'rgba(37,168,224,0.65)' }}>
                      Kunden aus dem gesamten DACH-Raum betreuen
                    </p>
                  </div>
                )}
                {step.visual === 'revenue' && (
                  <div className="flex flex-col items-center justify-center gap-1 text-center px-6">
                    <p
                      className="font-semibold leading-none tracking-tighter text-white"
                      style={{
                        fontSize: 'clamp(80px, 14vw, 110px)',
                        animation: 'infinityGlow 3.5s ease-in-out infinite',
                      }}
                    >
                      ∞
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                      Skalierungspotenzial
                    </p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase font-mono"
                    style={isBlue ? { color: 'rgba(255,255,255,0.6)' } : {
                      background: 'linear-gradient(135deg, #25A8E0, #07C8DB)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}
                  >
                    {step.num}
                  </span>
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isBlue ? 'text-white/50' : 'text-gray-400'}`}>
                    {step.tagline}
                  </span>
                </div>
                <h3 className={`text-[17px] sm:text-[19px] font-semibold leading-snug ${isBlue ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed flex-1 ${isBlue ? 'text-white/70' : 'text-gray-500'}`}>{step.desc}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {step.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
                      style={isBlue
                        ? { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }
                        : { background: 'rgba(37,168,224,0.08)', color: '#25A8E0' }
                      }
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ─── Was du bekommst – Checklist ─────────────────────────────── */
const CHECKLIST_GROUPS = [
  {
    label: 'Dein Start',
    items: [
      'Persönliches Onboarding-Gespräch, individuell auf dich zugeschnitten',
      'Vollständige Einführung in das ANTELOPE-System von beurer',
      'Alles was du brauchst, um direkt loszulegen: Tools, Materialien, Unterlagen',
      'Schritt-für-Schritt-Plan für dein erstes Kundengespräch',
      'Know-how-Transfer aus 20 Jahren EMS-Erfahrung, damit dir keine Fehler passieren',
    ],
  },
  {
    label: 'Laufende Begleitung',
    items: [
      '365 Tage persönlicher Ansprechpartner für dich und deine Kunden',
      'Regelmäßige Calls und gemeinsame Zielanpassungen',
      'Direkte Schnittstelle zum Hersteller beurer',
      'Unterstützung bei technischen Fragen und herausfordernden Kundensituationen',
      'Wir passen uns an, wenn sich dein Business verändert',
    ],
  },
  {
    label: 'Deine Freiheit',
    items: [
      'Kein Ladenlokal, keine Gerätekosten, kein Lager',
      'Kunden gewinnen, egal wo du oder sie wohnen, komplett ortsunabhängig',
      'Keine Franchise-Strukturen, keine komplizierten Verträge',
      'Fang mit einem Kunden an und wachse in deinem eigenen Tempo',
      'Exklusiver Preisvorteil bei beurer für dich und deine Kunden',
    ],
  },
  {
    label: 'Know-how und Sicherheit',
    items: [
      '20 Jahre EMS-Expertise direkt auf dich übertragen',
      'Trainingskonzepte, die du sofort mit deinen Kunden anwenden kannst',
      'Wissen, das fatale Fehler für Einsteiger verhindert',
      'Professionelle Betreuungsstandards von Anfang an',
    ],
  },
];

function LeistungenSection() {
  return (
    <section
      id="leistungen"
      className="relative"
      style={{ background: '#080c18' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, ease }}
            className="md:sticky md:top-20 md:self-start lg:sticky lg:top-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#07C8DB' }}>
              Schlüsselfertiges Konzept
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight tracking-tight mb-5">
              Was du bekommst.
            </h2>
            <p className="text-base text-white/50 leading-relaxed font-light mb-8">
              Kein Ausprobieren auf eigene Kosten. Du bekommst ein fertiges System,
              das bereits funktioniert, und Menschen, die dich wirklich begleiten.
            </p>
            {/* Total count badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(37,168,224,0.1)', border: '1px solid rgba(37,168,224,0.2)' }}
            >
              <Check className="w-4 h-4" style={{ color: '#07C8DB' }} />
              <span className="text-sm font-semibold text-white/70">
                {CHECKLIST_GROUPS.reduce((acc, g) => acc + g.items.length, 0)} inklusive Leistungen
              </span>
            </div>
          </motion.div>

          {/* Checklist groups */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {CHECKLIST_GROUPS.map(({ label, items }, gi) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.55, ease, delay: gi * 0.08 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Group header */}
                <div
                  className="px-5 sm:px-6 py-3.5 border-b border-white/6"
                  style={{ background: 'rgba(37,168,224,0.07)' }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#25A8E0]">
                    {label}
                  </p>
                </div>
                {/* Items */}
                <div className="divide-y divide-white/5">
                  {items.map((item, ii) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.05 }}
                      transition={{ duration: 0.4, ease, delay: gi * 0.08 + ii * 0.04 }}
                      className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-white/70 leading-snug">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Was deine Kunden erleben (new) ────────────────────────────── */
function KundenerlebnisSection() {
  return (
    <section
      id="kundenerlebnis"
      className="relative z-10 overflow-hidden"
      style={{
        background: '#f7fbff',
        marginTop: '-24px',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="max-w-2xl mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-4">
            Das Erlebnis deiner Kunden
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
            Was du deinen Kunden{' '}
            <span className="text-gray-400">anbieten kannst.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-light">
            Das ist es, was deine Kunden erleben. Und genau deshalb macht es ihnen Spaß,
            dranbleiben wird zur Gewohnheit und Resultate stellen sich wirklich ein.
          </p>
        </motion.div>

        {/* ── Top: 3 stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

          {/* Sofortlösung */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease, delay: 0 }}
            className="p-6 sm:p-7 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #07C8DB 100%)', minHeight: '240px' }}
          >
            {/* Glow */}
            <div aria-hidden="true" className="absolute -top-10 -right-10 w-64 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 65%)', filter: 'blur(32px)' }} />
            <div className="relative flex flex-col gap-3">
              <p style={{ lineHeight: 1.0, letterSpacing: '-0.025em' }}>
                <span className="font-black text-white block"
                  style={{ fontSize: 'clamp(44px, 7vw, 64px)' }}>
                  Sofort-
                </span>
                <span className="font-black text-white block"
                  style={{ fontSize: 'clamp(44px, 7vw, 64px)', opacity: 0.55 }}>
                  lösung.
                </span>
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                Rückenbeschwerden, Verspannungen, Energiemangel - deine Kunden müssen nicht wochenlang auf einen Termin warten. Sie legen einfach sofort los.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-2">
              {['Regeneration', 'Wohlbefinden', 'Figur', 'Ausdauer', 'Rücken', 'Energie'].map((tag) => (
                <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Überall */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease, delay: 0.07 }}
            className="p-6 sm:p-7 rounded-2xl flex flex-col gap-4"
            style={{ background: 'linear-gradient(135deg, #e8f6fd 0%, #edf4ff 100%)', border: '1px solid rgba(37,168,224,0.2)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[17px] font-semibold text-gray-900 leading-snug mb-1.5">Kein Studio nötig.</p>
              <p className="text-sm leading-relaxed" style={{ color: '#1e6fa0' }}>
                Zuhause, im Garten, auf Geschäftsreise oder im Urlaub. Der Anzug passt in jeden Rucksack
                und das Training passt in jeden Alltag. Deine Kunden brauchen keinen festen Ort.
              </p>
            </div>
          </motion.div>

          {/* App-gestützt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease, delay: 0.14 }}
            className="p-6 sm:p-7 rounded-2xl flex flex-col gap-4"
            style={{ background: 'linear-gradient(135deg, #e8f6fd 0%, #edf4ff 100%)', border: '1px solid rgba(37,168,224,0.2)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)' }}
            >
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[17px] font-semibold text-gray-900 leading-snug mb-1.5">Selbstständig, nicht allein.</p>
              <p className="text-sm leading-relaxed" style={{ color: '#1e6fa0' }}>
                Die App führt durch jede Einheit und passt die Intensität an. Deine Kunden
                brauchen dich nicht vor Ort, aber du bleibst trotzdem ihr Ansprechpartner.
              </p>
            </div>
          </motion.div>

        </div>

        {/* ── Bottom: product card + promise card ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* EMS Anzug mieten */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease, delay: 0.21 }}
            className="rounded-2xl overflow-hidden flex flex-row items-center"
            style={{ background: 'linear-gradient(135deg, #e8f6fd 0%, #edf4ff 100%)', border: '1px solid rgba(37,168,224,0.2)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ems-app-suit.png"
              alt="EMS Anzug"
              className="w-36 sm:w-44 h-full object-contain p-4 flex-shrink-0"
              style={{ maxHeight: '200px' }}
            />
            <div className="p-5 sm:p-6 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-2">
                Miete statt Kauf
              </p>
              <p className="text-[17px] font-semibold text-gray-900 mb-2 leading-snug">
                Kein Anzug kaufen, einfach mieten.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Deine Kunden mieten den Anzug direkt bei beurer{' '}
                <span className="font-semibold text-[#25A8E0] underline underline-offset-2">mit Sonderkonditionen</span>,
                monatlich, ohne Kaufverpflichtung.
                Kein Risiko, keine Bindung, und bei Nichtgefallen 14 Tage Widerrufsrecht.
              </p>
            </div>
          </motion.div>

          {/* Dark promise card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.55, ease, delay: 0.28 }}
            className="rounded-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #071a24 0%, #080c18 100%)',
              border: '1px solid rgba(37,168,224,0.15)',
            }}
          >
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(37,168,224,0.22) 0%, transparent 65%)', filter: 'blur(32px)' }}
            />
            <div className="relative p-6 sm:p-8 flex flex-col justify-between gap-5 h-full">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
                  Was wirklich zählt
                </p>
                <p
                  className="font-semibold text-white leading-snug tracking-tight mb-5"
                  style={{ fontSize: 'clamp(20px, 2.5vw, 26px)' }}
                >
                  Deine Kunden kommen dran, weil es einfach ist. Und sie bleiben, weil es wirkt.
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    'Keine Terminpflicht, keine Fahrt, kein Aufwand',
                    'Ergebnisse, die man spürt, schon nach wenigen Wochen',
                    'Training, das endlich in den Alltag passt',
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                      >
                        <Check className="w-2 h-2 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-white/65 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ─── Preise – Preisaufbau ──────────────────────────────────────── */
function PreiseSection() {
  const components = [
    {
      label: 'Einmalig',
      price: '299 €',
      name: 'Onboarding-Paket',
      desc: 'Dein Start ins Business. Einmalig, individuell, vollständig.',
      items: ['Persönliches Onboarding', 'EMS-Einführung & Setup', 'Konzept & Toolzugang'],
    },
    {
      label: 'Pro Monat (netto)',
      price: '139 €',
      name: 'Smart Lizenz',
      desc: 'Alle laufenden Leistungen für dein Business.',
      items: ['365 Tage Ansprechpartner', 'Regelmäßige Calls', 'Direktzugang ANTELOPE by beurer'],
      highlight: true,
    },
    {
      label: 'Pro Endkunde',
      price: '11 €',
      name: 'Skalierbare Gebühr',
      desc: 'Nur wenn du aktive Kunden hast. Wächst mit dir.',
      items: ['Nur bei aktiven Kunden', 'Transparent & nachvollziehbar', 'Kein Fixkostenrisiko'],
    },
  ];

  return (
    <section
      id="preise"
      className="relative overflow-hidden"
      style={{ background: '#080c18', marginTop: '-1px' }}
    >
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.1) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Investition
          </p>
          <h2
            className="font-semibold text-white leading-tight tracking-tight mb-5"
            style={{ fontSize: 'clamp(28px, 4.5vw, 44px)' }}
          >
            So setzt sich dein{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Preis zusammen.
            </span>
          </h2>
          <p className="text-base text-white/50 leading-relaxed font-light">
            Keine versteckten Kosten. Keine Überraschungen.
            Du weißt von Anfang an, womit du kalkulieren kannst.
          </p>
        </motion.div>

        {/* Price buildup row */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0 max-w-4xl mx-auto mb-10">
          {components.map(({ label, price, name, desc, items, highlight }, i) => (
            <div key={name} className="flex flex-col lg:flex-row items-stretch flex-1">
              {/* Price component card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease, delay: i * 0.12 }}
                className="flex-1 rounded-2xl p-6 sm:p-7 flex flex-col"
                style={highlight ? {
                  background: 'linear-gradient(135deg, rgba(37,168,224,0.16) 0%, rgba(37,99,235,0.10) 100%)',
                  border: '1px solid rgba(37,168,224,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-3"
                  style={{ color: highlight ? '#07C8DB' : 'rgba(255,255,255,0.35)' }}>
                  {label}
                </p>
                <p
                  className="font-semibold text-white leading-none tracking-tighter mb-1"
                  style={{ fontSize: 'clamp(36px, 6vw, 52px)' }}
                >
                  {price}
                </p>
                <p className="text-sm mb-3" style={{ color: highlight ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)' }}>
                  {name}
                </p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: highlight ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)' }}>
                  {desc}
                </p>
                <div className="flex flex-col gap-2 mt-auto">
                  {items.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#07C8DB' }} />
                      <span className="text-sm" style={{ color: highlight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* + connector between cards */}
              {i < components.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: i * 0.12 + 0.2 }}
                  className="flex items-center justify-center p-4 lg:p-3 flex-shrink-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(37,168,224,0.12)', border: '1px solid rgba(37,168,224,0.25)' }}
                  >
                    <Plus className="w-4 h-4" style={{ color: '#25A8E0' }} />
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-center text-[11px] text-white/25 max-w-lg mx-auto leading-relaxed"
        >
          Alle Preise zzgl. MwSt. Der ANTELOPE EMS-Suit wird direkt zwischen deinen Kunden und beurer gemietet
          und separat abgerechnet. Als BODYTIME Partner profitieren du und deine Kunden von einem exklusiven Preisvorteil bei beurer.
        </motion.p>

      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────── */
const B2B_FAQS = [
  {
    q: 'Was genau ist BODYTIME concept?',
    a: 'BODYTIME concept ist ein schlüsselfertiges EMS-Business-System. Als Partner bekommst du alles, was du brauchst, um deinen Kunden EMS-Training mit dem ANTELOPE-Suit von beurer anzubieten. Konzept, Know-how, Tools und dauerhafte Begleitung kommen von uns. Du bringst deine Leidenschaft, dein Netzwerk und deinen persönlichen Touch mit.',
  },
  {
    q: 'Was ist der ANTELOPE EMS-Suit?',
    a: 'Das Herzstück unseres Konzepts. Der ANTELOPE EMS-Suit von beurer ist das einzige textile EMS-Gerät in diesem Segment, das Shirt und Hose kombiniert und damit gleichzeitig Ober- und Unterkörper trainiert. Kein Kabelgewirr, kein kompliziertes Handling. Deine Kunden mieten ihn direkt bei beurer mit Sonderkonditionen, kaufen nichts und sind immer auf dem neuesten Stand der Technik.',
  },
  {
    q: 'Brauche ich eine Ausbildung im EMS-Bereich?',
    a: 'Nein. Im Onboarding bekommst du alles vermittelt, was du wissen musst. Wir übertragen 20 Jahre EMS-Erfahrung direkt auf dich, individuell angepasst auf deine Vorkenntnisse. Damit passieren dir von Anfang an keine Fehler.',
  },
  {
    q: 'Muss ich ein Studio oder Ladenlokal haben?',
    a: 'Nein, das ist gerade der Kern des Konzepts. Deine Kunden trainieren zuhause mit dem EMS-Suit. Du kannst Kunden in ganz Deutschland betreuen, egal wo du selbst wohnst. Wenn du in München bist und dein Kunde in Hannover, funktioniert das genauso.',
  },
  {
    q: 'Wann fange ich an zu verdienen?',
    a: 'Unsere Partner verdienen in der Regel direkt ab dem ersten Kunden. Das Geschäftsmodell ist so aufgebaut, dass du keine langen Anlaufzeiten hast und sofort loslegen kannst.',
  },
  {
    q: 'Was bekomme ich an Support?',
    a: 'Du hast 365 Tage deinen persönlichen Ansprechpartner bei uns, dazu regelmäßige Calls und gemeinsame Zielanpassungen. Und für technische Fragen rund um den ANTELOPE-Suit hast du direkte Schnittstelle zum Hersteller beurer. Du bist selbstständig, aber wirklich nie allein.',
  },
  {
    q: 'Was haben meine Kunden von dem Konzept?',
    a: 'Deine Kunden bekommen eine individuelle Einführung und Beratung, einen dauerhaften Ansprechpartner und direkten Zugang zu beurer mit Sonderkonditionen. Sie trainieren flexibel wann und wo sie wollen, spüren echte Ergebnisse und das ganz ohne festen Termin. Und sie haben kein Risiko: 14 Tage Widerrufsrecht und 30 Tage Umtauschrecht beim Anzug.',
  },
  {
    q: 'Wie viele Kunden kann ich betreuen?',
    a: 'So viele wie du möchtest. Das Modell ist unbegrenzt skalierbar, von 2 bis 10.000 Kunden. Weil du ortsunabhängig arbeitest, gibt es auch keine geografischen Grenzen.',
  },
];

function B2BFAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section
      id="faq"
      className="relative bg-white"
      style={{ marginTop: '-24px', borderRadius: '24px 24px 0 0', zIndex: 30 }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="md:sticky md:top-20 md:self-start lg:sticky lg:top-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-3">Häufige Fragen</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight tracking-tight mb-5">
              Noch Fragen?
            </h2>
            <p className="text-base text-gray-500 leading-relaxed font-light">
              Alles, was du vor dem ersten Gespräch wissen möchtest.
            </p>
          </motion.div>

          <div className="lg:col-span-2">
            {B2B_FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                className="border-b border-gray-100 last:border-0"
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  aria-expanded={open === i}
                >
                  <span className={`text-[15px] font-medium leading-snug transition-colors ${open === i ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: open === i ? 'linear-gradient(135deg, #25A8E0, #07C8DB)' : '#f3f4f6' }}
                  >
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform duration-300"
                      style={{ color: open === i ? 'white' : '#9ca3af', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Founders / Über uns ───────────────────────────────────────── */
const B2B_FOUNDERS = [
  {
    name: 'Oliver Pfannes',
    role: 'Co-Founder · Vertrieb & Expansion',
    image: '/oliver-pfannes.jpeg',
    highlights: [
      '10 Jahre miha bodytec – Marktführer EMS-Geräte',
      'Gründer KissSoccer & Sports',
      'Expansion der EMS-Lounge 2018–2025',
      'Vertriebsleitung Refresherboxx',
    ],
    timeline: [
      { year: '2000–03', label: 'Ausbildung Go Fit Bad Kissingen' },
      { year: '2004–08', label: 'Fitnesstrainer KissSalis Therme' },
      { year: '2008–18', label: 'Vertrieb miha bodytec (EMS-Marktführer)' },
      { year: '2016', label: 'Gründung KissSoccer & Sports' },
      { year: '2018–25', label: 'Expansion EMS-Lounge' },
      { year: '2025', label: 'BODYTIME Concept' },
    ],
  },
  {
    name: 'Christoph Schmitt',
    role: 'Co-Founder · Training & Coaching',
    image: '/christoph-schmitt.jpeg',
    highlights: [
      '10 Jahre Inhaber BODYTIME Bad Kissingen',
      'EMS Personal Trainer seit 2008',
      'OS Physio Coach Ausbildung (TSG Hoffenheim)',
      'Studium Sport- & Fitnessmanagement',
    ],
    timeline: [
      { year: '2005–08', label: 'Ausbildung INJOY Health & Fitnessclub' },
      { year: '2008–11', label: 'Leitung Training & Vertrieb INJOY' },
      { year: '2008', label: 'Start als EMS Personal Trainer' },
      { year: '2012–13', label: 'OS Physio Coach (TSG Hoffenheim)' },
      { year: '2013–23', label: 'Inhaber BODYTIME Bad Kissingen' },
      { year: '2025', label: 'BODYTIME Concept' },
    ],
  },
];

function B2BFoundersSection() {
  return (
    <section
      id="gruender"
      className="relative overflow-hidden"
      style={{ background: '#071a24', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* subtle glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: '#07C8DB' }}>
            Die Gründer
          </p>
          <h2
            className="font-semibold text-white leading-tight tracking-tight"
            style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}
          >
            Wen du an deiner Seite hast.
          </h2>
          <p className="text-white/45 text-base leading-relaxed mt-3 font-light">
            Kein anonymes Franchise. Hinter BODYTIME concept stehen zwei Unternehmer mit über 30 Jahren
            gebündelter Erfahrung im EMS- und Fitnessbereich.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5">
          {B2B_FOUNDERS.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, ease, delay: i * 0.14 }}
              className="rounded-3xl overflow-hidden flex flex-col lg:flex-row"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Photo */}
              <div className="relative w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
                <div className="relative w-full aspect-square lg:aspect-auto lg:h-full min-h-[280px]">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                  <div
                    className="absolute inset-0 lg:hidden"
                    style={{ background: 'linear-gradient(to bottom, transparent 45%, rgba(7,26,36,0.85) 100%)' }}
                  />
                  <div
                    className="absolute inset-0 hidden lg:block"
                    style={{ background: 'linear-gradient(to right, transparent 80%, rgba(7,26,36,0.4) 100%)' }}
                  />
                  <div className="absolute bottom-4 left-5 lg:hidden">
                    <p className="text-white text-xl font-semibold leading-tight">{founder.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#25A8E0' }}>{founder.role}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-6 p-6 sm:p-8 flex-1">
                {/* Name + role – desktop */}
                <div className="hidden lg:block">
                  <p className="text-xl font-semibold text-white leading-tight">{founder.name}</p>
                  <p className="text-sm mt-1 font-medium" style={{ color: '#25A8E0' }}>{founder.role}</p>
                </div>

                {/* Highlights */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Expertise
                  </p>
                  <ul className="space-y-2">
                    {founder.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5">
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                        >
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="text-sm text-white/65 leading-snug">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

                {/* Timeline */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Werdegang
                  </p>
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <div className="space-y-3">
                      {founder.timeline.map((entry, j) => {
                        const isLast = j === founder.timeline.length - 1;
                        return (
                          <div key={j} className="flex items-start gap-3">
                            <span
                              className="absolute -left-[3px] mt-[5px] w-[7px] h-[7px] rounded-full flex-shrink-0"
                              style={isLast
                                ? { background: '#25A8E0', boxShadow: '0 0 8px rgba(37,168,224,0.6)' }
                                : { background: 'rgba(255,255,255,0.2)' }
                              }
                            />
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="text-[11px] font-semibold tabular-nums whitespace-nowrap" style={{ color: '#25A8E0' }}>
                                {entry.year}
                              </span>
                              <span className={`text-xs leading-snug ${isLast ? 'text-white font-semibold' : 'text-white/40'}`}>
                                {entry.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section
      id="kontakt"
      className="relative overflow-hidden"
      style={{ background: '#080c18', marginTop: '-1px' }}
    >
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.14) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Nächste Schritte
          </p>
          <h2
            className="font-semibold text-white leading-tight tracking-tight mb-5"
            style={{ fontSize: 'clamp(28px, 4.5vw, 44px)' }}
          >
            So geht es weiter.
          </h2>
          <p className="text-base text-white/50 leading-relaxed font-light mb-12 max-w-xl mx-auto">
            Kein Verkaufsgespräch, kein Druck. Wir lernen uns kennen, du lernst das Konzept
            kennen und wir schauen gemeinsam, ob das der richtige nächste Schritt für dich ist.
            Du hast dabei zu keinem Zeitpunkt ein Risiko.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left max-w-2xl mx-auto">
            {[
              { Icon: CalendarDays, num: '01', title: 'Gespräch buchen', desc: 'Wähle einen Termin, der dir passt.' },
              { Icon: MessageCircle, num: '02', title: 'Gespräch führen', desc: 'In 30 Minuten klären wir alles.' },
              { Icon: Zap, num: '03', title: 'Entscheidung treffen', desc: 'Kein Druck – du entscheidest frei.' },
            ].map(({ Icon, num, title, desc }) => (
              <div key={num} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(37,168,224,0.3)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#25A8E0' }} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-white/25">{num}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white mb-1 leading-snug">{title}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <ButtonColorful
              href="#kontakt"
              label="Jetzt kostenloses Erstgespräch buchen"
              className="h-12 px-8 text-[15px]"
            />
            <p className="text-[11px] text-white/25 tracking-widest uppercase">
              Unverbindlich · Kostenlos · In 30 Minuten
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────────── */
/* ─── Philosophie Section ───────────────────────────────────────── */
function PhilosophieSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bodyWrapRef = useRef<HTMLDivElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);
  const timeWrapRef = useRef<HTMLDivElement>(null);
  const addonListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const bodyEl = bodyWrapRef.current;
    const timeEl = timeWrapRef.current;
    const plusEl = plusWrapRef.current;
    const sectionEl = sectionRef.current;
    const addonEl = addonListRef.current;
    if (!bodyEl || !timeEl || !plusEl || !sectionEl) return;

    // ── BODY / TIME split animation (scrub) ──
    // Mobile: vertical split (y); Desktop: horizontal split (x)
    const isMobile = window.innerWidth < 768;
    const offset = isMobile
      ? plusEl.offsetHeight * 0.7 + 10
      : plusEl.offsetWidth * 0.6 + 16;

    if (isMobile) {
      gsap.set(bodyEl, { y: -offset });
      gsap.set(timeEl, { y: offset });
    } else {
      gsap.set(bodyEl, { x: offset });
      gsap.set(timeEl, { x: -offset });
    }
    gsap.set(plusEl, { opacity: 0, scale: 0.2 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionEl,
        start: 'top 80%',
        end: 'top 15%',
        scrub: 1,
      },
    });

    if (isMobile) {
      tl.to(bodyEl, { y: 0, ease: 'power2.out', duration: 1 }, 0)
        .to(timeEl, { y: 0, ease: 'power2.out', duration: 1 }, 0)
        .to(plusEl, { opacity: 1, scale: 1, ease: 'back.out(1.7)', duration: 0.6 }, 0.45);
    } else {
      tl.to(bodyEl, { x: 0, ease: 'power2.out', duration: 1 }, 0)
        .to(timeEl, { x: 0, ease: 'power2.out', duration: 1 }, 0)
        .to(plusEl, { opacity: 1, scale: 1, ease: 'back.out(1.7)', duration: 0.6 }, 0.45);
    }

    // ── Addon items stagger bounce-in ──
    if (addonEl) {
      const items = addonEl.querySelectorAll('[data-addon-item]');
      gsap.set(items, { y: 24, opacity: 0, scale: 0.92 });
      ScrollTrigger.create({
        trigger: addonEl,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.6)',
            stagger: 0.06,
          });
        },
      });
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([bodyEl, timeEl, plusEl], { clearProps: 'x,y,opacity,scale,transform' });
    };
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
  };

  const addons = [
    { label: 'EMS-Studio', icon: <Dumbbell className="w-3.5 h-3.5" /> },
    { label: 'Personal Trainer', icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Yogastudio', icon: <Layers className="w-3.5 h-3.5" /> },
    { label: 'Physiotherapeut', icon: <Heart className="w-3.5 h-3.5" /> },
    { label: 'Heilpraktiker', icon: <Shield className="w-3.5 h-3.5" /> },
    { label: 'Fitnessstudio', icon: <Building2 className="w-3.5 h-3.5" /> },
    { label: 'Online-Coach', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { label: 'Ernährungsberater', icon: <Zap className="w-3.5 h-3.5" /> },
    { label: 'Coach', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { label: 'Osteopath', icon: <MapPin className="w-3.5 h-3.5" /> },
    { label: 'Sportmediziner', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
    { label: 'Ausbilder & Trainer', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <section
      ref={sectionRef}
      id="philosophie"
      style={{ background: '#080c18', borderTop: '1px solid rgba(255,255,255,0.04)' }}
      className="relative overflow-hidden"
    >
      <style>{`
        @keyframes philosophiePulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(37,168,224,0.5)); }
          50%       { transform: scale(1.12); filter: drop-shadow(0 0 28px rgba(37,168,224,0.9)); }
        }
        .phil-plus-pulse {
          display: inline-block;
          animation: philosophiePulse 2.4s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 1000px 600px at 50% 35%, rgba(37,168,224,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-28 lg:py-36">

        {/* ── PART 1: Hero Equation ── */}
        <div className="flex flex-col items-center mb-20 sm:mb-28">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="text-center text-xs font-semibold uppercase tracking-[0.28em] mb-8 sm:mb-10"
            style={{ color: '#25A8E0' }}
          >
            Unser ganzheitliches Konzept
          </motion.p>

          {/* BODY + TIME
              Mobile  → vertical stack (BODY / + / TIME), GSAP y-split
              Desktop → horizontal row,                   GSAP x-split   */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 lg:gap-6 w-full overflow-hidden">

            {/* BODY wrapper */}
            <div ref={bodyWrapRef} className="flex flex-col items-center gap-2 sm:gap-3">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-black tracking-tight leading-none select-none"
                style={{
                  fontSize: 'clamp(3.5rem, 20vw, 11rem)',
                  color: 'rgba(255,255,255,0.92)',
                  textShadow: '0 0 80px rgba(74,222,128,0.15)',
                }}
              >
                BODY
              </motion.span>
              <span
                className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] whitespace-nowrap"
                style={{ color: '#4ADE80' }}
              >
                Körper · Das wichtigste Gut
              </span>
            </div>

            {/* + wrapper */}
            <div ref={plusWrapRef} className="flex-shrink-0 sm:mt-0">
              <span
                className="phil-plus-pulse font-black leading-none select-none"
                style={{ fontSize: 'clamp(1.8rem, 8vw, 7rem)', color: '#25A8E0', display: 'block' }}
              >
                +
              </span>
            </div>

            {/* TIME wrapper */}
            <div ref={timeWrapRef} className="flex flex-col items-center gap-2 sm:gap-3">
              <motion.span
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-black tracking-tight leading-none select-none"
                style={{
                  fontSize: 'clamp(3.5rem, 20vw, 11rem)',
                  color: 'rgba(255,255,255,0.92)',
                  textShadow: '0 0 80px rgba(37,168,224,0.15)',
                }}
              >
                TIME
              </motion.span>
              <span
                className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] whitespace-nowrap"
                style={{ color: '#25A8E0' }}
              >
                Zeit · Die knappe Ressource
              </span>
            </div>

          </div>
        </div>

        {/* ── PART 2: Two-Column Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 relative">

              {/* Left: Concept copy */}
              <div className="flex flex-col justify-center px-8 sm:px-12 py-12 sm:py-14"
                style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(37,168,224,0.05) 0%, transparent 70%)' }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-4" style={{ color: '#25A8E0' }}>
                  Die Philosophie
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-5 leading-snug">
                  Körper und Zeit verbinden.
                </h3>
                <div className="flex flex-col gap-4 text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <p>
                    Ohne Gesundheit ist alles nichts. Das klingt banal, wird aber im Alltag ständig hintenangestellt. Und Zeit? Die haben deine Kunden schlicht nicht ohne Ende.
                  </p>
                  <p>
                    Genau da setzt BODYTIME concept an. Ein Konzept, das echte Ergebnisse liefert und trotzdem ins Leben der Menschen passt, nicht dagegen.
                  </p>
                  <p>
                    Für dich als Partner bedeutet das: Du musst nichts umbauen. Du erweiterst einfach dein bestehendes Angebot um eine Leistung, die deine Kunden wirklich wollen.
                  </p>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden sm:block absolute inset-y-0 left-1/2 w-px -translate-x-px"
                style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Mobile divider */}
              <div className="sm:hidden h-px mx-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

              {/* Right: Addon list — bounce-in stagger, fades at bottom */}
              <div className="flex flex-col items-center relative px-5 sm:px-8 py-10 overflow-hidden"
                style={{ background: 'radial-gradient(ellipse at 60% 10%, rgba(37,168,224,0.07) 0%, transparent 60%)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-5 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Perfekt als Zusatz für
                </p>
                <div ref={addonListRef} className="flex flex-col items-center gap-1.5 w-full">
                  {addons.slice(0, 9).map(({ label, icon }) => (
                    <div
                      key={label}
                      data-addon-item
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                      style={{
                        width: 'fit-content',
                        minWidth: '220px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <span className="flex-shrink-0 w-4" style={{ color: 'rgba(255,255,255,0.35)' }}>{icon}</span>
                      <span className="text-xs font-medium w-24 truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                      <div className="flex items-center gap-1 ml-1">
                        <Plus className="w-2 h-2 flex-shrink-0" style={{ color: 'rgba(37,168,224,0.45)' }} />
                        <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'rgba(37,168,224,0.8)' }}>BODYTIME concept</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Gradient fades last 2-3 items into background */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 pointer-events-none"
                  style={{ height: '160px', background: 'linear-gradient(to bottom, transparent 0%, rgba(8,12,24,0.5) 30%, #080c18 68%)' }}
                />
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ─── SchmerzSection ────────────────────────────────────────────── */
const SCHMERZ_PAIRS = [
  {
    pain: 'Du hast kaum noch Zeit für Partner/in, Familie und Freunde',
    painDesc: 'Das Studio läuft, aber du läufst mit. Abende, Wochenenden, irgendwann merkt dein Umfeld, dass das Studio mehr bekommt als sie.',
    fix: 'Mit BODYTIME concept schaffst du dir wieder etwas Luft',
    fixDesc: 'Deine Kunden trainieren mit Suit und App auch dann, wenn du gerade nicht da bist. Dein Angebot läuft, ohne dass du immer präsent sein musst.',
  },
  {
    pain: 'Dein Tagesablauf hängt zu oft von deinen Mitarbeitern ab',
    painDesc: 'Wenn jemand ausfällt, springst du ein. Irgendwie bist du immer der letzte Puffer. Das kennt jeder.',
    fix: 'BODYTIME concept funktioniert als Ergänzung, ohne extra Personal',
    fixDesc: 'Du bietest es zusätzlich in deinem Studio an, dein bestehendes Team reicht völlig aus. Kein Neueinstellung, keine zusätzliche Einarbeitung.',
  },
  {
    pain: 'Jeden Monat dieselben Fixkosten, egal wie gut es lief',
    painDesc: 'Miete, Equipment, Versicherungen. Die Last ist da, ob du 20 oder 80 Kunden hattest. Das drückt auf die Motivation.',
    fix: 'BODYTIME concept bringt dir Umsatz ohne neue Fixkosten',
    fixDesc: 'Kein neues Equipment kaufen, kein Umbau nötig. Du integrierst es in dein bestehendes Angebot und verdienst direkt mit.',
  },
  {
    pain: 'Du kannst nicht mehr Kunden annehmen, weil die Zeit einfach fehlt',
    painDesc: 'Mehr Umsatz klingt gut, aber mehr Stunden hast du nicht. Irgendwann ist die Kapazitätsgrenze einfach erreicht.',
    fix: 'Mit BODYTIME concept begleitest du mehr Kunden, ohne mehr Zeit zu investieren',
    fixDesc: 'Deine Kunden trainieren eigenständig mit dem Suit. Du begleitest sie, bist aber nicht bei jeder Session dabei.',
  },
  {
    pain: 'Du fragst dich manchmal, wann du zuletzt wirklich frei hattest',
    painDesc: 'Nicht weil du nicht willst. Sondern weil das Studio immer irgendwie da ist. Immer irgendetwas.',
    fix: 'BODYTIME concept schafft dir Spielraum, ohne dass du etwas aufgibst',
    fixDesc: 'Als Ergänzung zu deinem Studio baust du dir ein Standbein auf, das auch ohne deine ständige Anwesenheit Umsatz bringt.',
  },
];

function SchmerzSection() {
  return (
    <section
      id="schmerz"
      className="relative bg-white overflow-hidden"
      style={{ marginTop: '-1px' }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-4">
            Die Realität im Fitnessmarkt
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
            Du kennst das sicher.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-light">
            Wer ein Studio betreibt weiß: irgendwann fühlt sich das Hamsterrad echter an als die Freiheit, für die man mal gestartet ist.
            BODYTIME concept lässt sich in dein bestehendes Business integrieren und kann genau da helfen.
          </p>
        </motion.div>

        {/* ── Comparison rows ── */}
        <div className="flex flex-col gap-3 mb-10">
          {SCHMERZ_PAIRS.map((pair, i) => (
            <motion.div
              key={pair.pain}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease, delay: i * 0.07 }}
              className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-gray-100"
              style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Problem */}
              <div className="flex gap-4 p-5 sm:p-6" style={{ background: '#fef7f7' }}>
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: '#fee2e2' }}
                >
                  <X className="w-3 h-3 text-red-500" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] sm:text-[15px] font-semibold text-gray-900 mb-1 leading-snug">{pair.pain}</p>
                  <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed">{pair.painDesc}</p>
                </div>
              </div>
              {/* Solution */}
              <div
                className="flex gap-4 p-5 sm:p-6 border-t border-gray-100 lg:border-t-0 lg:border-l"
                style={{ background: '#f0f9ff', borderColor: 'rgba(37,168,224,0.12)' }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(37,168,224,0.15)' }}
                >
                  <Check className="w-3 h-3" style={{ color: '#25A8E0' }} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[14px] sm:text-[15px] font-semibold text-gray-900 mb-1 leading-snug">{pair.fix}</p>
                  <p className="text-[12px] sm:text-[13px] text-gray-400 leading-relaxed">{pair.fixDesc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Einsteiger callout ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease, delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #25A8E0 0%, #07C8DB 100%)',
            boxShadow: '0 8px 40px rgba(37,168,224,0.25)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-7 sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-3">
                Für Einsteiger
              </p>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white leading-tight tracking-tight mb-4">
                Du willst dich selbstständig machen?
              </h3>
              <p className="text-white/80 text-[15px] leading-relaxed">
                Du brauchst kein eigenes Studio, um mit BODYTIME concept einzusteigen.
                Viele unserer Partner starten ohne festen Standort, ohne eigenes Equipment und trotzdem sofort.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { Icon: Zap,       text: 'Du kannst sofort loslegen' },
                { Icon: TrendingUp, text: 'Ab dem ersten Kunden verdienst du' },
                { Icon: Shield,    text: 'Kein Risiko, kein großes Startkapital' },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  <Icon className="w-4 h-4 text-white flex-shrink-0" strokeWidth={2} />
                  <p className="text-white font-medium text-[15px]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

export default function PartnerWerdenPage() {
  return (
    <div className="min-h-screen" style={{ background: '#071a24' }}>
      <B2BNav />
      <HeroSection />
      <KonzeptSection />
      <SchmerzSection />
      <PhilosophieSection />
      <StudioBetreiberSection />
      <KundenerlebnisSection />
      <LeistungenSection />
      <PreiseSection />
      <B2BFoundersSection />
      <CTASection />
      <B2BFAQSection />
      <SiteFooter />
    </div>
  );
}
