'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const FAQS = [
  {
    q: 'Was ist EMS Training?',
    a: 'EMS steht für Elektromyostimulation. Klingt komplizierter als es ist. Stell dir vor, dein Körper bekommt während des Trainings sanfte elektrische Impulse, ähnlich wie die, die dein Gehirn sowieso an deine Muskeln sendet, nur viel stärker und kontrollierter. Das Ergebnis: Bis zu 90 % aller Muskeln arbeiten gleichzeitig. Beim normalen Training sind es vielleicht 30 bis 40 %. Genau deshalb reichen 20 Minuten.',
  },
  {
    q: 'Für wen ist EMS Training geeignet?',
    a: 'Ehrlich gesagt für fast jeden. Ob du schon ewig keinen Sport gemacht hast oder bereits aktiv bist. Ob du Rückenschmerzen hast oder Muskeln aufbauen willst. Ob du wenig Zeit hast oder einfach keine Lust auf Fitnessstudios. EMS funktioniert. Ausnahmen gibt es natürlich: Wenn du schwanger bist, einen Herzschrittmacher trägst oder gerade eine aktive Entzündung hast, sprich vorher kurz mit deinem Arzt.',
  },
  {
    q: 'Wie oft soll ich trainieren?',
    a: 'Zweimal die Woche ist ideal. Das klingt wenig, aber genau das ist der Punkt. EMS ist so intensiv, dass dein Körper Zeit braucht, um sich zu regenerieren. Wenn du öfter trainierst, bringst du deinen Körper nicht in einen besseren Zustand, du überforderst ihn einfach. Zwei mal 20 Minuten pro Woche, das reicht wirklich.',
  },
  {
    q: 'Brauche ich Vorerfahrung oder spezielle Ausrüstung?',
    a: 'Gar nicht. Du brauchst weder Erfahrung noch eigene Ausrüstung. Den EMS Anzug mietest du direkt von deinem Trainer. Beim ersten Training nimmt er sich Zeit, um dir alles zu zeigen und alles richtig einzustellen. Danach weißt du genau, was zu tun ist. Wirklich kinderleicht.',
  },
  {
    q: 'Wie unterscheidet sich BODYTIME concept von einem EMS Studio?',
    a: 'Bei einem EMS Studio musst du fixe Termine vereinbaren. Du musst dorthin fahren, und wenn du mal eine Verspätung hast, kürzt sich deine Session. Wenn was dazwischenkommt, fällt das Training einfach aus. Das hat direkte Auswirkungen auf deine Fortschritte, weil Regelmäßigkeit beim Training alles ist. Mit BODYTIME concept trainierst du zuhause, unterwegs oder wo auch immer du möchtest. Du legst den Anzug an, öffnest die App und machst los. Kein Termin, keine Anfahrt, kein Ausfall. Und trotzdem hast du deinen persönlichen Trainer, der dich begleitet.',
  },
  {
    q: 'Was kostet das Training?',
    a: 'Den EMS Anzug mietest du direkt von deinem persönlichen Trainer. Das bedeutet, du hast keine großen Anschaffungskosten. Die genauen Preise hängen von deinem Trainer und deinem Paket ab. Alles dazu erfährst du in der kostenlosen Beratung, ganz ohne Druck und ohne versteckte Kosten.',
  },
  {
    q: 'Ist EMS Training sicher?',
    a: 'Ja, absolut. EMS Training ist seit über 40 Jahren in der Sportmedizin und Physiotherapie im Einsatz. Spitzensportler nutzen es zur Regeneration, Ärzte setzen es in der Rehabilitation ein. Mit einem zertifizierten Trainer und dem richtigen Anzug ist es auch für Einsteiger komplett sicher und effektiv.',
  },
  {
    q: 'Was passiert in der kostenlosen Beratung?',
    a: 'Wir lernen dich kennen. Wir hören zu, was deine Ziele sind, was bisher nicht funktioniert hat und was du dir vorstellst. Dann zeigen wir dir genau, wie BODYTIME concept für dich funktionieren kann. Du gehst mit einem konkreten Plan raus. Und wenn du danach feststellst, dass es nichts für dich ist, ist das völlig okay. Kein Druck, keine Verpflichtung, das versprechen wir dir.',
  },
];

function FAQItem({
  q, a, open, onToggle, index,
}: {
  q: string; a: string; open: boolean; onToggle: () => void; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease, delay: index * 0.05 }}
      className="border-b border-gray-100 last:border-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className={`text-[15px] font-medium leading-snug transition-colors ${open ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>
          {q}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: open ? 'linear-gradient(135deg, #25A8E0, #07C8DB)' : '#f3f4f6' }}
        >
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-300"
            style={{
              color: open ? 'white' : '#9ca3af',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative bg-white"
      style={{ marginTop: '-24px', borderRadius: '24px 24px 0 0', zIndex: 40 }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">

          {/* Left: headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease }}
            className="md:sticky md:top-20 md:self-start lg:sticky lg:top-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-3">
              Häufige Fragen
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight tracking-tight mb-5">
              Alles, was du wissen möchtest.
            </h2>
            <p className="text-base text-gray-500 leading-relaxed font-light">
              Hier findest du Antworten auf häufig gestellte Fragen.
            </p>
          </motion.div>

          {/* Right: accordion */}
          <div className="lg:col-span-2">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
                index={i}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
