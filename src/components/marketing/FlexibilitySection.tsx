'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ALL_LOCATIONS = [
  {
    image: '/locations/wohnzimmer.jpg',
    imageAlt: 'EMS Training zuhause im Wohnzimmer',
    title: 'Zuhause im Wohnzimmer',
    desc: 'Der Klassiker. Anzug an, App auf, loslegen. Kein Weg, kein Termin, keine Ausrede.',
  },
  {
    image: '/locations/garten.jpg',
    imageAlt: 'EMS Training im Garten',
    title: 'Garten oder Terrasse',
    desc: 'Frische Luft, Sonnenschein, 20 Minuten. Training und Natur schließen sich nicht aus.',
  },
  {
    image: '/locations/hotel.jpg',
    imageAlt: 'EMS Training im Hotelzimmer',
    title: 'Hotelzimmer auf Geschäftsreise',
    desc: 'Kein Gym im Hotel? Kein Problem. Mit dem EMS-Suit trainierst du auf jedem Quadratmeter.',
  },
  {
    image: '/locations/raststaette.jpg',
    imageAlt: 'EMS Training an der Raststätte',
    title: 'Pause an der Raststätte',
    desc: 'Lange Fahrt? 20 Minuten Pause clever nutzen und erfrischt weiterfahren.',
  },
  {
    image: '/locations/urlaub.jpg',
    imageAlt: 'EMS Training im Urlaub',
    title: 'Im Urlaub',
    desc: 'Ob Strandapartment, Bergchalet oder Stadthotel. Dein Training kommt überall mit.',
  },
  {
    image: '/locations/freunde.jpg',
    imageAlt: 'EMS Training mit Freunden',
    title: 'Mit Freunden',
    desc: 'Verabredet euch bei jemandem zuhause, im Park oder draußen. Kein Terminstress.',
  },
  {
    image: '/locations/homeoffice.jpg',
    imageAlt: 'EMS Training im Homeoffice',
    title: 'Im Homeoffice',
    desc: 'Mittagspause effektiv genutzt. 20 Minuten zwischen zwei Meetings reichen.',
  },
  {
    image: '/locations/park.jpg',
    imageAlt: 'EMS Training draußen im Park',
    title: 'Draußen im Park',
    desc: 'Frische Luft und intensives Training kombinieren. Mobil, flexibel, überall.',
  },
  {
    image: '/locations/balkon.jpg',
    imageAlt: 'EMS Training auf dem Balkon',
    title: 'Auf dem Balkon',
    desc: 'Stadtluft, Sonnenuntergang und dein persönliches Outdoor-Studio. Direkt vor deiner Tür.',
  },
  {
    image: '/locations/wohnmobil.jpg',
    imageAlt: 'EMS Training im Wohnmobil',
    title: 'Im Wohnmobil auf Tour',
    desc: 'Roadtrip und fit bleiben. Dein Camper wird gleichzeitig zum Gym.',
  },
  {
    image: '/locations/huette.jpg',
    imageAlt: 'EMS Training auf der Berghütte',
    title: 'Auf der Berghütte',
    desc: 'Nach der Wanderung noch eine Session. Berge, Natur und 20 Minuten EMS.',
  },
  {
    image: '/locations/strand.jpg',
    imageAlt: 'EMS Training am Strand',
    title: 'Direkt am Strand',
    desc: 'Morgens trainieren bevor andere aufwachen. Das Meer als Kulisse inklusive.',
  },
];

// First 8 cards fully visible on desktop, next 6 fade out
const VISIBLE_COUNT = 8;

function LocationCard({
  loc,
  cardRef,
}: {
  loc: typeof ALL_LOCATIONS[0];
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: 0, // GSAP will animate this
      }}
    >
      <div className="relative w-full aspect-video bg-white/5 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={loc.image}
          alt={loc.imageAlt}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-semibold text-white mb-1.5 leading-snug">{loc.title}</h3>
        <p className="text-xs text-white/45 leading-relaxed">{loc.desc}</p>
      </div>
    </div>
  );
}

export default function FlexibilitySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Only animate desktop cards (md+); mobile slider cards are always visible
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const cards = (isDesktop
      ? cardRefs.current.slice(0, ALL_LOCATIONS.length)
      : []
    ).filter(Boolean) as HTMLDivElement[];

    if (cards.length === 0) return;

    const anim = gsap.fromTo(
      cards,
      { y: 56, opacity: 0, scale: 0.94 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.75,
        ease: 'back.out(1.6)',
        stagger: 0.07,
        scrollTrigger: {
          trigger: section,
          start: 'top 68%',
          once: true,
        },
      },
    );

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="flexibilitaet"
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #071a24 0%, #080c18 100%)',
        marginTop: '-24px',
        zIndex: 25,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,168,224,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-32">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: '#07C8DB' }}>
            Ortsunabhängig trainieren
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-white leading-tight tracking-tight mb-5">
            <span style={{
              background: 'linear-gradient(90deg, #25A8E0, #07C8DB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Überall
            </span>
            {' '}ist dein Studio.
          </h2>
          <p className="text-base sm:text-lg text-white/55 leading-relaxed font-light">
            Vergiss das klassische Studio mit festen Öffnungszeiten und Anfahrtsweg. Mit BODYTIME concept trainierst du
            wirklich überall — so wie du es noch nie konntest.
          </p>
        </div>

        {/* ── Desktop grid (md+) ───────────────────────────────────────── */}
        <div ref={gridRef} className="hidden md:block relative">
          <div className="grid grid-cols-4 gap-4">
            {ALL_LOCATIONS.map((loc, i) => (
              <LocationCard
                key={loc.title}
                loc={loc}
                cardRef={(el) => { cardRefs.current[i] = el; }}
              />
            ))}
          </div>

          {/* Gradient fade — covers last ~6 cards, suggestion of infinite possibilities */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '62%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(8,12,24,0.55) 35%, rgba(8,12,24,0.85) 60%, #080c18 85%)',
            }}
          />

          {/* Bottom note overlaid on the gradient */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 pointer-events-none">
            <p className="text-base sm:text-lg font-medium text-white/35 tracking-wide">
              Und überall sonst, wo du gerade bist.
            </p>
          </div>
        </div>

        {/* ── Mobile/Tablet horizontal slider (< md) ──────────────────── */}
        <div className="md:hidden">
          {/* Swipe hint */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-white/25 text-xs">←</span>
            <p className="text-xs text-white/30 uppercase tracking-widest">Wischen zum Erkunden</p>
            <span className="text-white/25 text-xs">→</span>
          </div>

          <div
            className="flex gap-3 overflow-x-auto pb-4"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {ALL_LOCATIONS.map((loc, i) => (
              <div
                key={loc.title}
                className="flex-shrink-0 rounded-2xl overflow-hidden"
                style={{
                  width: 'min(78vw, 300px)',
                  scrollSnapAlign: 'start',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                ref={(el) => {
                  // mobile cards also get GSAP refs (shared array, offset by desktop count)
                  cardRefs.current[ALL_LOCATIONS.length + i] = el;
                }}
              >
                <div className="relative w-full aspect-video bg-white/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={loc.image}
                    alt={loc.imageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold text-white mb-1.5 leading-snug">{loc.title}</h3>
                  <p className="text-xs text-white/45 leading-relaxed">{loc.desc}</p>
                </div>
              </div>
            ))}

            {/* End fade card suggesting more */}
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-2xl"
              style={{
                width: '60px',
                scrollSnapAlign: 'start',
                background: 'linear-gradient(135deg, rgba(37,168,224,0.08), rgba(37,99,235,0.04))',
                border: '1px solid rgba(37,168,224,0.12)',
              }}
            >
              <span className="text-white/20 text-2xl">···</span>
            </div>
          </div>

          {/* Scroll progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-full bg-white/20"
                style={{ width: i === 0 ? '16px' : '5px', height: '5px' }}
              />
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
