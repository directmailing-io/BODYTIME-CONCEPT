'use client';

import { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
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

  const displayUrl = url.replace(/^https?:\/\//, '');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 mb-6">
      <p className="text-xs font-medium text-gray-500 mb-2">Dein Bestelllink für Kunden</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-w-0">
          <span className="text-xs text-gray-600 truncate font-mono block">{displayUrl}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97]'
          }`}
        >
          {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Kopiert' : 'Kopieren'}
        </button>
      </div>
    </div>
  );
}
