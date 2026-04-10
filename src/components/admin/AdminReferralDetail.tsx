'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  updateReferralStatusAction,
  addReferralNoteAction,
  updateReferralNoteAction,
  deleteReferralNoteAction,
} from '@/actions/referrals';

const STATUSES = [
  {
    value: 'eingegangen',
    label: 'Eingegangen',
    variant: 'neutral' as const,
    activeClass: 'bg-gray-100 border-gray-300 text-gray-800',
    dotClass: 'bg-gray-400',
  },
  {
    value: 'in_bearbeitung',
    label: 'In Bearbeitung',
    variant: 'info' as const,
    activeClass: 'bg-blue-50 border-blue-300 text-blue-800',
    dotClass: 'bg-blue-500',
  },
  {
    value: 'gewonnen',
    label: 'Gewonnen',
    variant: 'success' as const,
    activeClass: 'bg-green-50 border-green-300 text-green-800',
    dotClass: 'bg-green-500',
  },
  {
    value: 'kein_interesse',
    label: 'Kein Interesse',
    variant: 'danger' as const,
    activeClass: 'bg-red-50 border-red-300 text-red-800',
    dotClass: 'bg-red-400',
  },
] as const;

type StatusValue = typeof STATUSES[number]['value'];

interface ReferralNote {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Referral {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  partner: { id: string; first_name: string; last_name: string; email: string } | null;
}

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export default function AdminReferralDetail({
  referral,
  notes: initialNotes,
}: {
  referral: Referral;
  notes: ReferralNote[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentStatus = STATUSES.find(s => s.value === referral.status) ?? STATUSES[0];

  // Notes state
  const [newNote, setNewNote] = useState('');
  const [isAdding, startAddTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, startEditTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingNote, startDeleteTransition] = useTransition();

  const updateStatus = (status: StatusValue) => {
    startTransition(async () => {
      const result = await updateReferralStatusAction(referral.id, status);
      if (result.success) {
        toast.success('Status aktualisiert');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    startAddTransition(async () => {
      const result = await addReferralNoteAction(referral.id, newNote);
      if (result.success) {
        toast.success('Notiz hinzugefügt');
        setNewNote('');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleSaveEdit = (noteId: string) => {
    startEditTransition(async () => {
      const result = await updateReferralNoteAction(noteId, referral.id, editContent);
      if (result.success) {
        toast.success('Notiz aktualisiert');
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleDelete = (noteId: string) => {
    setDeletingId(noteId);
    startDeleteTransition(async () => {
      const result = await deleteReferralNoteAction(noteId, referral.id);
      if (result.success) {
        toast.success('Notiz gelöscht');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {referral.first_name} {referral.last_name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Eingegangen am {formatDate(referral.created_at)}
          </p>
        </div>
        <Badge variant={currentStatus.variant}>{currentStatus.label}</Badge>
      </div>

      {/* Status ändern — ganz oben */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Status ändern</CardTitle>
            {referral.updated_at !== referral.created_at && (
              <span className="text-xs text-gray-400">
                Zuletzt geändert: {formatDate(referral.updated_at)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => {
              const isActive = s.value === referral.status;
              return (
                <button
                  key={s.value}
                  disabled={isPending || isActive}
                  onClick={() => updateStatus(s.value)}
                  className={[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all',
                    isActive
                      ? `${s.activeClass} cursor-default shadow-sm`
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40',
                  ].join(' ')}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? s.dotClass : 'bg-gray-300'}`} />
                  {s.label}
                </button>
              );
            })}
          </div>
          {isPending && (
            <p className="text-xs text-gray-400 mt-3">Wird gespeichert…</p>
          )}
        </CardContent>
      </Card>

      {/* Empfohlene Person */}
      <Card>
        <CardHeader><CardTitle>Empfohlene Person</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Vorname',    referral.first_name],
            ['Nachname',   referral.last_name],
            ['E-Mail',     referral.email || '—'],
            ['Telefon',    referral.phone],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-500 text-xs mb-0.5">{label}</p>
              <p className="text-gray-900 font-medium">{value}</p>
            </div>
          ))}
          {referral.note && (
            <div className="sm:col-span-2">
              <p className="text-gray-500 text-xs mb-0.5">Bemerkung vom Partner</p>
              <p className="text-gray-900 whitespace-pre-wrap">{referral.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empfohlen von */}
      <Card>
        <CardHeader><CardTitle>Empfohlen von</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {referral.partner ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">
                  {referral.partner.first_name} {referral.partner.last_name}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{referral.partner.email}</p>
              </div>
              <Link
                href={`/admin/partners/${referral.partner.id}`}
                className="text-sm text-gray-500 hover:text-gray-900 hover:underline"
              >
                Partner ansehen →
              </Link>
            </div>
          ) : (
            <p className="text-gray-400">Kein Partner zugeordnet</p>
          )}
        </CardContent>
      </Card>

      {/* Interne Notizen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Interne Notizen</CardTitle>
            <span className="text-xs text-gray-400 font-normal">(nur für Admins sichtbar)</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Neue Notiz */}
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              rows={3}
              placeholder="Neue Notiz hinzufügen…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={isAdding || !newNote.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                {isAdding ? 'Wird hinzugefügt…' : 'Notiz hinzufügen'}
              </Button>
            </div>
          </div>

          {/* Notizen-Liste */}
          {initialNotes.length > 0 && (
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {initialNotes.map(note => (
                <div key={note.id} className="py-3">
                  {editingId === note.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          disabled={isSavingEdit}
                        >
                          Abbrechen
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(note.id)}
                          disabled={isSavingEdit || !editContent.trim()}
                        >
                          {isSavingEdit ? 'Speichern…' : 'Speichern'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <p className="flex-1 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        <button
                          onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Bearbeiten"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={isDeletingNote && deletingId === note.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          title="Löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {editingId !== note.id && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {formatDateTime(note.created_at)}
                      {note.updated_at !== note.created_at && ' · bearbeitet'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {initialNotes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Noch keine Notizen vorhanden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
