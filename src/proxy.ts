/**
 * Next.js Proxy (Middleware)
 * - Session refresh (Supabase SSR requirement)
 * - Role-based route protection
 * - Deactivated accounts: sign out + redirect to /login
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password', '/register', '/invite'];
const MARKETING_ROUTES = ['/', '/trainer', '/b2b', '/bestellung']; // publicly accessible, no auth required or redirect
const ADMIN_ROUTES = ['/admin'];
const PARTNER_ROUTES = ['/partner'];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isMarketingRoute = MARKETING_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));

  // Marketing pages: always pass through, no auth checks
  if (isMarketingRoute) return supabaseResponse;

  // No session → send to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const role = await getUserRole(request, user.id);

    // Deactivated account: sign them out server-side and redirect to login
    // This prevents the redirect loop caused by a valid session + null role
    if (role === null && !isPublicRoute) {
      const signOutResponse = NextResponse.redirect(new URL('/login?deactivated=1', request.url));
      // Clear Supabase auth cookies so the session is gone
      request.cookies.getAll().forEach(({ name }) => {
        if (name.startsWith('sb-')) {
          signOutResponse.cookies.delete(name);
        }
      });
      return signOutResponse;
    }

    // Authenticated user on public pages → go to their dashboard (only if active)
    if (isPublicRoute && pathname !== '/reset-password' && pathname !== '/invite') {
      if (role === null) return supabaseResponse; // deactivated, stay on login
      const destination = role === 'admin' ? '/admin/dashboard' : '/partner/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Admin route guard
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/partner/dashboard', request.url));
    }

    // Partner route guard
    if (PARTNER_ROUTES.some((r) => pathname.startsWith(r)) && role !== 'partner') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

  }

  return supabaseResponse;
}

async function getUserRole(request: NextRequest, userId: string): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );

  const { data } = await supabase
    .from('bt_profiles')
    .select('role, is_active')
    .eq('id', userId)
    .single();

  if (!data || !data.is_active) return null;
  return data.role;
}

export const config = {
  // Exclude: Next.js internals, API callbacks, and any path with a file extension (static assets)
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/cron|api/auth/callback|.*\\..*).*)'],
};
