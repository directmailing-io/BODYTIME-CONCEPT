'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Eye, EyeOff, Loader2, Mail, KeyRound } from 'lucide-react';
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

interface CreatePartnerDialogProps {
  /** When provided, dialog is controlled externally — no built-in trigger button */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CreatePartnerDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: CreatePartnerDialogProps = {}) {
  const isControlled = externalOpen !== undefined;
  const router = useRouter();
  const [localOpen, setLocalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const open = isControlled ? externalOpen! : localOpen;

  function setOpen(value: boolean) {
    if (isControlled) externalOnOpenChange?.(value);
    else setLocalOpen(value);
  }

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
      {!isControlled && (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Partner anlegen
        </Button>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partner anlegen</DialogTitle>
            <DialogDescription>
              Neuen Partner-Account erstellen. Der Partner erhält anschließend Zugang zum Portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-1">

            {/* Name — stacked on mobile, side-by-side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Method selection — touch-friendly cards */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Zugangsmethode</p>
              <div className="grid grid-cols-1 gap-2">

                <button
                  type="button"
                  onClick={() => setValue('send_invite', true)}
                  className={[
                    'flex items-start gap-3 w-full text-left p-4 rounded-2xl border-2 transition-all',
                    sendInvite === true
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                  ].join(' ')}
                >
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    sendInvite === true ? 'border-gray-900' : 'border-gray-300',
                  ].join(' ')}>
                    {sendInvite === true && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">Einladungslink senden</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Der Partner erhält eine E-Mail und setzt sein Passwort selbst.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('send_invite', false)}
                  className={[
                    'flex items-start gap-3 w-full text-left p-4 rounded-2xl border-2 transition-all',
                    sendInvite === false
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                  ].join(' ')}
                >
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    sendInvite === false ? 'border-gray-900' : 'border-gray-300',
                  ].join(' ')}>
                    {sendInvite === false && (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <KeyRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">Passwort direkt vergeben</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Passwort wird jetzt festgelegt und dem Partner mitgeteilt.
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* Password — only if send_invite is false */}
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
                    className="pr-11"
                    {...register('password')}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Mind. 8 Zeichen, Groß- & Kleinbuchstabe, eine Zahl.
                  </p>
                )}
              </div>
            )}

            {/* Server error */}
            {serverError && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting} className="w-full sm:w-auto">
                  Abbrechen
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 w-full sm:w-auto sm:min-w-[130px]"
              >
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
