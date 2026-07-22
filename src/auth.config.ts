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
                token.role = (user as any).role || (user.email === 'ishan.ghosh@ecoquest.com' ? 'SUPER_ADMIN' : 'USER');
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                const userEmail = session.user.email?.toLowerCase().trim();
                (session.user as any).role = userEmail === 'ishan.ghosh@ecoquest.com' ? 'SUPER_ADMIN' : ((token.role as string) || 'USER');
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
