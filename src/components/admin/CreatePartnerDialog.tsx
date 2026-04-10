'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { createPartnerSchema, type CreatePartnerInput } from '@/lib/validations/partner';
import { createPartnerAction } from '@/actions/admin-partners';

export default function CreatePartnerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePartnerInput>({
    resolver: zodResolver(createPartnerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      send_invite: true,
      password: '',
    },
  });

  const sendInvite = watch('send_invite');

  function handleOpenChange(value: boolean) {
    if (!value) {
      reset();
      setServerError(null);
      setShowPassword(false);
    }
    setOpen(value);
  }

  async function onSubmit(data: CreatePartnerInput) {
    setServerError(null);
    try {
      const fd = new FormData();
      fd.append('first_name', data.first_name);
      fd.append('last_name', data.last_name);
      fd.append('email', data.email);
      fd.append('send_invite', String(data.send_invite));
      if (data.password) fd.append('password', data.password);
      const result = await createPartnerAction(fd);
      if (result?.error) {
        setServerError(result.error);
        return;
      }
      toast.success(
        data.send_invite
          ? `Einladungslink an ${data.email} gesendet.`
          : `Partner ${data.first_name} ${data.last_name} wurde angelegt.`
      );
      handleOpenChange(false);
      router.refresh();
    } catch {
      setServerError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Partner anlegen
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partner anlegen</DialogTitle>
            <DialogDescription>
              Neuen Partner-Account erstellen. Der Partner erhält anschließend Zugang zum Portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 mt-2">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="first_name" className="text-sm font-medium text-gray-700">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <Input
                  id="first_name"
                  placeholder="Max"
                  autoComplete="given-name"
                  {...register('first_name')}
                  aria-invalid={!!errors.first_name}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="last_name" className="text-sm font-medium text-gray-700">
                  Nachname <span className="text-red-500">*</span>
                </label>
                <Input
                  id="last_name"
                  placeholder="Mustermann"
                  autoComplete="family-name"
                  {...register('last_name')}
                  aria-invalid={!!errors.last_name}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-Mail-Adresse <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="max@beispiel.de"
                autoComplete="email"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Method selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Zugangsmethode</p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    checked={sendInvite === true}
                    onChange={() => setValue('send_invite', true)}
                    className="mt-0.5 accent-gray-900"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    <span className="font-medium">Einladungslink senden</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Der Partner erhält eine E-Mail und setzt sein Passwort selbst.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    checked={sendInvite === false}
                    onChange={() => setValue('send_invite', false)}
                    className="mt-0.5 accent-gray-900"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    <span className="font-medium">Passwort direkt vergeben</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Passwort wird jetzt festgelegt und dem Partner mitgeteilt.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Password field — only shown when send_invite is false */}
            {sendInvite === false && (
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Passwort <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sicheres Passwort eingeben"
                    autoComplete="new-password"
                    className="pr-10"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Mindestens 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe und eine Zahl.
                  </p>
                )}
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Abbrechen
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[130px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird angelegt …
                  </>
                ) : (
                  'Partner anlegen'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
