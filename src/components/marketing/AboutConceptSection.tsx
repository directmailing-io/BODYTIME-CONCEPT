'use client';
import { motion } from 'framer-motion';
import { ButtonColorful } from '@/components/ui/ButtonColorful';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const CARDS = [
  {
    title: 'Du hast einen persönlichen EMS-Experten',
    text: 'Zertifizierte EMS-Experten begleiten dich von Anfang an, egal ob du zuhause, unterwegs oder in der Mittagspause trainierst. Immer erreichbar, immer für dich da.',
  },
  {
    title: 'Du bleibst flexibel',
    text: 'Du brauchst keine festen verbindlichen Termine. Du trainierst, wann und wo du willst, indem du den Anzug anziehst, die App öffnest und loslegst.',
  },
  {
    title: 'Die smarte Ergänzung für deinen Alltag',
    text: 'BODYTIME concept ergänzt deinen Sport, deine Physiotherapie oder deine Alltagsroutine ideal. Zieh den Suit an, leg zuhause los und bring Bewegung in deinen Tag, wann und wo du willst.',
  },
];

const PLUS_TAGS = ['Persönliche Begleitung', 'Maximale Flexibilität', 'Ohne Gerätekauf'];

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutConceptSection() {
  return (
    <section
      id="ueber-uns"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080c18 0%, #071a24 100%)',
        marginTop: '-24px',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Ambient glows */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(7,200,219,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,168,224,0.06) 0%, transparent 65%)', filter: 'blur(50px)' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-stretch">

          {/* ── Left: Text + cards ───────────────────────────────── */}
          <div>
            <FadeUp delay={0}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
                BODYTIME concept
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
                EMS-Training,{' '}
                <span className="text-white/40">das sich deinem Leben anpasst.</span>
              </h2>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed font-light mb-8">
                BODYTIME concept verbindet zertifizierte EMS-Experten mit Menschen,
                die das Training an ihren Alltag anpassen wollen und nicht den Alltag an ihr Training.
              </p>
            </FadeUp>

            {/* Positive tags */}
            <FadeUp delay={0.15} className="flex flex-wrap gap-2 mb-10">
              {PLUS_TAGS.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/15"
                  style={{ background: 'rgba(37,168,224,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#07C8DB' }} />
                  <span className="text-white/60">{tag}</span>
                </span>
              ))}
            </FadeUp>

            {/* Framer Motion bounce cards */}
            <div className="flex flex-col gap-4 mb-10">
              {CARDS.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 48, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: i * 0.13 }}
                  className="bg-white rounded-2xl p-6"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <p className="text-[15px] font-semibold text-gray-900 mb-2 leading-snug">{card.title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.text}</p>
                </motion.div>
              ))}
            </div>

            <FadeUp delay={0.4}>
              <ButtonColorful
                href="/beratung"
                label="Jetzt kostenlose Beratung sichern"
                className="h-12 px-7 text-[15px]"
              />
              <p className="mt-3 text-[11px] text-white/25 tracking-widest uppercase">
                Unverbindlich · Kostenlos · In 30 Minuten
              </p>
            </FadeUp>
          </div>

          {/* ── Right: Photo ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease, delay: 0.2 }}
            className="relative lg:sticky lg:top-24"
          >
            {/* Glow */}
            <div aria-hidden="true" className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(7,200,219,0.12) 0%, transparent 70%)',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
            {/* Image — portrait, height-capped on mobile so it doesn't dominate */}
            <div
              className="relative z-10 w-full rounded-3xl overflow-hidden max-h-[50vh] md:max-h-none"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bodytime-lifestyle.png"
                alt="BODYTIME concept – Training im Alltag"
                className="w-full object-cover"
                style={{ aspectRatio: '9/16', objectPosition: 'center top' }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
