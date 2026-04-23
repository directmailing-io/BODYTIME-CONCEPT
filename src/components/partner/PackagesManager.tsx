'use client';
import { useState, useTransition } from 'react';
import { Plus, Trash2, Pencil, Package, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { upsertPackageAction, deletePackageAction, type PackageItemInput } from '@/actions/partner-packages';

interface PackageItem {
  id: string;
  name: string;
  billing_type: 'once' | 'monthly';
  amount: number;
  sort_order: number;
}

interface Package {
  id: string;
  name: string;
  bt_package_items: PackageItem[];
}

function formatEur(amount: number) {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

const billingLabel = { once: 'einmalig', monthly: 'monatlich' };

export default function PackagesManager({ initialPackages }: { initialPackages: Package[] }) {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [pkgName, setPkgName] = useState('');
  const [items, setItems] = useState<PackageItemInput[]>([]);

  function openCreate() {
    setEditingPackage(null);
    setPkgName('');
    setItems([]);
    setDialogOpen(true);
  }

  function openEdit(pkg: Package) {
    setEditingPackage(pkg);
    setPkgName(pkg.name);
    setItems(pkg.bt_package_items.map(i => ({ id: i.id, name: i.name, billing_type: i.billing_type, amount: i.amount, sort_order: i.sort_order })));
    setDialogOpen(true);
  }

  function addItem() {
    setItems(prev => [...prev, { name: '', billing_type: 'monthly', amount: 0, sort_order: prev.length }]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof PackageItemInput, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function handleSave() {
    if (!pkgName.trim()) { toast.error('Bitte einen Paketnamen eingeben.'); return; }
    startTransition(async () => {
      const result = await upsertPackageAction({
        id: editingPackage?.id,
        name: pkgName.trim(),
        items: items.filter(i => i.name.trim()),
      });
      if (result.success) {
        toast.success(editingPackage ? 'Paket aktualisiert' : 'Paket erstellt');
        setDialogOpen(false);
        // Reload — server revalidates
        window.location.reload();
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  }

  function handleDelete(pkg: Package) {
    if (!confirm(`Paket "${pkg.name}" wirklich löschen?`)) return;
    startTransition(async () => {
      const result = await deletePackageAction(pkg.id);
      if (result.success) {
        setPackages(prev => prev.filter(p => p.id !== pkg.id));
        toast.success('Paket gelöscht');
      } else {
        toast.error(result.error ?? 'Fehler');
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Neues Paket
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Noch keine Pakete vorhanden</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Erstelle dein erstes Preispaket</p>
            <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Paket erstellen</Button>
          </CardContent>
        </Card>
      ) : (
        packages.map(pkg => {
          const pkgItems = pkg.bt_package_items.sort((a, b) => a.sort_order - b.sort_order);
          const monthlyTotal = pkgItems.filter(i => i.billing_type === 'monthly').reduce((s, i) => s + i.amount, 0);
          const onceTotal = pkgItems.filter(i => i.billing_type === 'once').reduce((s, i) => s + i.amount, 0);
          return (
            <Card key={pkg.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{pkg.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {onceTotal > 0 && <span>{formatEur(onceTotal)} einmalig · </span>}
                      {monthlyTotal > 0 && <span>{formatEur(monthlyTotal)}/Monat</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(pkg)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(pkg)} className="text-red-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {pkgItems.length === 0 ? (
                  <p className="text-xs text-gray-400">Keine Preisposten</p>
                ) : (
                  <div className="space-y-1.5">
                    {pkgItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{formatEur(item.amount)}</span>
                          <Badge variant="neutral" className="text-xs">{billingLabel[item.billing_type]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPackage ? 'Paket bearbeiten' : 'Neues Paket erstellen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              label="Paketname"
              placeholder="z. B. Figurpaket"
              value={pkgName}
              onChange={e => setPkgName(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Preisposten</label>
                <Button size="sm" variant="outline" onClick={addItem} type="button">
                  <Plus className="h-3.5 w-3.5" /> Posten hinzufügen
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                    {/* Row 1: Name (full width) */}
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
                    {/* Row 2: Billing type + Amount */}
                    <div className="flex gap-2 items-center">
                      <Select value={item.billing_type} onValueChange={v => updateItem(idx, 'billing_type', v)}>
                        <SelectTrigger className="w-36 flex-shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">einmalig</SelectItem>
                          <SelectItem value="monthly">monatlich</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* Amount with € suffix */}
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
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center">
                    <p className="text-xs text-gray-400">Noch keine Posten – klicke auf &quot;Posten hinzufügen&quot;</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSave} loading={isPending}>
                <Check className="h-4 w-4" /> Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
