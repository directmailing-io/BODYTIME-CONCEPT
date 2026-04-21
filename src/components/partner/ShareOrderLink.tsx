'use client';

import { useState } from 'react';
import { Link2, Copy, CheckCheck, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareOrderLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link kopiert!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hier kannst du deinen EMS-Anzug bestellen – Gutschein-Code ist bereits hinterlegt:\n${url}`)}`;

  const displayUrl = url.replace(/^https?:\/\//, '');

  return (
    <div className="rounded-2xl border-2 border-gray-900 bg-gray-900 overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        <div className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center shrink-0">
          <Link2 className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Dein persönlicher Bestelllink</h3>
          <p className="text-xs text-white/50 mt-0.5">Direkt an Kunden schicken — Gutschein-Code automatisch dabei</p>
        </div>
      </div>

      {/* URL display */}
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
          <span className="flex-1 text-xs text-white/70 truncate font-mono">{displayUrl}</span>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-900 hover:bg-gray-100 active:scale-[0.97]'
            }`}
          >
            {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopiert!' : 'Link kopieren'}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#25D366] text-white hover:bg-[#20bf5b] transition-colors active:scale-[0.97]"
          >
            <Send className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
