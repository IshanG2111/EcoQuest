'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Mock User type for authentication
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {}
});

// Mock authentication functions
const createMockUser = (email: string, username?: string): MockUser => ({
  uid: Math.random().toString(36).substr(2, 9),
  email,
  displayName: username || email.split('@')[0]
});

const mockLogin = async (email: string, password: string): Promise<MockUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, accept any non-empty credentials
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  return createMockUser(email);
};

const mockSignup = async (email: string, password: string, username: string): Promise<MockUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!email || !password || !username) {
    throw new Error('All fields are required');
  }
  
  return createMockUser(email, username);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const mockUser = await mockLogin(email, password);
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, username: string) => {
    const mockUser = await mockSignup(email, password, username);
    setUser(mockUser);
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
            </div>
        );
    }

    return <>{children}</>;
}
