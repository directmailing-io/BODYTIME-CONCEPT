'use client';
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

type CellValue =
  | { type: 'yes'; text?: string }
  | { type: 'no'; text?: string }
  | { type: 'partial'; text: string }
  | { type: 'text'; text: string };

interface Row {
  label: string;
  sublabel?: string;
  bodytime: CellValue;
  ems: CellValue;
  gym: CellValue;
}

const ROWS: Row[] = [
  {
    label: 'Preis pro Monat',
    bodytime: { type: 'text', text: 'ab 55 €' },
    ems:      { type: 'text', text: '80-150 €' },
    gym:      { type: 'text', text: '30-90 €' },
  },
  {
    label: 'Trainingsdauer',
    bodytime: { type: 'text', text: '20 Min.' },
    ems:      { type: 'text', text: '20 Min.' },
    gym:      { type: 'text', text: '45-90 Min.' },
  },
  {
    label: 'Zeitaufwand inkl. Anfahrt',
    bodytime: { type: 'text', text: '20 Min.' },
    ems:      { type: 'text', text: '45-90 Min.' },
    gym:      { type: 'text', text: '60-120 Min.' },
  },
  {
    label: 'Zeitliche Flexibilität',
    bodytime: { type: 'yes', text: 'Jederzeit' },
    ems:      { type: 'partial', text: 'Nur per Termin' },
    gym:      { type: 'partial', text: 'Öffnungszeiten' },
  },
  {
    label: 'Örtliche Flexibilität',
    bodytime: { type: 'yes', text: 'Überall' },
    ems:      { type: 'no', text: 'Nur im Studio' },
    gym:      { type: 'no', text: 'Nur im Studio' },
  },
  {
    label: 'Trainingstiefe',
    sublabel: 'pro Einheit',
    bodytime: { type: 'text', text: 'Sehr hoch' },
    ems:      { type: 'text', text: 'Hoch' },
    gym:      { type: 'text', text: 'Mittel' },
  },
  {
    label: 'Persönlicher Ansprechpartner',
    bodytime: { type: 'yes', text: 'Immer erreichbar' },
    ems:      { type: 'partial', text: 'Im Studio' },
    gym:      { type: 'no', text: 'Selten' },
  },
  {
    label: 'Training mit Freunden',
    bodytime: { type: 'yes', text: 'Jederzeit & überall' },
    ems:      { type: 'partial', text: 'Terminabhängig' },
    gym:      { type: 'yes', text: 'Ja, frei' },
  },
];

function Cell({ value, highlight = false }: { value: CellValue; highlight?: boolean }) {
  if (value.type === 'yes') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={highlight
            ? { background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }
            : { background: 'rgba(37,168,224,0.12)' }
          }
        >
          <Check className="w-3.5 h-3.5" style={{ color: highlight ? '#fff' : '#25A8E0' }} strokeWidth={2.5} />
        </div>
        {value.text && (
          <span className={`text-xs text-center leading-tight ${highlight ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
            {value.text}
          </span>
        )}
      </div>
    );
  }
  if (value.type === 'no') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100">
          <X className="w-3.5 h-3.5 text-gray-300" strokeWidth={2.5} />
        </div>
        {value.text && <span className="text-xs text-gray-300 text-center leading-tight">{value.text}</span>}
      </div>
    );
  }
  if (value.type === 'partial') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-50">
          <Minus className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
        </div>
        {value.text && <span className="text-xs text-gray-400 text-center leading-tight">{value.text}</span>}
      </div>
    );
  }
  return (
    <span className={`text-sm text-center leading-snug font-medium ${highlight ? 'text-gray-900' : 'text-gray-400'}`}>
      {value.text}
    </span>
  );
}

export default function ComparisonSection() {
  return (
    <section
      id="vergleich"
      className="relative overflow-hidden bg-white"
      style={{ marginTop: '-24px', zIndex: 28, borderRadius: '24px 24px 0 0' }}
    >
      <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4 text-[#25A8E0]">
            Der direkte Vergleich
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight mb-5">
            Warum BODYTIME concept{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              die klügere Wahl ist.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-light">
            Ehrlicher Vergleich, damit du selbst entscheiden kannst.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease }}
          className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0"
        >
        <div
          className="rounded-3xl overflow-hidden border border-gray-100 min-w-[460px] sm:min-w-0"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}
        >
          {/* Column headers */}
          <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50/80">
            <div className="px-4 py-4 sm:px-6" />
            {/* BODYTIME highlighted */}
            <div
              className="px-3 py-4 sm:px-5 text-center flex flex-col items-center justify-end gap-1"
              style={{
                background: 'linear-gradient(180deg, rgba(37,168,224,0.08) 0%, rgba(37,168,224,0.03) 100%)',
                borderLeft: '1px solid rgba(37,168,224,0.15)',
                borderRight: '1px solid rgba(37,168,224,0.15)',
              }}
            >
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1"
                    style={{ background: 'rgba(37,168,224,0.12)', color: '#25A8E0' }}>
                Empfohlen
              </span>
              <p className="text-[13px] sm:text-sm font-bold text-gray-900 leading-snug">BODYTIME</p>
              <p className="text-[11px] text-gray-400">concept</p>
            </div>
            <div className="px-3 py-4 sm:px-5 text-center flex flex-col items-center justify-end gap-1 border-r border-gray-100">
              <p className="text-[13px] sm:text-sm font-semibold text-gray-500 leading-snug">EMS</p>
              <p className="text-[11px] text-gray-400">Studio</p>
            </div>
            <div className="px-3 py-4 sm:px-5 text-center flex flex-col items-center justify-end gap-1">
              <p className="text-[13px] sm:text-sm font-semibold text-gray-500 leading-snug">Fitness</p>
              <p className="text-[11px] text-gray-400">Studio</p>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-4"
              style={{
                borderBottom: i < ROWS.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: i % 2 === 0 ? '#ffffff' : '#fafafa',
              }}
            >
              {/* Label */}
              <div className="px-4 py-4 sm:px-6 flex flex-col justify-center">
                <span className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">{row.label}</span>
                {row.sublabel && (
                  <span className="text-[11px] text-gray-400 mt-0.5">{row.sublabel}</span>
                )}
              </div>
              {/* BODYTIME */}
              <div
                className="px-3 py-4 sm:px-5 flex items-center justify-center"
                style={{
                  background: 'rgba(37,168,224,0.04)',
                  borderLeft: '1px solid rgba(37,168,224,0.12)',
                  borderRight: '1px solid rgba(37,168,224,0.12)',
                }}
              >
                <Cell value={row.bodytime} highlight />
              </div>
              {/* EMS */}
              <div className="px-3 py-4 sm:px-5 flex items-center justify-center border-r border-gray-100">
                <Cell value={row.ems} />
              </div>
              {/* Gym */}
              <div className="px-3 py-4 sm:px-5 flex items-center justify-center">
                <Cell value={row.gym} />
              </div>
            </div>
          ))}
        </div>
        </motion.div>

        {/* Footnote */}
        <p className="text-center text-xs text-gray-300 mt-6 leading-relaxed">
          Preisangaben sind Richtwerte und können je nach Anbieter und Region variieren. EMS-Studio-Preise basieren auf marktüblichen Tarifen für Deutschland 2026.
        </p>

      </div>
    </section>
  );
}
