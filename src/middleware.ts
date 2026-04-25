import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);
import { NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/desktop', '/dashboard', '/leaderboard', '/learn', '/play', '/quizzes', '/teacher', '/account-settings'];

// Routes only accessible when NOT logged in
const AUTH_ROUTES = ['/login', '/signup'];

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session?.user;
    const role = (session?.user as any)?.role;

    const isProtectedRoute = PROTECTED_ROUTES.some((route) => nextUrl.pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => nextUrl.pathname.startsWith(route));

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // Redirect authenticated users away from login/signup
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/desktop', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
