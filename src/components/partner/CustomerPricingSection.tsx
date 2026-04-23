'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Check, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { saveCustomerPricingAction, type CustomerPriceItemInput } from '@/actions/customer-pricing';

interface PriceItem {
  id: string;
  name: string;
  billing_type: 'once' | 'monthly';
  amount: number;
  package_name?: string | null;
  sort_order: number;
}

interface PaymentEntry {
  id: string;
  due_date: string;
  amount: number;
  description: string;
  billing_type: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string | null;
}

interface PackageTemplate {
  id: string;
  name: string;
  bt_package_items: { name: string; billing_type: 'once' | 'monthly'; amount: number; sort_order: number }[];
}

function formatEur(amount: number) {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatDate(str: string) {
  return new Date(str + 'T00:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CustomerPricingSection({
  customerId,
  priceItems,
  paymentEntries,
  packages,
  rentalDurationMonths,
  readOnly = false,
}: {
  customerId: string;
  priceItems: PriceItem[];
  paymentEntries: PaymentEntry[];
  packages: PackageTemplate[];
  rentalDurationMonths: number;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  // Edit form state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [editItems, setEditItems] = useState<CustomerPriceItemInput[]>([]);

  function openEdit() {
    const packageName = priceItems[0]?.package_name ?? '';
    const matchingPkg = packages.find(p => p.name === packageName);
    setSelectedPackageId(matchingPkg?.id ?? 'custom');
    setEditItems(priceItems.map(i => ({ id: i.id, name: i.name, billing_type: i.billing_type, amount: i.amount, sort_order: i.sort_order })));
    setEditOpen(true);
  }

  function onPackageSelect(pkgId: string) {
    setSelectedPackageId(pkgId);
    if (pkgId === 'custom') return;
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      setEditItems(pkg.bt_package_items.sort((a, b) => a.sort_order - b.sort_order).map((item, i) => ({
        name: item.name, billing_type: item.billing_type, amount: item.amount, sort_order: i,
      })));
    }
  }

  function addItem() {
    setEditItems(prev => [...prev, { name: '', billing_type: 'monthly', amount: 0, sort_order: prev.length }]);
  }

  function removeItem(idx: number) {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof CustomerPriceItemInput, value: string | number) {
    setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function handleSave() {
    startTransition(async () => {
      const pkg = packages.find(p => p.id === selectedPackageId);
      const result = await saveCustomerPricingAction(customerId, {
        packageId: pkg?.id,
        packageName: pkg?.name,
        items: editItems.filter(i => i.name.trim()),
      });
      if (result.success) {
        toast.success('Preise gespeichert');
        setEditOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  }

  // Calculations
  const onceTotal = priceItems.filter(i => i.billing_type === 'once').reduce((s, i) => s + Number(i.amount), 0);
  const monthlyTotal = priceItems.filter(i => i.billing_type === 'monthly').reduce((s, i) => s + Number(i.amount), 0);
  const kundenwert = onceTotal + monthlyTotal * rentalDurationMonths;

  const paidTotal = paymentEntries.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const pendingTotal = paymentEntries.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);

  const today = new Date().toISOString().split('T')[0];
  const sortedEntries = [...paymentEntries].sort((a, b) => a.due_date.localeCompare(b.due_date));
  const visibleEntries = showAllPayments ? sortedEntries : sortedEntries.slice(0, 8);

  return (
    <>
      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preise & Zahlungen</CardTitle>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={openEdit}>
                {priceItems.length > 0 ? 'Bearbeiten' : <><Plus className="h-3.5 w-3.5" /> Paket zuweisen</>}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {priceItems.length === 0 ? (
            <div className="text-center py-6">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Noch kein Paket zugewiesen</p>
              {!readOnly && (
                <Button size="sm" className="mt-3" onClick={openEdit}>
                  <Plus className="h-3.5 w-3.5" /> Paket zuweisen
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Package name */}
              {priceItems[0]?.package_name && (
                <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg w-fit">
                  Paket: {priceItems[0].package_name}
                </p>
              )}

              {/* Price items */}
              <div className="space-y-1.5">
                {priceItems.sort((a, b) => a.sort_order - b.sort_order).map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{formatEur(Number(item.amount))}</span>
                      <Badge variant="neutral" className="text-xs">{item.billing_type === 'once' ? 'einmalig' : '/Monat'}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kundenwert summary */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-gray-50 text-center">
                  <p className="text-xs text-gray-400 mb-0.5">Kundenwert</p>
                  <p className="text-base font-bold text-gray-900">{formatEur(kundenwert)}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 text-center">
                  <p className="text-xs text-green-600 mb-0.5">Bezahlt</p>
                  <p className="text-base font-bold text-green-700">{formatEur(paidTotal)}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 text-center">
                  <p className="text-xs text-amber-600 mb-0.5">Ausstehend</p>
                  <p className="text-base font-bold text-amber-700">{formatEur(pendingTotal)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment timeline */}
      {paymentEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500">Zahlungsplan</CardTitle>
              <span className="text-xs text-gray-300">{paymentEntries.length} Einträge</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-2 px-5">
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
              <div className="space-y-0.5">
                {visibleEntries.map(entry => {
                  const isPast = entry.billing_type === 'once' || entry.due_date <= today;
                  return (
                    <div key={entry.id} className="flex items-start gap-3 py-1.5 relative">
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10 ring-2 ring-white ${
                        isPast ? 'bg-gray-200' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                        <p className={`text-xs truncate ${isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                          {entry.description}
                        </p>
                        <span className={`text-xs font-medium flex-shrink-0 ${isPast ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatEur(Number(entry.amount))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {paymentEntries.length > 8 && (
              <button
                onClick={() => setShowAllPayments(p => !p)}
                className="w-full flex items-center justify-center gap-1 pt-2 pb-1 text-xs text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showAllPayments
                  ? <><ChevronUp className="h-3 w-3" /> Weniger</>
                  : <><ChevronDown className="h-3 w-3" /> Alle {paymentEntries.length} anzeigen</>}
              </button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Pricing Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Paket & Preise bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {packages.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Vorlage wählen</label>
                <Select value={selectedPackageId} onValueChange={onPackageSelect}>
                  <SelectTrigger><SelectValue placeholder="Paket auswählen…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Individuell</SelectItem>
                    {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">Vorlage auswählen füllt die Posten vor – du kannst sie danach anpassen.</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Preisposten</label>
                <Button size="sm" variant="outline" onClick={addItem} type="button">
                  <Plus className="h-3.5 w-3.5" /> Posten
                </Button>
              </div>
              <div className="space-y-2">
                {editItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Postenname (z. B. Onboarding, Service Fee, Beitrag)"
                        value={item.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <button onClick={() => removeItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Select value={item.billing_type} onValueChange={v => updateItem(idx, 'billing_type', v)}>
                        <SelectTrigger className="w-36 flex-shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">einmalig</SelectItem>
                          <SelectItem value="monthly">monatlich</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center flex-1 border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
                        <input
                          type="number"
                          placeholder="0,00"
                          step="0.01"
                          min="0"
                          value={item.amount || ''}
                          onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                          className="flex-1 h-9 px-3 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                        <span className="px-3 text-sm font-medium text-gray-400 bg-gray-50 border-l border-gray-200 h-9 flex items-center">€</span>
                      </div>
                    </div>
                  </div>
                ))}
                {editItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
                    <p className="text-xs text-gray-400">Keine Posten</p>
                  </div>
                )}
              </div>
            </div>

            {editItems.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">
                  Kundenwert: {formatEur(
                    editItems.filter(i => i.billing_type === 'once').reduce((s, i) => s + Number(i.amount), 0) +
                    editItems.filter(i => i.billing_type === 'monthly').reduce((s, i) => s + Number(i.amount), 0) * rentalDurationMonths
                  )} bei {rentalDurationMonths} Monaten Laufzeit
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSave} loading={isPending}><Check className="h-4 w-4" /> Speichern</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
