'use client';

import { useState, startTransition } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordAction } from '@/actions/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    setIsPending(true);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('email', data.email);
        const result = await forgotPasswordAction(fd);

        if (result?.error) {
          toast.error(result.error);
        } else {
          setSubmittedEmail(data.email);
          setIsSuccess(true);
        }
      } catch {
        toast.error('Ein unerwarteter Fehler ist aufgetreten.');
      } finally {
        setIsPending(false);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <MailCheck size={22} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
          E-Mail gesendet
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Wir haben einen Link zum Zurücksetzen deines Passworts an{' '}
          <span className="font-medium text-gray-700">{submittedEmail}</span> gesendet.
          Bitte überprüfe auch deinen Spam-Ordner.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={14} />
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Passwort zurücksetzen
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Wir senden dir einen Link per E-Mail.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@beispiel.de"
            {...register('email')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Wird gesendet…</span>
            </>
          ) : (
            'Link anfordern'
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={13} />
          Zurück zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
