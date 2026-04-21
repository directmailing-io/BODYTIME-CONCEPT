'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Activity, RefreshCw, Dumbbell, TrendingUp,
  Wind, MapPin, Zap, Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SOLUTIONS = [
  {
    wenn: 'Dein Rücken sich meldet',
    desc: 'Du kennst das: der Rücken meldet sich und wochenlang auf einen Termin warten ist keine Option. Mit BODYTIME concept legst du einfach sofort los.',
    gradient: 'linear-gradient(145deg, #f59e0b, #d97706)',
    glow: 'rgba(245,158,11,0.4)',
    Icon: Activity,
    image: '/solutions/ruecken.webp',
  },
  {
    wenn: 'Du gerade viel um die Ohren hast',
    desc: 'Job, Familie, Alltag - und kaum Luft für dich selbst. Genau dann ist eine kurze EMS-Session das Sinnvollste, was du für deinen Körper tun kannst, ohne großen Aufwand.',
    gradient: 'linear-gradient(145deg, #10b981, #059669)',
    glow: 'rgba(16,185,129,0.4)',
    Icon: RefreshCw,
    image: '/solutions/keine-zeit.webp',
  },
  {
    wenn: 'Du Kraft und Figur formen willst',
    desc: 'Du willst spürbare Veränderungen, schaffst es aber aus welchem Grund auch immer nicht regelmäßig ins Studio. Mit BODYTIME concept trainierst du einfach dann, wenn es passt.',
    gradient: 'linear-gradient(145deg, #3b82f6, #4f46e5)',
    glow: 'rgba(79,70,229,0.4)',
    Icon: Dumbbell,
    image: '/solutions/kraft.webp',
  },
  {
    wenn: 'Du nach einer Pause wieder einsteigen willst',
    desc: 'Du warst mal aktiv, aber irgendwann ist es eingeschlafen. Jetzt willst du wieder loslegen, ohne gleich ins kalte Wasser zu springen. BODYTIME concept macht den Einstieg leicht.',
    gradient: 'linear-gradient(145deg, #f97316, #dc2626)',
    glow: 'rgba(249,115,22,0.4)',
    Icon: TrendingUp,
    image: '/solutions/wiedersport.webp',
  },
  {
    wenn: 'Verspannungen dich einschränken',
    desc: 'Schultern, Nacken oder Rücken machen zu - und der nächste freie Termin ist in zwei Wochen. Mit dem Suit bist du sofort dran, ganz ohne Wartezeit.',
    gradient: 'linear-gradient(145deg, #ec4899, #9333ea)',
    glow: 'rgba(236,72,153,0.4)',
    Icon: Wind,
    image: '/solutions/verspannung.webp',
  },
  {
    wenn: 'Das Gym gerade keine Option ist',
    desc: 'Manchmal passt es einfach nicht: zu weit, keine Zeit, keine Lust auf Anfahrt. Mit BODYTIME concept trainierst du trotzdem, ganz ohne irgendwo hinfahren zu müssen.',
    gradient: 'linear-gradient(145deg, #06b6d4, #0ea5e9)',
    glow: 'rgba(6,182,212,0.4)',
    Icon: MapPin,
    image: '/solutions/keingym.webp',
  },
  {
    wenn: 'Du mehr Energie im Alltag willst',
    desc: 'Der Alltag fordert viel, die Energie bleibt auf der Strecke. Eine EMS-Session belebt Körper und Kreislauf und gibt dir das Gefühl, wirklich etwas für dich getan zu haben.',
    gradient: 'linear-gradient(145deg, #8b5cf6, #6d28d9)',
    glow: 'rgba(139,92,246,0.4)',
    Icon: Zap,
    image: '/solutions/energie.webp',
  },
  {
    wenn: 'Du bereits aktiv Sport treibst',
    desc: 'Du läufst, fährst Rad oder gehst ins Gym - aber du willst mehr herausholen. EMS ergänzt deinen Sport mit Reizen, die normales Training nicht schafft.',
    gradient: 'linear-gradient(145deg, #14b8a6, #0891b2)',
    glow: 'rgba(20,184,166,0.4)',
    Icon: Sparkles,
    image: '/solutions/sport.webp',
  },
];

export default function SofortloesungSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!section || cards.length === 0) return;

    // If the section is already visible on load, animate immediately without ScrollTrigger
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      gsap.fromTo(cards,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.4)', stagger: { each: 0.06, from: 'start' } }
      );
      return () => { gsap.set(cards, { clearProps: 'all' }); };
    }

    gsap.set(cards, { y: 40, opacity: 0, scale: 0.95 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      // Fire as soon as the section enters the bottom of the viewport
      start: 'top bottom',
      once: true,
      onEnter: () => {
        gsap.to(cards, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: 'back.out(1.4)',
          stagger: { each: 0.06, from: 'start' },
        });
      },
    });

    return () => {
      trigger.kill();
      gsap.set(cards, { clearProps: 'all' });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sofortloesung"
      className="relative overflow-hidden"
      style={{
        background: '#071a24',
        marginTop: '-24px',
        zIndex: 22,
        borderRadius: '24px 24px 0 0',
      }}
    >
      {/* Ambient glow top */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(37,168,224,0.07) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Für jede Situation
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
            Wann BODYTIME concept{' '}
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              genau das Richtige ist.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white/50 leading-relaxed font-light">
            Manche Momente rufen nach einer Lösung, die sofort da ist. Kein Termin, kein Weg, kein Aufwand. Genau dafür ist BODYTIME concept gemacht.
          </p>
        </div>

        {/* ── Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOLUTIONS.map((item, i) => {
            const { Icon } = item;
            return (
              <div
                key={item.wenn}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="relative flex items-center"
              >
                {/* Circle — fixed size per breakpoint = always a perfect circle */}
                <div className="relative flex-shrink-0 z-10 w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] lg:w-[110px] lg:h-[110px]">
                  {/* Glow */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${item.glow} 0%, transparent 70%)`,
                      filter: 'blur(14px)',
                      transform: 'scale(1.5)',
                    }}
                  />
                  {/* Circle */}
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                      background: item.gradient,
                      boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.10)`,
                    }}
                  >
                    <Icon className="absolute text-white w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 z-0" strokeWidth={1.5} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.wenn}
                      className="absolute inset-0 w-full h-full object-cover z-10"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </div>

                {/* Card — overlaps circle by half, margin/padding scale with circle */}
                <div
                  className="flex-1 flex flex-col justify-center gap-1.5 sm:gap-2 rounded-2xl py-4 pr-4 sm:py-5 sm:pr-5 min-w-0
                    -ml-9 pl-[48px]
                    sm:-ml-11 sm:pl-[58px]
                    lg:-ml-[55px] lg:pl-[72px]"
                  style={{
                    background: '#ffffff',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  }}
                >
                  <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: '#07C8DB' }}>
                    Wenn
                  </p>
                  <p className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold leading-snug" style={{ color: '#0f172a' }}>
                    {item.wenn}
                  </p>
                  <p className="text-[12px] sm:text-[13px] leading-relaxed" style={{ color: '#64748b' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
