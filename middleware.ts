import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/callback',
  '/api/webhooks',
];

const ROLE_ROUTES: Record<string, string[]> = {
  '/events/create': ['organizer', 'superadmin'],
  '/venues/create': ['venue_owner', 'superadmin'],
  '/venues/dashboard': ['venue_owner', 'superadmin'],
  '/artists/dashboard': ['artist', 'superadmin'],
  '/live/go-live': ['artist', 'superadmin'],
  '/live/broadcasting': ['artist', 'superadmin'],
  '/stripe-connect': ['organizer', 'venue_owner', 'artist', 'superadmin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    // Special case: webhook routes don't need auth
    if (pathname.startsWith('/api/webhooks')) {
      return NextResponse.next();
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Public routes - allow through (redirect to home if already logged in for auth pages)
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    if (user && (pathname === '/login' || pathname === '/register')) {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protected routes - redirect to login if not authenticated
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Get user profile for role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_banned')
    .eq('id', user.id)
    .single();

  // Banned users
  if (profile?.is_banned) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Admin routes - superadmin only
  if (pathname.startsWith('/admin')) {
    if (profile?.role !== 'superadmin') {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Check-in routes need organizer check
  if (pathname.match(/^\/events\/[^/]+\/checkin/)) {
    if (!['organizer', 'superadmin'].includes(profile?.role || '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Role-restricted routes
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!roles.includes(profile?.role || '')) {
        const url = request.nextUrl.clone();
        url.pathname = '/home';
        return NextResponse.redirect(url);
      }
      break;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
