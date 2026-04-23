'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { renewContractAction, addCrmNoteAction, deleteCrmNoteAction } from '@/actions/customers';
import { renewalSchema, type RenewalInput } from '@/lib/validations/customer';
import { formatDate } from '@/lib/utils';

const changeTypeLabel: Record<string, string> = {
  initial: 'Erstbestellung',
  renewal: 'Verlängerung',
  modification: 'Änderung',
};

export default function CustomerDetailClient({ customer, history, notes, readOnly = false }: {
  customer: any;
  history: any[];
  notes: any[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RenewalInput>({
    resolver: zodResolver(renewalSchema),
    defaultValues: { rental_duration_months: customer.rental_duration_months },
  });

  const onRenew = (data: RenewalInput) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('order_date', data.order_date);
      fd.append('rental_duration_months', String(data.rental_duration_months));
      if (data.change_notes) fd.append('change_notes', data.change_notes);
      const result = await renewContractAction(customer.id, fd);
      if (result.success) {
        toast.success('Vertrag verlängert');
        setRenewalOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append('note', noteText.trim());
      const result = await addCrmNoteAction(customer.id, fd);
      if (result.success) {
        setNoteText('');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  };

  const handleDeleteNote = (noteId: string) => {
    startTransition(async () => {
      const result = await deleteCrmNoteAction(noteId, customer.id);
      if (result.success) router.refresh();
      else toast.error(result.error ?? 'Fehler');
    });
  };

  return (
    <div className="space-y-4">
      {/* Persönliche Daten */}
      <Card>
        <CardHeader><CardTitle>Persönliche Daten</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Anrede', customer.salutation || '—'],
            ['Vorname', customer.first_name],
            ['Nachname', customer.last_name],
            ['Geburtsdatum', formatDate(customer.birth_date)],
            ['E-Mail', customer.email],
            ['Telefon', customer.phone || '—'],
            ['Adresse', [customer.address_street, customer.address_zip, customer.address_city].filter(Boolean).join(', ') || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-500 text-xs mb-0.5">{label}</p>
              <p className="text-gray-900 font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vertrag */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vertrag</CardTitle>
            {!readOnly && (
              <Button size="sm" onClick={() => setRenewalOpen(true)}>
                <RefreshCw className="h-3.5 w-3.5" /> Verlängern
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Bestellnummer', customer.order_number || '—'],
            ['Bestelldatum', formatDate(customer.order_date)],
            ['Laufzeit', `${customer.rental_duration_months} Monate`],
            ['Vertragsende', formatDate(customer.contract_end_date)],
            ['EMS-Anzug', customer.ems_suit_type || '—'],
            ['Größe Oberteil', customer.size_top || '—'],
            ['Größe Hose', customer.size_pants || '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-gray-500 text-xs mb-0.5">{label}</p>
              <p className="text-gray-900 font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Vertragsverlauf */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Vertragsverlauf</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry: any, i: number) => (
                <div key={entry.id} className={`flex gap-4 pb-3 ${i < history.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={entry.change_type === 'renewal' ? 'success' : entry.change_type === 'initial' ? 'info' : 'neutral'}>
                        {changeTypeLabel[entry.change_type] ?? entry.change_type}
                      </Badge>
                      <span className="text-gray-400 text-xs">{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="text-gray-700">
                      Bestelldatum: {formatDate(entry.order_date)} · Laufzeit: {entry.rental_duration_months} Mon. · Ende: {formatDate(entry.contract_end_date)}
                    </p>
                    {entry.change_notes && <p className="text-gray-500 mt-0.5 text-xs">{entry.change_notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bemerkungen */}
      {customer.notes && (
        <Card>
          <CardHeader><CardTitle>Bemerkungen</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</p></CardContent>
        </Card>
      )}

      {/* CRM-Notizen */}
      {(!readOnly || notes.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notizen</CardTitle>
              <span className="text-xs text-gray-400">{notes.length} Eintr{notes.length === 1 ? 'ag' : 'äge'}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add note – only for partners */}
            {!readOnly && (
              <div className="flex gap-3">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote(); }}
                  placeholder="Neue Notiz hinzufügen… (⌘+Enter zum Speichern)"
                  rows={2}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                />
                <Button onClick={handleAddNote} disabled={!noteText.trim() || isPending} className="self-end" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Notes list */}
            {notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Noch keine Notizen vorhanden.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((note: any) => (
                  <div key={note.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{formatDate(note.created_at)}</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Renewal Dialog */}
      <Dialog open={renewalOpen} onOpenChange={setRenewalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertrag verlängern</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onRenew)} className="space-y-4 mt-4">
            <Input label="Neues Bestelldatum / Verlängerungsdatum" type="date" required {...register('order_date')} error={errors.order_date?.message} />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Neue Laufzeit <span className="text-red-500">*</span></label>
              <Select defaultValue={String(customer.rental_duration_months)} onValueChange={v => setValue('rental_duration_months', Number(v) as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Monate</SelectItem>
                  <SelectItem value="6">6 Monate</SelectItem>
                  <SelectItem value="12">12 Monate</SelectItem>
                  <SelectItem value="24">24 Monate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea label="Notiz zur Verlängerung (optional)" {...register('change_notes')} rows={2} />
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setRenewalOpen(false)}>Abbrechen</Button>
              <Button type="submit" loading={isPending}>Verlängerung speichern</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
