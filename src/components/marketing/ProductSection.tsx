'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 97;

const FEATURES_LEFT = [
  {
    number: '01',
    title: 'Anatomisch platzierte Elektroden',
    text: '18 Elektroden verteilt auf Brust, Rücken, Bauch, Beine und Gesäß. Keine zufälligen Impulse – sondern gezielte Stimulation genau dort, wo sie wirken soll.',
  },
  {
    number: '02',
    title: 'High-Tech Material',
    text: 'Der Stoff passt sich extrem eng an deinen Körper an – elastisch, formgebend und atmungsaktiv. Die Elektroden sitzen perfekt auf der Haut und verrutschen nicht.',
  },
];

const FEATURES_RIGHT = [
  {
    number: '03',
    title: 'Funktionale Zonen für Komfort und Performance',
    text: 'Elastische, stabilisierende und belüftende Bereiche im Stoff. Der Anzug sitzt stabil und bleibt trotzdem angenehm – auch bei intensiven Sessions.',
  },
  {
    number: '04',
    title: 'Trockene und nasse Nutzung',
    text: 'Dank Silikon-Elektroden kannst du den Anzug ohne Befeuchten nutzen oder klassisch mit Wasser. Flexibler und alltagstauglicher als viele ältere EMS-Systeme.',
  },
];

export default function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameObj = useRef({ frame: 0 });
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [sectionHeight, setSectionHeight] = useState('400vh');

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setSectionHeight('180vh');
      else if (window.innerWidth < 1024) setSectionHeight('280vh');
      else setSectionHeight('400vh');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    let loaded = 0;
    const images: HTMLImageElement[] = [];

    const initAnimations = () => {
      drawFrame(0);

      // Kill only triggers belonging to this section (avoid killing other sections)
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === section || section.contains(t.trigger as Element))
        .forEach((t) => t.kill());

      // Master scrub timeline (total duration = 10 arbitrary units)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
        defaults: { ease: 'power2.out' },
      });

      // Frame scrub — spans entire duration
      tl.to(frameObj.current, {
        frame: TOTAL_FRAMES - 1,
        ease: 'none',
        duration: 10,
        onUpdate: () => drawFrame(Math.round(frameObj.current.frame)),
      }, 0);

      // Feature items fade in sequentially as frames progress
      const positions = [0.8, 3.5, 6.0, 8.2];
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.fromTo(el,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7 },
          positions[i]
        );
      });
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/product-frames/frame_${String(i).padStart(4, '0')}.webp`;
      img.onload = () => {
        loaded++;
        // Draw frame 0 immediately so the canvas isn't blank while loading
        if (loaded === 1) drawFrame(0);
        if (loaded === TOTAL_FRAMES) initAnimations();
      };
      // Count errors so a broken frame doesn't block initAnimations forever
      img.onerror = () => {
        loaded++;
        if (loaded === TOTAL_FRAMES) initAnimations();
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => ScrollTrigger.getAll()
      .filter((t) => t.trigger === section || section.contains(t.trigger as Element))
      .forEach((t) => t.kill());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="produkt"
      className="relative bg-white"
      style={{ height: sectionHeight, borderRadius: '0 0 24px 24px' }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center bg-white">

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8 px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25A8E0] mb-2">
            EMS Trainingsanzug
          </p>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
            Damit jede Anwendung zum Erlebnis wird.
          </h2>
        </div>

        {/* Layout */}
        <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-6">

            {/* Left features — desktop only */}
            <div className="hidden lg:flex flex-col gap-10 w-full max-w-[280px] xl:max-w-[320px] flex-shrink-0">
              {FEATURES_LEFT.map((f, i) => (
                <div
                  key={f.number}
                  ref={(el) => { featureRefs.current[i] = el; }}
                  className="flex flex-col gap-2"
                  style={{ opacity: 0 }}
                >
                  <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{
                    background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{f.number}</span>
                  <h3 className="text-[16px] sm:text-[17px] font-semibold text-gray-900 leading-snug">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>

            {/* Canvas — center with glow */}
            <div className="flex-1 flex items-center justify-center relative w-full">
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 50% 55%, rgba(37,168,224,0.18) 0%, rgba(37,99,235,0.10) 40%, transparent 70%)',
                filter: 'blur(32px)', transform: 'scale(1.4)',
              }} />
              <canvas
                ref={canvasRef}
                width={640}
                height={794}
                className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] xl:max-w-[420px] h-auto"
                style={{ background: 'transparent' }}
              />
            </div>

            {/* Right features — desktop only */}
            <div className="hidden lg:flex flex-col gap-10 w-full max-w-[280px] xl:max-w-[320px] flex-shrink-0">
              {FEATURES_RIGHT.map((f, i) => (
                <div
                  key={f.number}
                  ref={(el) => { featureRefs.current[i + 2] = el; }}
                  className="flex flex-col gap-2 lg:items-end lg:text-right"
                  style={{ opacity: 0 }}
                >
                  <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{
                    background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>{f.number}</span>
                  <h3 className="text-[16px] sm:text-[17px] font-semibold text-gray-900 leading-snug">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Mobile/tablet: feature pills below canvas, inside sticky */}
          <div className="lg:hidden mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto">
            {[...FEATURES_LEFT, ...FEATURES_RIGHT].map((f) => (
              <div
                key={f.number}
                className="flex items-start gap-2.5 rounded-xl px-3 py-3 bg-gray-50 border border-gray-100"
              >
                <span
                  className="text-[10px] font-bold tracking-widest flex-shrink-0 mt-[1px]"
                  style={{
                    background: 'linear-gradient(135deg, #25A8E0 0%, #2563EB 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  {f.number}
                </span>
                <p className="text-[12px] font-semibold text-gray-800 leading-snug">{f.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint — desktop only */}
        <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-35">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">Scrollen</p>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
        </div>
      </div>
    </section>
  );
}
