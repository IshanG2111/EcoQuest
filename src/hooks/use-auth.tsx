'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLoader } from '@/components/ui/app-loader';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { },
  signup: async () => { },
  logout: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user: AuthUser | null = session?.user
    ? {
      id: session.user.id as string,
      email: session.user.email ?? '',
      name: session.user.name ?? '',
      image: session.user.image,
      role: ((session.user as any).role as UserRole) ?? 'student',
    }
    : null;

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Invalid email or password. Please try again.');
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName: username }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? 'Failed to create account.');
    }

    // Auto sign-in after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error('Account created but sign-in failed. Please log in manually.');
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading: status === 'loading', login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <AppLoader
        title="Checking your EcoQuest account"
        subtitle="Authenticating and syncing your latest progress..."
      />
    );
  }

  return <>{children}</>;
};
