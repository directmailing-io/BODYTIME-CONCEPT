'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Phone, Mail, ArrowLeft } from 'lucide-react';

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#25A8E0', '#2563EB', '#60C8F0', '#ffffff', '#f0f9ff', '#FBBF24', '#34D399'];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  size: number; color: string;
  shape: 'rect' | 'circle';
  opacity: number;
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn particles
    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.15,
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    }));

    let startTime = Date.now();
    let raf: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const elapsed = (Date.now() - startTime) / 1000;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        p.vy += 0.06; // gravity
        p.vx *= 0.998;
        if (elapsed > 2.5) p.opacity = Math.max(0, p.opacity - 0.012);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < 5) {
        raf = requestAnimationFrame(draw);
      }
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DankePage() {
  const params = useSearchParams();
  const type = params.get('type') === 'b2b' ? 'b2b' : 'b2c';

  const isB2B = type === 'b2b';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 text-center"
      style={{ background: isB2B ? '#0F172A' : '#f8fafc' }}
    >
      <Confetti />

      <div
        className="relative z-10 max-w-lg w-full rounded-3xl border p-8 sm:p-12 shadow-xl"
        style={{
          background: isB2B ? 'rgba(255,255,255,0.04)' : '#ffffff',
          borderColor: isB2B ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
        }}
      >
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(37,168,224,0.15) 0%, rgba(37,99,235,0.15) 100%)' }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: '#25A8E0' }} />
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4"
          style={{ color: isB2B ? '#ffffff' : '#1d1d1f' }}
        >
          Anfrage eingegangen! 🎉
        </h1>

        <p
          className="text-lg leading-relaxed mb-8"
          style={{ color: isB2B ? 'rgba(255,255,255,0.6)' : '#6b7280' }}
        >
          Vielen Dank für dein Interesse. Wir haben deine Anfrage erhalten und melden uns schnellstmöglich bei dir.
        </p>

        {/* What happens next */}
        <div
          className="rounded-2xl p-5 text-left mb-8 space-y-4"
          style={{
            background: isB2B ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            border: `1px solid ${isB2B ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: isB2B ? 'rgba(255,255,255,0.7)' : '#374151' }}>
            Was passiert als nächstes?
          </p>

          <div className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,168,224,0.15)', color: '#25A8E0' }}
            >
              <Phone className="w-3.5 h-3.5" />
            </span>
            <p className="text-sm leading-relaxed" style={{ color: isB2B ? 'rgba(255,255,255,0.55)' : '#6b7280' }}>
              Wir melden uns in der Regel <strong style={{ color: isB2B ? 'rgba(255,255,255,0.8)' : '#1d1d1f' }}>innerhalb von 24 Stunden telefonisch</strong> bei dir.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,168,224,0.15)', color: '#25A8E0' }}
            >
              <Mail className="w-3.5 h-3.5" />
            </span>
            <p className="text-sm leading-relaxed" style={{ color: isB2B ? 'rgba(255,255,255,0.55)' : '#6b7280' }}>
              Unter Umständen kontaktieren wir dich auch <strong style={{ color: isB2B ? 'rgba(255,255,255,0.8)' : '#1d1d1f' }}>per E-Mail</strong>. Bitte schau auch kurz in deinen{' '}
              <strong style={{ color: isB2B ? 'rgba(255,255,255,0.8)' : '#1d1d1f' }}>Spam-Ordner</strong>, falls du nichts von uns hörst.
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={isB2B ? '/b2b' : '/'}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: isB2B ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
            color: isB2B ? 'rgba(255,255,255,0.7)' : '#374151',
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur {isB2B ? 'Partner-' : ''}Startseite
        </Link>
      </div>
    </div>
  );
}
