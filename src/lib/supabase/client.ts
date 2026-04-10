/**
 * Browser-side Supabase client.
 * Uses ONLY the public anon key — never the service role key.
 * Row-Level Security policies on the database enforce access control.
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
