'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { updateCustomerAction } from '@/actions/customers';
import { customerSchema, type CustomerInput } from '@/lib/validations/customer';

export default function CustomerEditForm({ customer }: { customer: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      salutation: customer.salutation,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone ?? '',
      birth_date: customer.birth_date ?? '',
      address_street: customer.address_street ?? '',
      address_zip: customer.address_zip ?? '',
      address_city: customer.address_city ?? '',
      order_date: customer.order_date,
      rental_duration_months: customer.rental_duration_months,
      ems_suit_type: customer.ems_suit_type ?? '',
      size_top: customer.size_top,
      size_pants: customer.size_pants,
      notes: customer.notes ?? '',
      order_number: customer.order_number ?? '',
    }
  });

  const onSubmit = (data: CustomerInput) => {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v != null) fd.append(k, String(v)); });
      const result = await updateCustomerAction(customer.id, fd);
      if (result.success) {
        toast.success('Kundendaten gespeichert');
        router.push(`/partner/customers/${customer.id}`);
      } else {
        toast.error(result.error ?? 'Fehler beim Speichern');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Persönliche Daten</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Anrede</label>
            <Select defaultValue={customer.salutation ?? ''} onValueChange={v => setValue('salutation', v as any)}>
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
          <Input label="Telefon" {...register('phone')} error={errors.phone?.message} />
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
          <Input label="Art des EMS-Anzugs" {...register('ems_suit_type')} />
          <div />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Größe Oberteil</label>
            <Select defaultValue={customer.size_top ?? ''} onValueChange={v => setValue('size_top', v as any)}>
              <SelectTrigger><SelectValue placeholder="Größe wählen" /></SelectTrigger>
              <SelectContent>{['XS','S','M','L','XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Größe Hose</label>
            <Select defaultValue={customer.size_pants ?? ''} onValueChange={v => setValue('size_pants', v as any)}>
              <SelectTrigger><SelectValue placeholder="Größe wählen" /></SelectTrigger>
              <SelectContent>{['XS','S','M','L','XL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bemerkungen</CardTitle></CardHeader>
        <CardContent>
          <Textarea label="Sonstige Bemerkungen" {...register('notes')} rows={4} />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" asChild>
          <Link href={`/partner/customers/${customer.id}`}>Abbrechen</Link>
        </Button>
        <Button type="submit" loading={isPending}>Änderungen speichern</Button>
      </div>
    </form>
  );
}
