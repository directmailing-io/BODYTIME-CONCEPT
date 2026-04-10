'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Layers } from 'lucide-react';

/* ─── Animated number (supports countdown) ───────────────────── */
function AnimatedNumber({
  from = 0,
  to,
  trigger,
  suffix = '',
}: {
  from?: number;
  to: number;
  trigger: boolean;
  suffix?: string;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!trigger) return;
    setCount(from);
    const start = performance.now();
    const duration = 2200;
    const range = to - from;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + eased * range));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [trigger, from, to]);

  return <>{count}{suffix}</>;
}

/* ─── Card wrapper ────────────────────────────────────────────── */
function BentoCard({
  children,
  className = '',
  index = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main section ─────────────────────────────────────────────── */
export default function PromisesSection() {
  const bentoRef = useRef<HTMLDivElement>(null);
  const bentoInView = useInView(bentoRef, { once: true, margin: '-80px' });

  return (
    <section
      id="wie-es-funktioniert"
      className="relative bg-white z-10"
      style={{
        marginTop: '-24px',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-4">
            Was wir dir versprechen
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
            Dein Alltag bleibt, wie er ist.{' '}
            <span className="text-gray-400">Dein Körper verändert sich.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-light">
            Du kennst das: Du fängst immer wieder an zu trainieren und hörst irgendwann wieder auf.
            Nicht weil dir die Disziplin fehlt. Sondern weil das Training einfach nicht in deinen Alltag passt.
            Das ändern wir.
          </p>
        </motion.div>

        {/* ── Bento Grid ──────────────────────────────────────── */}
        <div
          ref={bentoRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >

          {/* 1 ── 20 Minuten ──────────────────────────── */}
          <BentoCard
            index={0}
            className="lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 relative bg-[#f8fafc]"
            style={{ minHeight: '240px' }}
          >
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(37,168,224,0.20) 0%, transparent 70%)',
                filter: 'blur(24px)',
              }}
            />
            <div className="relative">
              <p
                className="gradient-text-slow font-semibold leading-none tracking-tighter"
                style={{ fontSize: 'clamp(72px, 14vw, 120px)' }}
              >
                <AnimatedNumber from={90} to={20} trigger={bentoInView} />
              </p>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">
                Minuten pro Training
              </p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mt-4 relative">
              So lange dauert dein vollständiges Ganzkörpertraining.
              Was andere in 90 Minuten im Gym versuchen – du erreichst es in 20.
            </p>
          </BentoCard>

          {/* 2 ── Einfachheit (image, row-span-2) ────── */}
          <BentoCard
            index={1}
            className="sm:col-span-2 lg:col-span-2 lg:row-span-2 relative flex flex-col bg-[#f8fafc]"
            style={{ minHeight: '360px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ems-app-suit.png"
              alt="EMS Anzug mit App"
              className="w-full flex-1 object-contain object-center px-4 pt-6"
              style={{ maxHeight: '360px' }}
            />
            <div className="p-5 sm:p-8 pt-3 sm:pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#25A8E0] mb-1">
                Einfachheit
              </p>
              <p className="text-[17px] font-semibold text-gray-900 mb-2">Anzug anlegen. App öffnen. Loslegen.</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Keine Geräte einrichten. Keine Installationen. Anzug anziehen, App öffnen und direkt starten.
                Beim ersten Training zeigt dir dein Trainer alles – danach läuft das wie von selbst.
                Wirklich kinderleicht.
              </p>
            </div>
          </BentoCard>

          {/* 3 ── Kombinierbar ────────────────────────── */}
          <BentoCard index={2} className="lg:col-span-1 p-5 sm:p-7 flex flex-col gap-4 bg-[#f8fafc]">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)' }}
            >
              <Layers className="w-5 h-5" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-1.5">
                Kombinierbar mit deinem Alltag
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Zuhause, beim Spaziergang oder selbst in der Mittagspause – das Training passt sich deinem Alltag perfekt an.
              </p>
            </div>
          </BentoCard>

          {/* 4 ── Ohne Risiko ─────────────────────────── */}
          <BentoCard index={3} className="lg:col-span-1 p-5 sm:p-7 flex flex-col gap-4 bg-[#f8fafc]">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)' }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-1.5">
                Ohne Risiko starten
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                14 Tage Widerrufsrecht nach Vertragsabschluss.
                Passt die Größe nicht, hast du 30 Tage Zeit für den Umtausch.
              </p>
            </div>
          </BentoCard>

          {/* 5 ── € Mieten ────────────────────────────── */}
          <BentoCard
            index={4}
            className="sm:col-span-2 lg:col-span-2 flex flex-col justify-between p-6 sm:p-8 relative bg-[#f8fafc]"
            style={{ minHeight: '200px' }}
          >
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 w-56 h-56 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(37,168,224,0.18) 0%, transparent 70%)',
                filter: 'blur(28px)',
              }}
            />
            <div className="relative">
              <p
                className="gradient-text-slow font-semibold leading-none tracking-tighter"
                style={{ fontSize: 'clamp(80px, 18vw, 150px)' }}
              >
                €
              </p>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">
                Mieten statt kaufen
              </p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mt-4 relative">
              Du mietest den EMS Anzug direkt bei deinem Trainer.
              Keine Anschaffungskosten. Kein Risiko.
            </p>
          </BentoCard>

          {/* 6 ── 1:1 Begleitung ──────────────────────── */}
          <BentoCard
            index={5}
            className="sm:col-span-2 lg:col-span-2 relative overflow-hidden"
            style={{
              minHeight: '280px',
              background: 'linear-gradient(135deg, #1d6fad 0%, #1a5fa0 40%, #1452a8 100%)',
            }}
          >
            {/* Blue glow */}
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 w-72 h-72 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(37,168,224,0.35) 0%, transparent 65%)',
                filter: 'blur(36px)',
              }}
            />
            <div className="relative p-6 sm:p-8 flex flex-col justify-between gap-5 h-full">
              <div>
                <span className="text-xs text-white/50 line-through tracking-wide block mb-1.5">
                  Alleine ausprobieren
                </span>
                <p
                  className="font-semibold leading-[1.05] tracking-tighter pb-1 text-white"
                  style={{ fontSize: 'clamp(40px, 6vw, 60px)' }}
                >
                  1:1 Begleitung
                </p>
                <p className="text-sm text-white/80 leading-relaxed max-w-sm mt-3">
                  Unsere Berater haben den EMS-Markt mit aufgebaut – über 20 Jahre Erfahrung,
                  die du nirgendwo sonst findest. Du hast 365 Tage einen persönlichen Ansprechpartner,
                  regelmäßige Calls und ein Setup, das exakt auf dich zugeschnitten ist.
                </p>
              </div>
            </div>
          </BentoCard>

        </div>


      </div>
    </section>
  );
}
