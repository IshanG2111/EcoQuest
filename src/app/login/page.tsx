'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { User, Key } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import './auth-styles.css';
import { useSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      // Wait briefly then redirect based on role from session
      setTimeout(() => {
        const role = (session?.user as any)?.role ?? 'student';
        if (role === 'teacher' || role === 'admin') {
          router.push('/teacher');
        } else {
          router.push('/desktop');
        }
      }, 300);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-overlay"></div>
      <div className="auth-box">
        <h2 className="auth-title">EcoQuest OS</h2>
        <p className="auth-subtitle">Enter your credentials to log on</p>

        <div className="auth-input-box">
          <label className="auth-label" htmlFor="email">Email:</label>
          <User className="auth-icon" size={16} />
          <input
            id="email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-input-box">
          <label className="auth-label" htmlFor="password">Password:</label>
          <Key className="auth-icon" size={16} />
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="auth-btn"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging In...' : 'Log On'}
        </button>

        <div className="auth-footer">
          <div style={{ marginBottom: '10px' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="auth-text-link">
              Sign Up
            </Link>
          </div>
          <Link href="/" className="auth-link-btn">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
