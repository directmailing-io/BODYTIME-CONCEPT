'use client';
import { useEffect } from 'react';
import { X, Wifi, MapPin, Phone, Mail, MapPinned } from 'lucide-react';
import {
  InstagramIcon, FacebookIcon, YouTubeIcon, LinkedInIcon, TikTokIcon,
} from '@/components/ui/SocialIcons';

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

export default function TrainerModal({ bio, onClose }: { bio: Bio; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const name = [bio.contact_first_name, bio.contact_last_name].filter(Boolean).join(' ') || 'Trainer';
  const initials = `${bio.contact_first_name?.[0] ?? ''}${bio.contact_last_name?.[0] ?? ''}`.toUpperCase() || '?';
  const location = [bio.contact_zip, bio.contact_city].filter(Boolean).join(' ');
  const isOnline = bio.training_modes.includes('online');
  const isLocal = bio.training_modes.some(m => m !== 'online');

  const socials = [
    { url: bio.social_instagram, Icon: InstagramIcon, label: 'Instagram' },
    { url: bio.social_facebook,  Icon: FacebookIcon,  label: 'Facebook' },
    { url: bio.social_youtube,   Icon: YouTubeIcon,   label: 'YouTube' },
    { url: bio.social_linkedin,  Icon: LinkedInIcon,  label: 'LinkedIn' },
    { url: bio.social_tiktok,    Icon: TikTokIcon,    label: 'TikTok' },
  ].filter(s => s.url);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/8 hover:bg-black/15 flex items-center justify-center transition-colors"
          aria-label="Schließen"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* ── Compact header ─────────────────────── */}
        <div className="px-6 pt-8 pb-6 flex items-center gap-5">
          {/* Square avatar — same crop as grid card (object-top) */}
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: 80, height: 80 }}
          >
            {bio.image_url ? (
              <img
                src={bio.image_url}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}
              >
                <span className="text-2xl font-semibold text-gray-300">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + location + modes */}
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 leading-tight truncate">{name}</h2>
            {location && (
              <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPinned className="w-3.5 h-3.5 flex-shrink-0" />
                {location}
              </p>
            )}
            {(isOnline || isLocal) && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {isOnline && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                )}
                {isLocal && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    <MapPin className="w-2.5 h-2.5" /> Vor Ort
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* ── Content ────────────────────────────── */}
        <div className="p-6 space-y-6">

          {/* CTA Buttons */}
          {(bio.contact_phone || bio.contact_email) && (
            <div className="flex gap-3 flex-wrap">
              {bio.contact_phone && (
                <a
                  href={`tel:${bio.contact_phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Anrufen
                </a>
              )}
              {bio.contact_email && (
                <a
                  href={`mailto:${bio.contact_email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-900 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  E-Mail
                </a>
              )}
            </div>
          )}

          {/* Services */}
          {bio.services.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Leistungen</p>
              <div className="flex flex-wrap gap-2">
                {bio.services.map((s, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Philosophy */}
          {bio.philosophy && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Philosophie</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{bio.philosophy}</p>
            </div>
          )}

          {/* Social */}
          {socials.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Social Media</p>
              <div className="flex gap-3 flex-wrap">
                {socials.map(({ url, Icon, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
