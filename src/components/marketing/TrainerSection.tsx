'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wifi, MapPin, ChevronRight, Users } from 'lucide-react';
import TrainerModal from './TrainerModal';

interface Bio {
  id: string;
  image_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_zip: string | null;
  contact_city: string | null;
  services: string[];
  training_modes: string[];
  philosophy: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_youtube: string | null;
  social_linkedin: string | null;
  social_tiktok: string | null;
}

const PAGE_SIZE = 8;
const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

function TrainerCard({ bio, onClick, index }: { bio: Bio; onClick: () => void; index: number }) {
  const name = [bio.contact_first_name, bio.contact_last_name].filter(Boolean).join(' ') || 'Trainer';
  const initials = `${bio.contact_first_name?.[0] ?? ''}${bio.contact_last_name?.[0] ?? ''}`.toUpperCase() || '?';
  const location = [bio.contact_zip, bio.contact_city].filter(Boolean).join(' ');
  const isOnline = bio.training_modes.includes('online');
  const isLocal = bio.training_modes.some(m => m !== 'online');

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease, delay: (index % PAGE_SIZE) * 0.04 }}
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden text-left w-full cursor-pointer"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
    >
      {/* Image — square crop, same region as modal avatar */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {bio.image_url ? (
          <img
            src={bio.image_url}
            alt={name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
            <span className="text-5xl font-semibold text-gray-300">{initials}</span>
          </div>
        )}
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {/* Mode pills */}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {isOnline && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
              <Wifi className="w-2.5 h-2.5" /> Online
            </span>
          )}
          {isLocal && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
              <MapPin className="w-2.5 h-2.5" /> Vor Ort
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 text-[15px] leading-tight">{name}</p>
            {location && <p className="text-xs text-gray-400 mt-0.5">{location}</p>}
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-[#25A8E0] transition-colors flex-shrink-0 mt-0.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
        {bio.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {bio.services.slice(0, 2).map((s, i) => (
              <span key={i} className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
            ))}
            {bio.services.length > 2 && (
              <span className="text-[11px] text-gray-400">+{bio.services.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}

export default function TrainerSection({ bios }: { bios: Bio[] }) {
  const [mode, setMode] = useState<'all' | 'online' | 'vor-ort'>('all');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Bio | null>(null);

  const filtered = useMemo(() => {
    let r = [...bios];
    if (mode === 'online') r = r.filter(b => b.training_modes.includes('online'));
    else if (mode === 'vor-ort') r = r.filter(b => b.training_modes.some(m => m !== 'online'));
    return r.sort((a, b) => {
      const cmp = (a.contact_zip ?? '').localeCompare(b.contact_zip ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [bios, mode, sortDir]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [mode, sortDir]);

  const shown = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const remaining = filtered.length - visibleCount;

  const MODES = [
    { value: 'all' as const, label: 'Alle', icon: null },
    { value: 'online' as const, label: 'Online', icon: Wifi },
    { value: 'vor-ort' as const, label: 'Vor Ort', icon: MapPin },
  ];

  return (
    <section
      id="trainer"
      className="relative bg-white"
      style={{ marginTop: '-24px', borderRadius: '24px 24px 0 0', zIndex: 30 }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-3">
            Zertifizierte Experten
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-gray-900 leading-tight tracking-tight">
              Unsere zertifizierten<br />EMS-Trainer
            </h2>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Segmented control */}
              <div className="flex p-1 rounded-xl bg-gray-100 gap-0.5">
                {MODES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setMode(value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[36px] ${
                      mode === value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                ))}
              </div>

              {/* PLZ sort toggle */}
              <button
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                title="Nach PLZ sortieren"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                PLZ {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="text-gray-400 text-sm">Keine Trainer für diese Auswahl gefunden.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {shown.map((bio, i) => (
                <TrainerCard
                  key={bio.id}
                  bio={bio}
                  index={i}
                  onClick={() => setSelected(bio)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex flex-col items-center gap-2 mt-10">
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 active:scale-95 transition-all duration-150"
            >
              Weitere Trainer laden
            </button>
            <p className="text-xs text-gray-400">{remaining} weitere verfügbar</p>
          </div>
        )}

      </div>

      {selected && <TrainerModal bio={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
