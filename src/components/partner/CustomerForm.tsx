'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCustomerAction, updateCustomerAction } from '@/actions/customers';
import { customerSchema, type CustomerInput } from '@/lib/validations/customer';
import type { ClothingSize, RentalDuration } from '@/types';

// ---- Constants ----

const SALUTATIONS = ['Herr', 'Frau', 'Divers'] as const;
const RENTAL_DURATIONS: RentalDuration[] = [3, 6, 12, 24];
const CLOTHING_SIZES: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL'];

// ---- Props ----

interface CustomerFormProps {
  initialValues?: Partial<CustomerInput>;
  customerId?: string;
  onSuccess?: (id: string) => void;
}

// ---- Field wrapper ----

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ---- Component ----

export function CustomerForm({ initialValues, customerId, onSuccess }: CustomerFormProps) {
  const isEditing = Boolean(customerId);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      salutation: initialValues?.salutation ?? null,
      first_name: initialValues?.first_name ?? '',
      last_name: initialValues?.last_name ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
      birth_date: initialValues?.birth_date ?? '',
      address_street: initialValues?.address_street ?? '',
      address_zip: initialValues?.address_zip ?? '',
      address_city: initialValues?.address_city ?? '',
      order_date: initialValues?.order_date ?? '',
      rental_duration_months: initialValues?.rental_duration_months ?? 12,
      ems_suit_type: initialValues?.ems_suit_type ?? '',
      size_top: initialValues?.size_top ?? null,
      size_pants: initialValues?.size_pants ?? null,
      notes: initialValues?.notes ?? '',
    },
  });

  const watchedSalutation = watch('salutation');
  const watchedDuration = watch('rental_duration_months');
  const watchedSizeTop = watch('size_top');
  const watchedSizePants = watch('size_pants');

  const onSubmit = (data: CustomerInput) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.set(key, String(value));
        }
      });

      if (isEditing && customerId) {
        const result = await updateCustomerAction(customerId, formData);
        if (result.success) {
          toast.success('Kundendaten wurden gespeichert.');
          onSuccess?.(customerId);
        } else {
          toast.error(result.error ?? 'Ein Fehler ist aufgetreten.');
        }
      } else {
        const result = await createCustomerAction(formData);
        if (result.success && result.data) {
          toast.success('Kunde wurde angelegt.');
          onSuccess?.(result.data.id);
        } else {
          toast.error(result.error ?? 'Ein Fehler ist aufgetreten.');
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Persönliche Daten */}
      <Card>
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Salutation */}
          <Field label="Anrede" error={errors.salutation?.message}>
            <Select
              value={watchedSalutation ?? ''}
              onValueChange={(v) =>
                setValue('salutation', v === '__none__' ? null : (v as 'Herr' | 'Frau' | 'Divers'), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Keine Angabe</SelectItem>
                {SALUTATIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Spacer on desktop */}
          <div className="hidden sm:block" />

          {/* First name */}
          <Field label="Vorname" required error={errors.first_name?.message}>
            <Input {...register('first_name')} placeholder="Max" />
          </Field>

          {/* Last name */}
          <Field label="Nachname" required error={errors.last_name?.message}>
            <Input {...register('last_name')} placeholder="Mustermann" />
          </Field>

          {/* Birth date */}
          <Field label="Geburtsdatum" error={errors.birth_date?.message}>
            <Input {...register('birth_date')} type="date" />
          </Field>
        </CardContent>
      </Card>

      {/* Section 2: Kontakt */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakt</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="E-Mail-Adresse" required error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="max@example.com" />
          </Field>

          <Field label="Telefon" error={errors.phone?.message}>
            <Input {...register('phone')} type="tel" placeholder="+49 170 1234567" />
          </Field>

          <Field label="Straße & Hausnummer" error={errors.address_street?.message} >
            <Input {...register('address_street')} placeholder="Musterstr. 1" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="PLZ" error={errors.address_zip?.message}>
              <Input {...register('address_zip')} placeholder="12345" />
            </Field>
            <Field label="Ort" error={errors.address_city?.message}>
              <Input {...register('address_city')} placeholder="Berlin" />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Vertrag */}
      <Card>
        <CardHeader>
          <CardTitle>Vertrag</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bestelldatum" required error={errors.order_date?.message}>
            <Input {...register('order_date')} type="date" />
          </Field>

          <Field label="Laufzeit" required error={errors.rental_duration_months?.message}>
            <Select
              value={String(watchedDuration)}
              onValueChange={(v) =>
                setValue('rental_duration_months', Number(v) as RentalDuration, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Laufzeit wählen" />
              </SelectTrigger>
              <SelectContent>
                {RENTAL_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} Monate
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="EMS-Suit-Typ" error={errors.ems_suit_type?.message}>
            <Input {...register('ems_suit_type')} placeholder="z.B. Miha Bodytec II" />
          </Field>

          {/* Spacer */}
          <div className="hidden sm:block" />

          <Field label="Größe Oberteil" error={errors.size_top?.message}>
            <Select
              value={watchedSizeTop ?? ''}
              onValueChange={(v) =>
                setValue('size_top', v === '__none__' ? null : (v as ClothingSize), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Größe wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Keine Angabe</SelectItem>
                {CLOTHING_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Größe Hose" error={errors.size_pants?.message}>
            <Select
              value={watchedSizePants ?? ''}
              onValueChange={(v) =>
                setValue('size_pants', v === '__none__' ? null : (v as ClothingSize), {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Größe wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Keine Angabe</SelectItem>
                {CLOTHING_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* Section 4: Bemerkungen */}
      <Card>
        <CardHeader>
          <CardTitle>Bemerkungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Notizen" error={errors.notes?.message}>
            <Textarea
              {...register('notes')}
              placeholder="Interne Notizen zum Kunden…"
              rows={4}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pb-6">
        <Button asChild variant="outline" type="button">
          <Link href={customerId ? `/partner/customers/${customerId}` : '/partner/customers'}>
            Abbrechen
          </Link>
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? 'Änderungen speichern' : 'Kunde anlegen'}
        </Button>
      </div>
    </form>
  );
}
