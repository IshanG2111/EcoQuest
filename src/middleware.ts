import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// Protected routes for general logged-in users
const PROTECTED_ROUTES = [
  '/desktop',
  '/dashboard',
  '/leaderboard',
  '/learn',
  '/play',
  '/quizzes',
  '/account-settings',
];

// Stealth Secret Admin Routes (Hidden behind 404 for unauthorized visitors)
const ADMIN_ROUTES = ['/admin'];

// Auth routes for unauthenticated users
const AUTH_ROUTES = ['/login', '/signup'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as any)?.role || 'USER';
  const userEmail = session?.user?.email?.toLowerCase().trim();

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  // 1. STEALTH ADMIN GUARD: If visitor is not logged in as Super Admin (ishan.ghosh@ecoquest.com), return a 404 Not Found rewrite!
  if (isAdminRoute) {
    const isSuperAdmin =
      isLoggedIn &&
      (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userEmail === 'ishan.ghosh@ecoquest.com');

    if (!isSuperAdmin) {
      // Act like the page does not exist at all (Stealth 404)
      return NextResponse.rewrite(new URL('/404', nextUrl));
    }
  }

  // 2. Redirect unauthenticated users away from protected user routes to /login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 3. Redirect authenticated users away from login/signup to /desktop
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/desktop', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
