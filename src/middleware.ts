import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/desktop',
  '/dashboard',
  '/leaderboard',
  '/learn',
  '/play',
  '/quizzes',
  '/account-settings',
  '/admin',
];

// Routes only accessible to Super Admin roles
const ADMIN_ROUTES = ['/admin'];

// Routes only accessible when NOT logged in
const AUTH_ROUTES = ['/login', '/signup'];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

  // 1. Redirect unauthenticated users away from protected & admin routes to /login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 2. Strict Role Check: Redirect non-admin logged-in users away from /admin to /desktop
  if (isAdminRoute && isLoggedIn) {
    const userRole = (session?.user as any)?.role || 'USER';
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/desktop', nextUrl));
    }
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
