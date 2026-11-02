import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  DEMO_SESSION_COOKIE,
  createDemoUser,
  isSupabasePlaceholder,
} from '@/lib/supabase/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
  const isPlaceholder = isSupabasePlaceholder(supabaseUrl);

  let user = null;

  if (isPlaceholder) {
    const demoEmail = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
    if (demoEmail) {
      user = createDemoUser(demoEmail);
    }
  } else {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Refresh auth token
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }

    if (!user) {
      const demoEmail = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
      if (demoEmail) {
        user = createDemoUser(demoEmail);
      }
    }
  }

  const pathname = request.nextUrl.pathname;

  // Protect admin dashboard routes
  const protectedPaths = ['/dashboard', '/feedback', '/roadmap', '/changelog'];
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // If user is not signed in and tries to access admin routes
  if (isProtectedPath && !user) {
    // If not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is signed in and visits /login, redirect to /dashboard
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
