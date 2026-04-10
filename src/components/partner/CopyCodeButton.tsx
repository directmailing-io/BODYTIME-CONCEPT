'use client';
import { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code kopiert!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
    >
      {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Kopiert!' : 'Kopieren'}
    </button>
  );
}
