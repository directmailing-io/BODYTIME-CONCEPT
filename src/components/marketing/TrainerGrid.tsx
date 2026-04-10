'use client';
import { useState } from 'react';
import { Wifi, MapPin, ChevronRight } from 'lucide-react';
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

function TrainerCard({ bio, onClick }: { bio: Bio; onClick: () => void }) {
  const name = [bio.contact_first_name, bio.contact_last_name].filter(Boolean).join(' ') || 'Trainer';
  const initials = `${bio.contact_first_name?.[0] ?? ''}${bio.contact_last_name?.[0] ?? ''}`.toUpperCase() || '?';
  const location = [bio.contact_zip, bio.contact_city].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 text-left w-full"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {bio.image_url
          ? <img
              src={bio.image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl font-bold text-gray-300">{initials}</span>
            </div>
        }
        {/* Training mode pill(s) — bottom-left overlay */}
        {bio.training_modes.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
            {bio.training_modes.map(m => (
              <span key={m} className="inline-flex items-center gap-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                {m === 'online' ? <Wifi className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
                {m === 'online' ? 'Online' : 'Vor Ort'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-base leading-tight">{name}</h3>
            {location && <p className="text-xs text-gray-400 mt-0.5">{location}</p>}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-0.5" />
        </div>

        {/* Service chips (first 3) */}
        {bio.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {bio.services.slice(0, 3).map((s, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {bio.services.length > 3 && (
              <span className="text-xs text-gray-400 px-1 py-0.5">
                +{bio.services.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export default function TrainerGrid({ bios }: { bios: Bio[] }) {
  const [selected, setSelected] = useState<Bio | null>(null);

  if (bios.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Demnächst verfügbar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {bios.map(bio => (
          <TrainerCard key={bio.id} bio={bio} onClick={() => setSelected(bio)} />
        ))}
      </div>

      {selected && (
        <TrainerModal bio={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
