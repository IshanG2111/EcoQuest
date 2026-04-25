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
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
