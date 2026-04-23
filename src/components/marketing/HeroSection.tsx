import { CheckCircle2 } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/ButtonColorful';

const BENEFITS = [
  'Trainieren wann und wo du willst - perfekt als Ergänzung zu deinem Sport.',
  'Sofortlösung bei Beschwerden, Verspannungen, Muskelaufbau und mehr.',
  'Dein persönlicher EMS-Experte, immer an deiner Seite.',
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100dvh',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
      }}
    >
      {/* Gradient – Smartphone Portrait */}
      <div
        aria-hidden="true"
        className="absolute inset-0 md:hidden"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,12,24,0.55) 0%, rgba(8,12,24,0.72) 38%, rgba(8,12,24,0.93) 65%, rgba(8,12,24,0.98) 100%)',
        }}
      />

      {/* Gradient – Tablet & Desktop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'linear-gradient(to right, rgba(8,12,24,0.97) 0%, rgba(8,12,24,0.93) 28%, rgba(8,12,24,0.72) 48%, rgba(8,12,24,0.28) 68%, transparent 88%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div
          className="hero-content w-full pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24
                     md:max-w-lg lg:max-w-xl xl:max-w-2xl"
        >
          {/* Tagline */}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55 mb-5">
            Für alle, die smart trainieren wollen
          </p>

          {/* H1 */}
          <h1 className="font-semibold text-white leading-[1.0] tracking-tight mb-6
                         text-[38px] sm:text-[54px] md:text-[60px] lg:text-[72px] xl:text-[82px]">
            Training, das
            <br />
            <span className="gradient-text-animated">
              zum Alltag wird.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-white/65 text-base sm:text-[17px] leading-relaxed mb-9 max-w-md font-light">
            Suit an, App auf, Trainer dabei. BODYTIME concept bringt professionelles EMS-Training zu dir - wann und wo du willst, ganz ohne feste Termine.
          </p>

          {/* Benefits */}
          <ul className="space-y-3.5 mb-11">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-[15px] sm:text-base text-white/85 leading-snug font-light"
              >
                <CheckCircle2
                  className="w-[18px] h-[18px] flex-shrink-0 mt-0.5"
                  style={{ color: '#25A8E0' }}
                />
                {b}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <ButtonColorful
            href="/beratung"
            label="Jetzt kostenlose Beratung sichern"
            className="h-12 px-7 text-[15px]"
          />

          {/* Micro trust */}
          <p className="mt-4 text-[11px] text-white/30 tracking-widest uppercase">
            Unverbindlich · Kostenlos · In 30 Minuten
          </p>
        </div>
      </div>
    </section>
  );
}
