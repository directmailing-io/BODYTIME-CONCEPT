import { CheckCircle2, CalendarDays } from 'lucide-react';
import { ButtonColorful } from '@/components/ui/ButtonColorful';

const BENEFITS = [
  'Trainieren wann und wo du willst - perfekt als Ergänzung zu deinem Sport.',
  'Sofortlösung bei Beschwerden, Verspannungen, Muskelaufbau und mehr.',
  'Dein persönlicher Ansprechpartner - immer für dich da.',
];

const INFO_CALL_URL = 'https://us02web.zoom.us/meeting/register/p7wYrIHdSu2gEDwTo-Y28w#/registration';

// Info-Call: wiederkehrend jeden Donnerstag 19:15 Uhr (Europe/Berlin).
// Zeigt den naechsten kommenden Termin (inkl. heute, falls Donnerstag).
function getNextInfoCallDate(now: Date = new Date()): string {
  const berlinParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const y = Number(berlinParts.find((p) => p.type === 'year')!.value);
  const m = Number(berlinParts.find((p) => p.type === 'month')!.value);
  const d = Number(berlinParts.find((p) => p.type === 'day')!.value);

  // Fixiert auf 12:00 UTC, damit getUTCDay() nicht durch Zeitzonenverschiebung kippt.
  const berlinToday = new Date(Date.UTC(y, m - 1, d, 12));
  const daysUntilThursday = (4 - berlinToday.getUTCDay() + 7) % 7;
  const next = new Date(berlinToday);
  next.setUTCDate(berlinToday.getUTCDate() + daysUntilThursday);

  const dd = String(next.getUTCDate()).padStart(2, '0');
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}. · 19:15 Uhr`;
}

export default function HeroSection() {
  const infoCallDate = getNextInfoCallDate();

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

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
            <ButtonColorful
              href="/beratung"
              label="Jetzt kostenlose Beratung sichern"
              className="h-14 px-7 text-[15px]"
            />

            {/* Secondary – Info-Call */}
            <a
              href={INFO_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-col items-center justify-center gap-0.5 h-14 px-6
                         rounded-xl border border-white/[0.18] bg-white/[0.06]
                         hover:border-[#25A8E0]/50 hover:bg-[#25A8E0]/10
                         transition-all duration-200 whitespace-nowrap"
            >
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-[14px] h-[14px] flex-shrink-0 text-[#25A8E0]" />
                <span className="text-[14px] font-medium text-white/80 group-hover:text-white transition-colors">
                  Kostenloser Info-Call
                </span>
              </span>
              <span className="text-[10px] text-white/35 tracking-wide">
                {infoCallDate}
              </span>
            </a>
          </div>

          {/* Micro trust */}
          <p className="mt-4 text-[11px] text-white/30 tracking-widest uppercase">
            Unverbindlich · Kostenlos · In 30 Minuten
          </p>
        </div>
      </div>
    </section>
  );
}
