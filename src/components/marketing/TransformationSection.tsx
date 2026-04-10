'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw, Zap, Sparkles, Dumbbell,
  Activity, TrendingUp, MoveHorizontal, Heart,
  Calendar, Repeat2, Timer,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/* ─── Cycle steps ─────────────────────────────────────────────── */
const STEPS = [
  {
    Icon: Calendar,
    label: 'Training wird\neinfach gemacht',
    desc: 'Zuhause, unterwegs oder in der Mittagspause – ohne fixen Termin.',
    pos: 'top',
  },
  {
    Icon: Zap,
    label: '20 Minuten\ngenügen',
    desc: 'Eine kurze, intensive Session bringt mehr als stundenlange Workouts.',
    pos: 'right',
  },
  {
    Icon: Repeat2,
    label: 'Wird zur\nGewohnheit',
    desc: 'Weil es so unkompliziert ist, machst du es einfach. Immer wieder.',
    pos: 'bottom',
  },
  {
    Icon: TrendingUp,
    label: 'Spürbare\nErgebnisse',
    desc: 'Dein Körper verändert sich – sichtbar und spürbar.',
    pos: 'left',
  },
] as const;

/* ─── Result benefits ─────────────────────────────────────────── */
const BENEFITS = [
  { Icon: RefreshCw,      label: 'Regeneration' },
  { Icon: Zap,            label: 'Stoffwechsel' },
  { Icon: Sparkles,       label: 'Figur & Hautstraffung' },
  { Icon: Dumbbell,       label: 'Muskelaufbau' },
  { Icon: Activity,       label: 'Rücken & Schmerzen' },
  { Icon: TrendingUp,     label: 'Leistung & Ausdauer' },
  { Icon: MoveHorizontal, label: 'Mobilität' },
  { Icon: Heart,          label: 'Wohlbefinden' },
  { Icon: Timer,          label: 'Zeiteinsparung' },
  { Icon: Sparkles,       label: 'Biologisches Alter' },
  { Icon: RefreshCw,      label: 'Verspannungen' },
];

/* ─── Step card ───────────────────────────────────────────────── */
function StepCard({
  step,
  align = 'center',
}: {
  step: (typeof STEPS)[number];
  align?: 'center' | 'left' | 'right';
}) {
  const { Icon, label, desc } = step;
  return (
    <div className={`flex flex-col gap-2 max-w-[160px] ${align === 'right' ? 'items-end text-right' : align === 'left' ? 'items-start' : 'items-center text-center'}`}>
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.25) 0%, rgba(37,99,235,0.25) 100%)', border: '1px solid rgba(37,168,224,0.3)' }}
      >
        <Icon className="w-4 h-4" style={{ color: '#25A8E0' }} />
      </div>
      <p className="text-sm font-semibold text-white leading-snug whitespace-pre-line">{label}</p>
      <p className="text-xs text-white/45 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Ring SVG ────────────────────────────────────────────────── */
function CycleRing({ triggered }: { triggered: boolean }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1' }}>
      {/* Large outer glow halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(37,168,224,0.35) 0%, rgba(7,200,219,0.15) 35%, transparent 65%)',
          filter: 'blur(48px)',
          transform: 'scale(1.7)',
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25A8E0" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#07C8DB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(37,168,224,0.15)" />
            <stop offset="100%" stopColor="rgba(37,168,224,0)" />
          </radialGradient>
          <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a4a6b" />
            <stop offset="100%" stopColor="#0d2535" />
          </radialGradient>
        </defs>

        {/* Outer ambient glow */}
        <circle cx="100" cy="100" r="82" fill="url(#centerGlow)" />

        {/* Base ring */}
        <circle cx="100" cy="100" r="75"
          stroke="rgba(37,168,224,0.12)" strokeWidth="1" fill="none" />

        {/* Animated flowing dashes */}
        {triggered && (
          <circle cx="100" cy="100" r="75"
            stroke="url(#ringGrad1)" strokeWidth="2" fill="none"
            strokeDasharray="15 8"
            style={{ animation: 'spinRing 10s linear infinite', transformOrigin: 'center' }}
          />
        )}

        {/* Arrow chevrons at 45°/135°/225°/315° */}
        {[45, 135, 225, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 100 + 75 * Math.cos(rad);
          const cy = 100 + 75 * Math.sin(rad);
          return (
            <g key={deg} transform={`translate(${cx},${cy}) rotate(${deg + 90})`}>
              <path d="M-4,-3 L0,3 L4,-3" stroke="#25A8E0" strokeWidth="1.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </g>
          );
        })}

        {/* Dots at N/E/S/W */}
        {[
          { x: 100, y: 25 },
          { x: 175, y: 100 },
          { x: 100, y: 175 },
          { x: 25, y: 100 },
        ].map(({ x, y }, i) => (
          <circle key={i} cx={x} cy={y} r="4"
            fill="#25A8E0" fillOpacity="0.8"
            style={{ filter: 'drop-shadow(0 0 4px #25A8E0)' }}
          />
        ))}

        {/* Center hub */}
        <circle cx="100" cy="100" r="44" fill="url(#hubGrad)"
          style={{ filter: 'drop-shadow(0 0 12px rgba(37,168,224,0.3))' }} />
        <circle cx="100" cy="100" r="44"
          stroke="rgba(37,168,224,0.3)" strokeWidth="1" fill="none" />
      </svg>

      {/* Center text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="gradient-text-slow font-semibold leading-none"
            style={{ fontSize: 'clamp(22px, 5vw, 32px)' }}>
            EMS
          </p>
          <p className="text-[9px] sm:text-[10px] text-white/50 uppercase tracking-widest mt-0.5 font-medium">
            Training
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─────────────────────────────────────────────── */
export default function TransformationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isRingVisible, setIsRingVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsRingVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="transformation"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #071a24 0%, #080c18 100%)', marginTop: '-1px' }}
    >

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-16 sm:mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Das erwartet dich
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
            Wie aus 20 Minuten{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>ein neues Leben werden kann.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/55 leading-relaxed font-light">
            Wer das Training zur Gewohnheit macht, der trainiert regelmäßig.
            Wer regelmäßig trainiert, der erzielt spürbare Resultate.
            Und wer Resultate sieht, hört nie wieder auf.
          </p>
        </motion.div>

        {/* ── Cycle diagram ─────────────────────────────────── */}
        {/* Desktop: 3×3 grid with ring center */}
        <div className="hidden lg:grid max-w-[680px] mx-auto mb-20"
          style={{ gridTemplateColumns: '1fr 260px 1fr', gridTemplateRows: 'auto 260px auto', gap: '0' }}>

          {/* Top step */}
          <div style={{ gridColumn: '2', gridRow: '1' }} className="flex justify-center pb-8">
            <StepCard step={STEPS[0]} align="center" />
          </div>

          {/* Left step */}
          <div style={{ gridColumn: '1', gridRow: '2' }} className="flex items-center justify-end pr-8">
            <StepCard step={STEPS[3]} align="right" />
          </div>

          {/* Center ring */}
          <div style={{ gridColumn: '2', gridRow: '2' }}>
            <CycleRing triggered={isRingVisible} />
          </div>

          {/* Right step */}
          <div style={{ gridColumn: '3', gridRow: '2' }} className="flex items-center justify-start pl-8">
            <StepCard step={STEPS[1]} align="left" />
          </div>

          {/* Bottom step */}
          <div style={{ gridColumn: '2', gridRow: '3' }} className="flex justify-center pt-8">
            <StepCard step={STEPS[2]} align="center" />
          </div>
        </div>

        {/* Mobile: vertical step list */}
        <div className="lg:hidden flex flex-col gap-6 max-w-sm mx-auto mb-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
              className="flex gap-4 items-start"
            >
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.25), rgba(37,99,235,0.25))', border: '1px solid rgba(37,168,224,0.3)' }}>
                  <step.Icon className="w-4 h-4" style={{ color: '#25A8E0' }} />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 min-h-[28px]"
                    style={{ background: 'linear-gradient(180deg, rgba(37,168,224,0.4), rgba(37,168,224,0))' }} />
                )}
              </div>
              <div className="pt-1">
                <p className="text-[15px] font-semibold text-white mt-0.5 mb-1 whitespace-pre-line">{step.label}</p>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Results ───────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-white/35 mb-7"
          >
            Was sich verändern kann
          </motion.p>
          <div className="flex flex-wrap justify-center gap-3">
            {BENEFITS.map(({ Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275], delay: i * 0.06 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10"
                style={{
                  background: 'rgba(37,168,224,0.07)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#25A8E0' }} />
                <span className="text-sm text-white/70 font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
