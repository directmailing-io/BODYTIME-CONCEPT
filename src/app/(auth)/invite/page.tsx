'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';

type PageState = 'loading' | 'ready' | 'success' | 'error';

export default function InvitePage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [firstName, setFirstName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password') ?? '';

  useEffect(() => {
    async function handleInviteToken() {
      const hash = window.location.hash;
      if (!hash) {
        setErrorMessage('Kein Einladungslink gefunden. Bitte öffne den Link aus deiner E-Mail.');
        setPageState('error');
        return;
      }

      const params = new URLSearchParams(hash.slice(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (!accessToken || !refreshToken || type !== 'invite') {
        setErrorMessage('Ungültiger oder abgelaufener Einladungslink. Bitte wende dich an deinen Administrator.');
        setPageState('error');
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.user) {
          setErrorMessage('Der Einladungslink ist abgelaufen. Bitte wende dich an deinen Administrator, um einen neuen Link anzufordern.');
          setPageState('error');
          return;
        }

        const name = data.user.user_metadata?.first_name as string | undefined;
        setFirstName(name ?? null);

        // Clean the hash from the URL without a page reload
        window.history.replaceState(null, '', window.location.pathname);
        setPageState('ready');
      } catch {
        setErrorMessage('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
        setPageState('error');
      }
    }

    handleInviteToken();
  }, []);

  const onSubmit = (data: ResetPasswordInput) => {
    setServerError(null);
    setIsPending(true);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('password', data.password);
        fd.append('confirmPassword', data.confirmPassword);
        const result = await resetPasswordAction(fd);

        if (result?.error) {
          setServerError(result.error);
          toast.error(result.error);
        } else {
          setPageState('success');
          setTimeout(() => router.push('/partner/dashboard'), 2000);
        }
      } catch {
        const msg = 'Ein unerwarteter Fehler ist aufgetreten.';
        setServerError(msg);
        toast.error(msg);
      } finally {
        setIsPending(false);
      }
    });
  };

  if (pageState === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <Loader2 className="mx-auto animate-spin text-gray-400 mb-4" size={28} />
        <p className="text-sm text-gray-500">Einladung wird geprüft…</p>
      </div>
    );
  }

  if (pageState === 'error') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle size={22} className="text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
          Link ungültig
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
          Willkommen{firstName ? `, ${firstName}` : ''}!
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Dein Konto ist jetzt aktiv. Du wirst in Kürze zu deinem Dashboard weitergeleitet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {firstName ? `Hallo, ${firstName}!` : 'Konto aktivieren'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Lege jetzt dein persönliches Passwort fest, um loszulegen.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Passwort festlegen
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
              {...register('password')}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Verbergen' : 'Anzeigen'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrengthIndicator password={passwordValue} />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Passwort bestätigen
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Passwort wiederholen"
              {...register('confirmPassword')}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirmPassword ? 'Verbergen' : 'Anzeigen'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Wird aktiviert…</span>
            </>
          ) : (
            'Konto aktivieren & loslegen'
          )}
        </button>
      </form>
    </div>
  );
}
