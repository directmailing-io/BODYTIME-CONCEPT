import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase Auth Callback
 * Exchanges the PKCE `code` param for a session and redirects to `next`.
 * Used by: password reset emails, partner invite emails.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // No PKCE code – Supabase used implicit flow (generateLink with type=recovery).
  // Redirect to the target page; the client-side Supabase listener will pick up
  // the #access_token fragment and establish the session automatically.
  if (!code) {
    const target = new URL(next, `https://${request.headers.get('host') ?? 'bodytime-concept.de'}`);
    return NextResponse.redirect(target);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback]', error.message);
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url));
  }

  // Redirect to the intended destination (e.g. /reset-password or /register)
  return NextResponse.redirect(new URL(next, request.url));
}
