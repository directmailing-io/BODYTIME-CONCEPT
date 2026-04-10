'use client';
import { motion } from 'framer-motion';
import { CalendarDays, MessageCircle, Zap } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/ButtonColorful';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const STEPS = [
  {
    num: '01',
    Icon: CalendarDays,
    title: 'Beratung buchen',
    desc: 'Wähle einen Termin, der dir passt. Keine Vorbereitung nötig, einfach anmelden und erscheinen.',
  },
  {
    num: '02',
    Icon: MessageCircle,
    title: 'Beratung findet statt',
    desc: 'In 30 Minuten lernen wir dich kennen, klären deine Ziele und erstellen deinen persönlichen Plan.',
  },
  {
    num: '03',
    Icon: Zap,
    title: 'Einführung & Start',
    desc: 'Du erhältst deinen EMS Anzug, wir führen dich ein und dein Training beginnt.',
  },
];

const CONSULT_BENEFITS = [
  {
    num: '01',
    title: 'Deine Situation verstehen',
    desc: 'Wir hören dir zu. Wo stehst du gerade? Was hat bisher nicht funktioniert? Was fehlt dir in deiner Routine?',
  },
  {
    num: '02',
    title: 'Gemeinsam Ziele setzen',
    desc: 'Wir legen gemeinsam fest, was du wirklich erreichen möchtest. Konkret, realistisch und auf deinen Alltag abgestimmt.',
  },
  {
    num: '03',
    title: 'BODYTIME auf dich zuschneiden',
    desc: 'Wir zeigen dir genau, wie das Konzept für dich funktioniert und wie wir es individuell auf deine Situation anpassen.',
  },
  {
    num: '04',
    title: 'Du entscheidest frei',
    desc: 'Kein Druck, kein Verkaufsgespräch. Du kannst jederzeit Nein sagen und wir respektieren das vollständig.',
  },
];

export default function NextStepsSection() {
  return (
    <section
      id="beratung"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080c18 0%, #0a1628 50%, #080c18 100%)',
        marginTop: '-24px',
        borderRadius: '24px 24px 0 0',
        zIndex: 35,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[250px] sm:w-[500px] sm:h-[350px] lg:w-[700px] lg:h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.12) 0%, transparent 65%)', filter: 'blur(60px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Die nächsten Schritte
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
            Was nun{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>zu tun ist.</span>
          </h2>
          <p className="text-base sm:text-lg text-white/55 leading-relaxed font-light">
            Du hast zu keinem Zeitpunkt ein Risiko. Du kannst dich kostenlos und unverbindlich beraten lassen,
            damit du entspannt prüfen kannst, ob unser Konzept das Richtige für dich ist.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20 max-w-4xl mx-auto">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              className="relative rounded-2xl p-5 sm:p-7 flex flex-col gap-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Desktop connector */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-[38px] left-[calc(100%+1px)] w-4 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(37,168,224,0.4), rgba(37,168,224,0))' }}
                />
              )}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(37,168,224,0.3)' }}
                >
                  <step.Icon className="w-5 h-5" style={{ color: '#25A8E0' }} />
                </div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-white/25">{step.num}</span>
              </div>
              <div>
                <p className="text-[17px] font-semibold text-white mb-2 leading-snug">{step.title}</p>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Consultation feature block ─────────────────── */}
        <div className="max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25 mb-8 text-center"
          >
            Das bekommst du in der Beratung
          </motion.p>

          {/* Numbered feature rows */}
          <div
            className="rounded-3xl overflow-hidden mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(37,168,224,0.08) 0%, rgba(37,99,235,0.04) 100%)',
              border: '1px solid rgba(37,168,224,0.14)',
            }}
          >
            {CONSULT_BENEFITS.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.5, ease, delay: 0.1 + i * 0.08 }}
                className="flex items-start gap-4 sm:gap-6 px-5 sm:px-8 py-5 sm:py-6"
                style={{ borderBottom: i < CONSULT_BENEFITS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
              >
                {/* Gradient number */}
                <span
                  className="text-[13px] font-semibold tracking-widest flex-shrink-0 mt-[3px] font-mono"
                  style={{
                    background: 'linear-gradient(135deg, #25A8E0, #07C8DB)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {num}
                </span>
                <div className="flex-1">
                  <p className="text-[17px] font-semibold text-white mb-1 leading-snug">{title}</p>
                  <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pricing card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6, ease }}
            className="rounded-3xl overflow-hidden mb-8"
            style={{ background: '#ffffff', boxShadow: '0 8px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)' }}
          >
            {/* Card header */}
            <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-gray-100">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#25A8E0] mb-2">
                Alles inklusive
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-sm text-gray-400 font-medium">ab</span>
                <span
                  className="font-semibold leading-none tracking-tighter text-gray-900"
                  style={{ fontSize: 'clamp(36px, 10vw, 72px)' }}
                >
                  55 €
                </span>
                <span className="text-sm text-gray-400 font-medium">/ Monat</span>
              </div>
              <p className="text-xs text-gray-500">Im Vergleich: EMS-Studio 80-150 Euro im Monat.</p>
            </div>

            {/* Feature list */}
            <div className="px-6 sm:px-8 pt-5 pb-2 flex flex-col gap-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 mb-4">
                Darüber hinaus bekommst du:
              </p>
              {[
                'EMS-Anzug zur Miete, direkt von ANTELOPE by beurer',
                'Persönlicher EMS-Experte, immer erreichbar, kein Terminstress',
                'Persönliches Einführungsgespräch und individuelles Onboarding',
                'Alltagsintegration: Wann, wie und wo du am besten trainierst',
                'Regelmäßige Check-in-Calls und Anpassung bei Zieländerungen',
                'Direkte Schnittstelle zum Hersteller',
                '14 Tage Widerrufsrecht · 30 Tage Umtauschrecht bei Größenproblemen',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                  >
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                </div>
              ))}
            </div>
            <div className="px-6 sm:px-8 pb-7 pt-2" />
          </motion.div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <ButtonColorful
              href="#beratung"
              label="Jetzt kostenlose Beratung buchen"
              className="h-12 px-8 text-[15px]"
            />
            <p className="text-[11px] text-white/25 tracking-widest uppercase">
              Unverbindlich · Kostenlos · In 30 Minuten
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
