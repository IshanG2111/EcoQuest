'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: nextSession, status: nextStatus } = useSession();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [fbLoading, setFbLoading] = useState<boolean>(true);
  const router = useRouter();

  // Listen to Firebase auth state changes
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        setFirebaseUser(fbUser);
        setFbLoading(false);
      });
      return () => unsubscribe();
    } catch {
      setFbLoading(false);
    }
  }, []);

  // Compute unified user (Firebase Auth takes primary priority, fallback to NextAuth session)
  const user: AuthUser | null = firebaseUser
    ? {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
        image: firebaseUser.photoURL,
        role: 'USER',
      }
    : nextSession?.user
    ? {
        id: nextSession.user.id as string,
        email: nextSession.user.email ?? '',
        name: nextSession.user.name ?? '',
        image: nextSession.user.image,
        role: (nextSession.user as any).role || 'USER',
      }
    : null;

  const loading = fbLoading && nextStatus === 'loading';
  const isGuest = !loading && !user;

  // Firebase Email/Password Sign-In with NextAuth fallback
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (fbError: any) {
      // Try NextAuth credentials fallback if Firebase fails
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(fbError?.message || 'Invalid email or password.');
      }
    }
  };

  // Firebase Sign-Up + MongoDB Profile Creation
  const signup = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: username,
        });
      }

      // Sync user profile to backend MongoDB
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: username, firebaseUid: userCredential.user.uid }),
      }).catch(() => {});
    } catch (fbError: any) {
      // Fallback to API route registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: username }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(fbError?.message || data.error || 'Failed to create account.');
      }
    }
  };

  // Firebase Google OAuth Popup Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Sync profile to database
        await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          }),
        }).catch(() => {});
      }
    } catch (err: any) {
      throw new Error(err?.message || 'Google sign-in failed.');
    }
  };

  // Unified Sign Out
  const logout = async () => {
    try {
      await firebaseSignOut(auth).catch(() => {});
      await nextAuthSignOut({ callbackUrl: '/welcome', redirect: true });
    } catch {
      window.location.href = '/welcome';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export interface AuthGuardProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

export function AuthGuard({ children, allowGuest = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !allowGuest) {
      router.push('/login');
    }
  }, [user, loading, allowGuest, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#07090e] font-mono text-emerald-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>AUTHENTICATING EXPLORER...</span>
        </div>
      </div>
    );
  }

  if (!user && !allowGuest) {
    return null;
  }

  return <>{children}</>;
}
