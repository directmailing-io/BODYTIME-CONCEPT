/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 * Reads cookies for session; uses anon key with RLS.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Can be called from Server Component where cookies are read-only.
            // Middleware handles refreshing — safe to ignore here.
          }
        },
      },
    },
  );
}

/**
 * Admin Supabase client using the service role key.
 * ONLY for server-side admin operations (creating users, bypassing RLS).
 * NEVER use in client components or expose to the browser.
 */
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
