'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, X } from 'lucide-react';
import { getConsent, saveConsent } from '@/lib/consent';

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getConsent();
    if (!existing) {
      const t = setTimeout(() => setShowBanner(true), 600);
      return () => clearTimeout(t);
    } else {
      setAnalytics(existing.analytics);
    }
  }, []);

  useEffect(() => {
    const openSettings = () => {
      const existing = getConsent();
      if (existing) setAnalytics(existing.analytics);
      setShowModal(true);
      setShowBanner(false);
    };
    window.addEventListener('showCookieConsent', openSettings);
    return () => window.removeEventListener('showCookieConsent', openSettings);
  }, []);

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true });
    setShowBanner(false);
    setShowModal(false);
  };

  const acceptNecessary = () => {
    saveConsent({ essential: true, analytics: false });
    setShowBanner(false);
    setShowModal(false);
  };

  const saveSelection = () => {
    saveConsent({ essential: true, analytics });
    setShowBanner(false);
    setShowModal(false);
  };

  const openSettings = () => {
    setShowModal(true);
    setShowBanner(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* ── Einstellungs-Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          {/* Modal card */}
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Cookie-Einstellungen"
            style={{
              background: 'rgba(7,10,20,0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.2), rgba(37,99,235,0.15))', border: '1px solid rgba(37,168,224,0.25)' }}
                >
                  <Shield className="w-3.5 h-3.5" style={{ color: '#25A8E0' }} />
                </div>
                <p className="text-sm font-semibold text-white">Cookie-Einstellungen</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 pt-5 pb-4 space-y-3">
              <p className="text-[12px] leading-relaxed text-white/45">
                Wähle, welche Cookies du erlaubst. Notwendige Cookies sind für den Betrieb der Website
                erforderlich und können nicht deaktiviert werden. Mehr Infos in unserer{' '}
                <Link href="/datenschutz" className="text-white/70 underline underline-offset-2 hover:text-white transition-colors">
                  Datenschutzerklärung
                </Link>.
              </p>

              {/* Notwendig */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-semibold text-white">Notwendig</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Immer aktiv</p>
                  </div>
                  {/* Toggle – always on, not clickable */}
                  <div
                    className="relative w-10 h-[22px] rounded-full flex-shrink-0 cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                    aria-label="Notwendige Cookies – immer aktiv"
                  >
                    <div className="absolute top-[3px] right-[3px] w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <p className="text-[11px] text-white/35 leading-relaxed">
                  Speichert deine Cookie-Einwilligung (<code className="text-white/30">btc_consent</code>) und verwaltet deine Sitzung beim Partner-Login (<code className="text-white/30">sb-*</code>). Laufzeit: bis zu 1 Jahr.
                </p>
              </div>

              {/* Analyse */}
              <div
                className="rounded-xl p-4 transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${analytics ? 'rgba(37,168,224,0.25)' : 'rgba(255,255,255,0.07)'}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-semibold text-white">Analyse</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{analytics ? 'Aktiv' : 'Inaktiv'}</p>
                  </div>
                  {/* Toggle */}
                  <button
                    role="switch"
                    aria-checked={analytics}
                    onClick={() => setAnalytics(a => !a)}
                    className="relative w-10 h-[22px] rounded-full flex-shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25A8E0] focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
                    style={{
                      background: analytics
                        ? 'linear-gradient(135deg, #25A8E0, #07C8DB)'
                        : 'rgba(255,255,255,0.12)',
                    }}
                    aria-label="Analyse-Cookies ein- oder ausschalten"
                  >
                    <div
                      className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                      style={{ left: analytics ? 'calc(100% - 19px)' : '3px' }}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-white/35 leading-relaxed">
                  Hilft uns zu verstehen, wie Besucher die Website nutzen, damit wir das Angebot verbessern können.
                  Aktuell noch nicht eingesetzt – wird aktiviert, sobald ein Analyse-Tool eingebunden wird.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
              <button
                onClick={saveSelection}
                className="flex-1 text-[13px] font-semibold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
              >
                Auswahl speichern
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 text-[13px] font-medium px-4 py-2.5 rounded-xl text-white/60 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner (Erstbesuch) ──────────────────────────────────── */}
      {showBanner && !showModal && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-5"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie-Hinweis"
        >
          <div
            className="max-w-4xl mx-auto rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(7,10,20,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">

              {/* Icon + Text */}
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.2), rgba(37,99,235,0.15))', border: '1px solid rgba(37,168,224,0.3)' }}
                >
                  <Shield className="w-4 h-4" style={{ color: '#25A8E0' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">
                    Wir respektieren deine Privatsphäre.
                  </p>
                  <p className="text-[12px] leading-relaxed text-white/45">
                    Wir nutzen Cookies für den Betrieb der Website. Optional kannst du Analyse-Cookies zulassen.{' '}
                    <Link href="/datenschutz" className="text-white/65 underline underline-offset-2 hover:text-white transition-colors">
                      Datenschutz
                    </Link>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2 pl-12 sm:pl-0 flex-shrink-0">
                <button
                  onClick={acceptNecessary}
                  className="text-[12px] font-medium px-3.5 py-2.5 rounded-xl transition-all text-white/50 hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.13)', whiteSpace: 'nowrap' }}
                >
                  Nur notwendige
                </button>
                <button
                  onClick={openSettings}
                  className="text-[12px] font-medium px-3.5 py-2.5 rounded-xl transition-all text-white/50 hover:text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.13)', whiteSpace: 'nowrap' }}
                >
                  Einstellungen
                </button>
                <button
                  onClick={acceptAll}
                  className="text-[12px] font-semibold px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)', whiteSpace: 'nowrap' }}
                >
                  Alle akzeptieren
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
