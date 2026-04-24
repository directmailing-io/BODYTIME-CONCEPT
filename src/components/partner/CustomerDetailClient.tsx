'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Trash2, RefreshCw, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { renewContractAction, addCrmNoteAction, deleteCrmNoteAction } from '@/actions/customers';
import CustomerPricingSection from './CustomerPricingSection';
import { renewalSchema, type RenewalInput } from '@/lib/validations/customer';
import { formatDate } from '@/lib/utils';

const changeTypeLabel: Record<string, string> = {
  initial: 'Erstbestellung',
  renewal: 'Verlängerung',
  modification: 'Änderung',
};

export default function CustomerDetailClient({ customer, history, notes, priceItems, paymentEntries, packages, readOnly = false }: {
  customer: any;
  history: any[];
  notes: any[];
  priceItems?: any[];
  paymentEntries?: any[];
  packages?: any[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [renewalOpen, setRenewalOpen] = useState(false);
  const [renewalStep, setRenewalStep] = useState<1 | 2>(1);
  const [pendingRenewalData, setPendingRenewalData] = useState<RenewalInput | null>(null);
  const [rechargeOnceItemIds, setRechargeOnceItemIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState('');

  const onceItems = (priceItems ?? []).filter((i: any) => i.billing_type === 'once');
  const monthlyItems = (priceItems ?? []).filter((i: any) => i.billing_type === 'monthly');

  function openRenewal() {
    setRenewalStep(1);
    setPendingRenewalData(null);
    setRechargeOnceItemIds([]);
    setRenewalOpen(true);
  }

  function closeRenewal() {
    setRenewalOpen(false);
    setRenewalStep(1);
    setPendingRenewalData(null);
    setRechargeOnceItemIds([]);
  }

  function toggleRechargeItem(id: string) {
    setRechargeOnceItemIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RenewalInput>({
    resolver: zodResolver(renewalSchema),
    defaultValues: { rental_duration_months: customer.rental_duration_months },
  });

  const onStep1Next = (data: RenewalInput) => {
    setPendingRenewalData(data);
    // If there are once items, show step 2; otherwise submit directly
    if (onceItems.length > 0) {
      setRenewalStep(2);
    } else {
      doRenew(data, []);
    }
  };

  const doRenew = (data: RenewalInput, rechargeIds: string[]) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append('order_date', data.order_date);
      fd.append('rental_duration_months', String(data.rental_duration_months));
      if (data.change_notes) fd.append('change_notes', data.change_notes);
      fd.append('recharge_once_item_ids', JSON.stringify(rechargeIds));
      const result = await renewContractAction(customer.id, fd);
      if (result.success) {
        toast.success('Vertrag verlängert');
        closeRenewal();
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">

      {/* ── Left column: all main cards ── */}
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
                <Button size="sm" onClick={openRenewal}>
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

        {/* Preise & Zahlungen */}
        <CustomerPricingSection
          customerId={customer.id}
          priceItems={priceItems ?? []}
          paymentEntries={paymentEntries ?? []}
          packages={packages ?? []}
          rentalDurationMonths={customer.rental_duration_months ?? 12}
          readOnly={readOnly}
        />

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
      </div>

      {/* ── Right column: Notizen ── */}
      {(!readOnly || notes.length > 0) && (
        <div className="sticky top-24">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notizen</CardTitle>
                <span className="text-xs text-gray-400">{notes.length} Eintr{notes.length === 1 ? 'ag' : 'äge'}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!readOnly && (
                <div className="flex gap-2">
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAddNote(); }}
                    placeholder="Neue Notiz… (⌘+Enter)"
                    rows={3}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                  <Button onClick={handleAddNote} disabled={!noteText.trim() || isPending} className="self-end" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Noch keine Notizen.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note: any) => (
                    <div key={note.id} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 group">
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
        </div>
      )}


      {/* Renewal Dialog */}
      <Dialog open={renewalOpen} onOpenChange={closeRenewal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <DialogTitle>Vertrag verlängern</DialogTitle>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${renewalStep === 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${renewalStep === 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                Vertragsdaten
              </div>
              <div className="flex-1 h-px bg-gray-200 mx-1" />
              <div className={`flex items-center gap-1.5 text-xs font-medium ${renewalStep === 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${renewalStep === 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                Preise
              </div>
            </div>
          </DialogHeader>

          {/* Step 1: Contract data */}
          {renewalStep === 1 && (
            <form onSubmit={handleSubmit(onStep1Next)} className="space-y-4 mt-2">
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
                <Button type="button" variant="outline" onClick={closeRenewal}>Abbrechen</Button>
                <Button type="submit">Weiter <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </form>
          )}

          {/* Step 2: Pricing decisions */}
          {renewalStep === 2 && (
            <div className="space-y-4 mt-2">
              {(priceItems ?? []).length === 0 ? (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500 text-center">
                  Kein Preisplan hinterlegt – Verlängerung läuft ohne Zahlungsplan.
                </div>
              ) : (
                <>
                  {/* Monthly items */}
                  {monthlyItems.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Monatliche Leistungen</p>
                      <div className="space-y-1.5">
                        {monthlyItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between rounded-xl bg-green-50 border border-green-100 px-3 py-2.5">
                            <span className="text-sm text-gray-800">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{Number(item.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}/Mo.</span>
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Wird fortgeführt</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Once items */}
                  {onceItems.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Einmalige Gebühren</p>
                      <p className="text-xs text-gray-400 mb-2">Standardmäßig nicht erneut fällig – aktivieren wenn z. B. ein Upgrade stattfindet.</p>
                      <div className="space-y-1.5">
                        {onceItems.map((item: any) => {
                          const checked = rechargeOnceItemIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleRechargeItem(item.id)}
                              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 transition-colors text-left ${
                                checked
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                                }`}>
                                  {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                </div>
                                <span className={`text-sm ${checked ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>{item.name}</span>
                              </div>
                              <span className={`text-sm font-medium flex-shrink-0 ${checked ? 'text-blue-700' : 'text-gray-400'}`}>
                                {Number(item.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              <p className="text-xs text-gray-400">Für Paketänderungen: nach der Verlängerung im Preisbereich anpassen.</p>

              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => setRenewalStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Zurück
                </Button>
                <Button
                  onClick={() => pendingRenewalData && doRenew(pendingRenewalData, rechargeOnceItemIds)}
                  loading={isPending}
                >
                  Verlängerung speichern
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
