'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { updatePartnerNotesAction } from '@/actions/admin-partners';

interface PartnerNotesProps {
  partnerId: string;
  initialNotes: string | null;
}

export default function PartnerNotes({ partnerId, initialNotes }: PartnerNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saved, setSaved] = useState(initialNotes ?? '');
  const [isPending, startTransition] = useTransition();

  const isDirty = notes !== saved;

  function handleSave() {
    startTransition(async () => {
      const result = await updatePartnerNotesAction(partnerId, notes);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setSaved(notes);
        toast.success('Notiz gespeichert.');
      }
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Interne Notizen zum Partner …"
        className="min-h-[120px] text-sm"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Nur für Admins sichtbar.</p>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Speichern
        </button>
      </div>
    </div>
  );
}
