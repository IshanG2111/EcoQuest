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
                token.role = (user as any).role || (['ishan.ghosh2004@gmail.com', 'ishan.ghosh@ecoquest.com'].includes(user.email || '') ? 'SUPER_ADMIN' : 'USER');
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                const userEmail = session.user.email?.toLowerCase().trim() || '';
                (session.user as any).role = ['ishan.ghosh2004@gmail.com', 'ishan.ghosh@ecoquest.com'].includes(userEmail) ? 'SUPER_ADMIN' : ((token.role as string) || 'USER');
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
