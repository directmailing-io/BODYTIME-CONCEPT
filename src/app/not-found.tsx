import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/404-bg.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover sm:object-center" style={{ objectPosition: '25% center' }}
      />

      {/* Dark gradient overlay — heavier at top & bottom, lighter in middle */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">

        {/* 404 number */}
        <p
          className="font-black tracking-tighter leading-none mb-4 select-none"
          style={{
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            background: 'linear-gradient(135deg, #25A8E0 0%, #60C8F0 50%, #2563EB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.95,
          }}
        >
          404
        </p>

        {/* Headline */}
        <h1 className="text-white font-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', lineHeight: 1.2 }}>
          Diese Seite macht gerade eine Pause.
        </h1>

        {/* Subtext */}
        <p className="max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)' }}>
          Der EMS-Anzug liegt schon bereit – aber die Seite, die du suchst, haben wir leider nicht gefunden.
          Kein Stress, wir bringen dich wieder auf Kurs.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #25A8E0, #2563EB)', boxShadow: '0 4px 20px rgba(37,168,224,0.4)' }}
          >
            Zurück zur Startseite
          </Link>
          <Link
            href="/beratung"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            Kostenlose Beratung
          </Link>
        </div>

        {/* Small hint */}
        <p className="mt-10 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Fehlercode 404 · Seite nicht gefunden
        </p>
      </div>
    </div>
  );
}
