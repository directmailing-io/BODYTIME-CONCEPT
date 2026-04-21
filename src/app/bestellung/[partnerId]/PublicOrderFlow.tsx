'use client';

import { useState, useRef } from 'react';
import { AlertTriangle, ExternalLink, Venus, Mars, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { createPublicOrderAction } from '@/actions/public-order';

const SHOP_WOMEN = 'https://www.antelope-shop.com/de/p/as0013-mm/';
const SHOP_MEN = 'https://www.antelope-shop.com/de/p/as0014-mm/';
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

function toUtmTerm(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function buildShopUrl(base: string, partnerName: string): string {
  const url = new URL(base);
  url.searchParams.set('utm_source', 'bodytime-concept');
  url.searchParams.set('utm_term', toUtmTerm(partnerName));
  return url.toString();
}

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d')!;
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98FB98'];
  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.3 - canvas.height * 0.3,
    w: Math.random() * 10 + 4,
    h: Math.random() * 6 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: Math.random() * 3 - 1.5,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    rotV: Math.random() * 6 - 3,
    opacity: 1,
  }));
  let frame = 0;
  const total = 220;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (frame > total * 0.7) p.opacity = Math.max(0, 1 - (frame - total * 0.7) / (total * 0.3));
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
    });
    frame++;
    if (frame < total) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

interface Props {
  partnerId: string;
  partnerName: string;
  voucherCode: string;
}

type Step = 'order' | 'form' | 'success';

export default function PublicOrderFlow({ partnerId, partnerName, voucherCode }: Props) {
  const [step, setStep] = useState<Step>('order');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderNumber, setOrderNumber] = useState('');
  const [duration, setDuration] = useState(12);
  const [emsSuit, setEmsSuit] = useState('');
  const [sizeTop, setSizeTop] = useState('');
  const [sizePants, setSizePants] = useState('');

  const womenUrl = buildShopUrl(SHOP_WOMEN, partnerName);
  const menUrl = buildShopUrl(SHOP_MEN, partnerName);

  function copyCode() {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function goToForm() {
    setStep('form');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Bitte Vorname, Nachname und E-Mail ausfüllen.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }
    setIsSaving(true);
    setError('');
    const result = await createPublicOrderAction({
      partnerId,
      first_name: firstName,
      last_name: lastName,
      email,
      order_date: orderDate || undefined,
      rental_duration_months: duration,
      order_number: orderNumber || undefined,
      ems_suit_type: emsSuit || undefined,
      size_top: sizeTop || undefined,
      size_pants: sizePants || undefined,
    });
    setIsSaving(false);
    if (result.success) {
      setStep('success');
      setTimeout(launchConfetti, 300);
    } else {
      setError(result.error ?? 'Fehler beim Speichern.');
    }
  }

  // SUCCESS SCREEN
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <img src="/logo.svg" alt="BODYTIME concept" className="h-12 mx-auto" />
        </div>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Danke für dein Vertrauen!</h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xs">
          <strong className="text-gray-900">{partnerName}</strong> wird sich zeitnah bei dir melden und alles Weitere mit dir besprechen.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="BODYTIME concept" className="h-10 mx-auto mb-4" />
          <p className="text-sm text-gray-400">Empfohlen von <span className="font-medium text-gray-700">{partnerName}</span></p>
        </div>

        <div className="space-y-3">
          {/* Step 1 — Voucher Code */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-amber-200">
              <div className="w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <h3 className="font-bold text-amber-900 text-sm">Gutschein-Code UNBEDINGT eintragen!</h3>
              </div>
            </div>
            <div className="px-4 pb-4 pt-3">
              <p className="text-sm text-amber-800 mb-4 leading-relaxed">
                Trage diesen Code beim Checkout ein. <strong>Ohne diesen Code verlierst du deinen Vorteil!</strong>
              </p>
              <div className="bg-white rounded-xl border border-amber-200 p-4 flex items-center justify-between gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-widest font-mono">{voucherCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    copied ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 — Shop */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <h3 className="font-semibold text-gray-900 text-sm">Produkt auswählen &amp; bestellen</h3>
            </div>
            <div className="px-4 pb-4 pt-3">
              <p className="text-sm text-gray-500 mb-4">Wähle das passende Produkt und schließe die Bestellung im Shop ab.</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={womenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-pink-200 bg-pink-50 hover:bg-pink-100 hover:border-pink-300 transition-colors active:scale-[0.98] text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center">
                    <Venus className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-pink-800 text-sm">Für Frauen</p>
                    <ExternalLink className="h-3 w-3 text-pink-400 mx-auto mt-0.5" />
                  </div>
                </a>
                <a
                  href={menUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-colors active:scale-[0.98] text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <Mars className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Für Männer</p>
                    <ExternalLink className="h-3 w-3 text-blue-400 mx-auto mt-0.5" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Step 3 CTA or Form */}
          {step === 'order' ? (
            <button
              type="button"
              onClick={goToForm}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors active:scale-[0.98]"
            >
              <span>Bestellung abgeschlossen?</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div ref={formRef} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Deine Angaben (optional)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Damit {partnerName} sich bei dir melden kann</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="px-4 pb-5 pt-4 space-y-4">

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Vorname <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Max"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Nachname <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Mustermann"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">E-Mail-Adresse <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="max@beispiel.de"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Divider: optional fields */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-400">Weitere Angaben (optional)</span>
                  </div>
                </div>

                {/* Order date + number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Bestelldatum</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={e => setOrderDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Bestellnummer</label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={e => setOrderNumber(e.target.value)}
                      placeholder="z. B. 12345"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Mietlaufzeit</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 12, 24].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDuration(m)}
                        className={`py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                          duration === m
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {m} Mon.
                      </button>
                    ))}
                  </div>
                </div>

                {/* EMS suit type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Art des EMS-Anzugs</label>
                  <input
                    type="text"
                    value={emsSuit}
                    onChange={e => setEmsSuit(e.target.value)}
                    placeholder="z. B. Ganzkörperanzug"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                {/* Sizes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Größe Oberteil</label>
                    <div className="flex gap-1 flex-wrap">
                      {CLOTHING_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSizeTop(sizeTop === s ? '' : s)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            sizeTop === s
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Größe Hose</label>
                    <div className="flex gap-1 flex-wrap">
                      {CLOTHING_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSizePants(sizePants === s ? '' : s)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            sizePants === s
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60 active:scale-[0.98]"
                >
                  {isSaving ? 'Wird gespeichert…' : 'Angaben absenden'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
