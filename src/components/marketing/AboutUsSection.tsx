'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface TimelineEntry { year: string; label: string }
interface Founder {
  name: string;
  role: string;
  image: string;
  highlights: string[];
  timeline: TimelineEntry[];
}

const FOUNDERS: Founder[] = [
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

function FounderCard({ founder, index }: { founder: Founder; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease, delay: index * 0.14 }}
      className="rounded-3xl overflow-hidden bg-white flex flex-col lg:flex-row"
      style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)' }}
    >
      {/* ── Photo ── */}
      <div className="relative w-full lg:w-[300px] xl:w-[340px] flex-shrink-0">
        <div className="relative w-full aspect-square lg:aspect-auto lg:h-full min-h-[300px]">
          <Image
            src={founder.image}
            alt={founder.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 340px"
          />
          {/* subtle bottom gradient for name on mobile */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)' }}
          />
          <div className="absolute bottom-4 left-5 lg:hidden">
            <p className="text-white text-xl font-semibold leading-tight">{founder.name}</p>
            <p className="text-white/75 text-xs mt-0.5">{founder.role}</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-6 p-6 sm:p-8 flex-1">
        {/* Name + Role – desktop only */}
        <div className="hidden lg:block">
          <p className="text-2xl font-semibold text-gray-900 leading-tight">{founder.name}</p>
          <p className="text-sm text-[#25A8E0] font-medium mt-1">{founder.role}</p>
        </div>

        {/* Highlights */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 mb-3">
            Expertise
          </p>
          <ul className="space-y-2">
            {founder.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5">
                <span
                  className="mt-1 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #25A8E0, #07C8DB)' }}
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700 leading-snug">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Timeline */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 mb-4">
            Werdegang
          </p>
          <div className="relative pl-4">
            {/* vertical line */}
            <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-3">
              {founder.timeline.map((entry, i) => {
                const isLast = i === founder.timeline.length - 1;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`absolute -left-[3px] mt-[5px] w-[7px] h-[7px] rounded-full flex-shrink-0 ${
                        isLast
                          ? 'ring-2 ring-[#25A8E0]'
                          : 'bg-gray-300'
                      }`}
                      style={isLast ? { background: '#25A8E0' } : {}}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-semibold text-[#25A8E0] tabular-nums whitespace-nowrap">
                        {entry.year}
                      </span>
                      <span className={`text-xs leading-snug ${isLast ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
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
  );
}

export default function AboutUsSection() {
  return (
    <section id="team" className="relative bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-3">
            Die Gründer
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-gray-900 leading-tight tracking-tight">
            Die Gesichter hinter BODYTIME concept
          </h2>
        </motion.div>

        <div className="flex flex-col gap-6">
          {FOUNDERS.map((founder, i) => (
            <FounderCard key={founder.name} founder={founder} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
