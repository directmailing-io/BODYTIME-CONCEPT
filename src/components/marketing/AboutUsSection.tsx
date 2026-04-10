'use client';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const FOUNDERS = [
  {
    name: 'Vorname Nachname',
    initials: 'VN',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  },
  {
    name: 'Vorname Nachname',
    initials: 'VN',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  },
];

export default function AboutUsSection() {
  return (
    <section id="team" className="relative bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="max-w-xl mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-3">
            Die Gründer
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-gray-900 leading-tight tracking-tight">
            Die Gesichter hinter BODYTIME concept
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {FOUNDERS.map((founder, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease, delay: i * 0.12 }}
              className="rounded-3xl overflow-hidden bg-white flex flex-col"
              style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
            >
              {/* Placeholder photo */}
              <div
                className="w-full flex flex-col items-center justify-center gap-3"
                style={{
                  aspectRatio: '3/2',
                  background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)',
                }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #dde4ec 0%, #c8d3de 100%)' }}
                >
                  <span className="text-3xl font-semibold text-gray-400">{founder.initials}</span>
                </div>
                <span className="text-xs text-gray-400 tracking-wider uppercase font-medium">Foto folgt</span>
              </div>

              {/* Info */}
              <div className="p-5 sm:p-7 lg:p-8 flex flex-col gap-3 flex-1">
                <p className="text-xl font-semibold text-gray-900">{founder.name}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{founder.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
