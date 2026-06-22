import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        signOut: '/',
        error: '/login',
    },
    providers: [], // Added in auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
