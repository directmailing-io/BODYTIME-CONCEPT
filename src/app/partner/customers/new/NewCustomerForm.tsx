'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Package, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPackageColor } from '@/lib/package-colors';
import { createCustomerAction } from '@/actions/customers';
import { saveCustomerPricingAction, type CustomerPriceItemInput } from '@/actions/customer-pricing';
import { customerSchema, type CustomerInput } from '@/lib/validations/customer';

interface PackageItem {
  id: string;
  name: string;
  billing_type: 'once' | 'monthly';
  amount: number;
  sort_order: number;
}

interface PackageTemplate {
  id: string;
  name: string;
  bt_package_items: PackageItem[];
}

function formatEur(amount: number) {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

export default function NewCustomerForm({ packages }: { packages: PackageTemplate[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPackageId, setSelectedPackageId] = useState<string>('none');
  const [customItems, setCustomItems] = useState<CustomerPriceItemInput[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { rental_duration_months: 12 },
  });

  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const isCustom = selectedPackageId === 'custom';
  const previewItems = selectedPackage
    ? [...selectedPackage.bt_package_items].sort((a, b) => a.sort_order - b.sort_order)
    : [];

  function onPackageChange(value: string) {
    setSelectedPackageId(value);
    if (value === 'custom') {
      setCustomItems([{ name: '', billing_type: 'monthly', amount: 0, sort_order: 0 }]);
    } else {
      setCustomItems([]);
    }
  }

  function addCustomItem() {
    setCustomItems(prev => [...prev, { name: '', billing_type: 'monthly', amount: 0, sort_order: prev.length }]);
  }

  function removeCustomItem(idx: number) {
    setCustomItems(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCustomItem(idx: number, field: keyof CustomerPriceItemInput, value: string | number) {
    setCustomItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  const onSubmit = (data: CustomerInput) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)); });
      const result = await createCustomerAction(fd);
      if (!result.success || !result.data) {
        toast.error(result.error ?? 'Fehler beim Speichern');
        return;
      }

      const customerId = result.data.id;

      if (selectedPackage) {
        await saveCustomerPricingAction(customerId, {
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          items: previewItems.map((item, i) => ({
            name: item.name,
            billing_type: item.billing_type,
            amount: item.amount,
            sort_order: i,
          })),
        });
      } else if (isCustom) {
        const validItems = customItems.filter(i => i.name.trim());
        if (validItems.length > 0) {
          await saveCustomerPricingAction(customerId, { items: validItems });
        }
      }

      toast.success('Kunde erfolgreich angelegt');
      router.push(`/partner/customers/${customerId}`);
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/partner/customers" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Neuen Kunden anlegen</h1>
        <p className="text-sm text-gray-500 mt-1">Manuell erfasst – nur du siehst diese Maske.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Persönliche Daten</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Anrede</label>
              <Select onValueChange={v => setValue('salutation', v as any)}>
                <SelectTrigger><SelectValue placeholder="Anrede wählen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Herr">Herr</SelectItem>
                  <SelectItem value="Frau">Frau</SelectItem>
                  <SelectItem value="Divers">Divers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />
            <Input label="Vorname" required {...register('first_name')} error={errors.first_name?.message} />
            <Input label="Nachname" required {...register('last_name')} error={errors.last_name?.message} />
            <Input label="Geburtsdatum" type="date" {...register('birth_date')} error={errors.birth_date?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Kontakt</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="E-Mail" type="email" required {...register('email')} error={errors.email?.message} className="sm:col-span-2" />
            <Input label="Telefon" type="tel" {...register('phone')} error={errors.phone?.message} />
            <Input label="Straße" {...register('address_street')} error={errors.address_street?.message} />
            <Input label="PLZ" {...register('address_zip')} error={errors.address_zip?.message} />
            <Input label="Stadt" {...register('address_city')} error={errors.address_city?.message} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vertrag & Ausstattung</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Bestellnummer" placeholder="z. B. 12345" {...register('order_number')} error={errors.order_number?.message} className="sm:col-span-2" />
            <Input label="Bestelldatum" type="date" required {...register('order_date')} error={errors.order_date?.message} />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mietlaufzeit <span className="text-red-500">*</span></label>
              <Select defaultValue="12" onValueChange={v => setValue('rental_duration_months', Number(v) as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Monate</SelectItem>
                  <SelectItem value="6">6 Monate</SelectItem>
                  <SelectItem value="12">12 Monate</SelectItem>
                  <SelectItem value="24">24 Monate</SelectItem>
                </SelectContent>
              </Select>
              {errors.rental_duration_months && <p className="text-xs text-red-500 mt-1">{errors.rental_duration_months.message}</p>}
            </div>
            <Input label="Art des EMS-Anzugs" {...register('ems_suit_type')} error={errors.ems_suit_type?.message} />
            <div />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Größe Oberteil</label>
              <Select onValueChange={v => setValue('size_top', v as any)}>
                <SelectTrigger><SelectValue placeholder="Größe wählen" /></SelectTrigger>
                <SelectContent>
                  {['XS','S','M','L','XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Größe Hose</label>
              <Select onValueChange={v => setValue('size_pants', v as any)}>
                <SelectTrigger><SelectValue placeholder="Größe wählen" /></SelectTrigger>
                <SelectContent>
                  {['XS','S','M','L','XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Package assignment – partner only */}
        <Card className="border-blue-100">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <CardTitle>Preispaket</CardTitle>
              <span className="text-xs text-gray-400 font-normal">optional</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPackageId} onValueChange={onPackageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Paket wählen…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Paket</SelectItem>
                <SelectItem value="custom">Individuell</SelectItem>
                {packages.map(p => {
                  const color = getPackageColor(p.id);
                  return (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color.accent }} />
                        {p.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Package preview */}
            {selectedPackage && previewItems.length > 0 && (() => {
              const color = getPackageColor(selectedPackage.id);
              return (
              <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: color.bg, border: `1px solid ${color.accent}30` }}>
                {previewItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{formatEur(item.amount)}</span>
                      <Badge variant="neutral" className="text-xs">
                        {item.billing_type === 'once' ? 'einmalig' : '/Monat'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}

            {/* Custom items editor */}
            {isCustom && (
              <div className="space-y-2">
                {customItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Postenname (z. B. Onboarding, Sondergebühr)"
                        value={item.name}
                        onChange={e => updateCustomItem(idx, 'name', e.target.value)}
                        className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                      <button type="button" onClick={() => removeCustomItem(idx)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Select value={item.billing_type} onValueChange={v => updateCustomItem(idx, 'billing_type', v)}>
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
                          onChange={e => updateCustomItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                          className="flex-1 h-9 px-3 text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                        />
                        <span className="px-3 text-sm font-medium text-gray-400 bg-gray-50 border-l border-gray-200 h-9 flex items-center">€</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={addCustomItem} className="w-full">
                  <Plus className="h-3.5 w-3.5" /> Posten hinzufügen
                </Button>
              </div>
            )}

            {selectedPackageId === 'none' && (
              <p className="text-xs text-gray-400">
                Kein Paket – du kannst es jederzeit in der Kundenansicht nachträglich zuweisen.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bemerkungen</CardTitle></CardHeader>
          <CardContent>
            <Textarea label="Sonstige Bemerkungen" {...register('notes')} rows={4} error={errors.notes?.message} />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/partner/customers">Abbrechen</Link>
          </Button>
          <Button type="submit" loading={isPending}>Kunde anlegen</Button>
        </div>
      </form>
    </div>
  );
}
