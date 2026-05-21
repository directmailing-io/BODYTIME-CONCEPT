'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // true once a valid auth session is detected (from hash fragment or cookie)
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Parse URL fragment manually – the most reliable approach.
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
      // Implicit flow: Supabase placed the recovery tokens directly in the
      // URL fragment. Establish the session explicitly from these tokens.
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
        .then(({ data, error }) => {
          if (!error && data.session) {
            setSessionReady(true);
            // Remove tokens from the URL so they can't be reused via back-button.
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.error('[reset-password] setSession error:', error?.message);
            setSessionError(
              'Dieser Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an.',
            );
          }
        });
    } else {
      // PKCE flow: /api/auth/callback exchanged the code and set session cookies.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSessionReady(true);
        } else {
          setSessionError(
            'Kein gültiger Reset-Link gefunden. Bitte fordere einen neuen an.',
          );
        }
      });
    }
  }, []);

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

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setIsPending(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: data.password });

      if (error) {
        console.error('[reset-password] updateUser error:', error.message);
        const msg = `Passwort konnte nicht geändert werden. (${error.message})`;
        setServerError(msg);
        toast.error(msg);
      } else {
        setIsSuccess(true);
        await supabase.auth.signOut();
      }
    } catch {
      const message = 'Ein unerwarteter Fehler ist aufgetreten.';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  // Session error: link expired or invalid
  if (sessionError) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 mb-5">
          <p className="text-sm text-red-600">{sessionError}</p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  // While waiting for session detection show a neutral loading state
  if (!sessionReady && !isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-500">Sitzung wird geladen…</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
          Passwort geändert
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full mt-6 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Neues Passwort festlegen
        </h2>
        <p className="text-sm text-gray-400 mt-1">Wähle ein sicheres Passwort.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Neues Passwort
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
              <span>Wird gespeichert…</span>
            </>
          ) : (
            'Passwort speichern'
          )}
        </button>
      </form>
    </div>
  );
}
