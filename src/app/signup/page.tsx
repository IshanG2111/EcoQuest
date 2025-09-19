'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { User, Key, Mail } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getRoleForUser } from '@/lib/auth-roles';
import './auth-styles.css';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!username) {
        toast({
            variant: 'destructive',
            title: 'Username Required',
            description: 'Please enter a username to create your account.',
        });
        return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, username);

      toast({
        title: 'Account Created!',
        description: "Welcome to EcoQuest! We're redirecting you now...",
      });

      const role = getRoleForUser(email);
      switch(role) {
        case 'admin':
        case 'teacher':
          router.push('/teacher');
          break;
        default:
          router.push('/desktop');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
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
        <h2 className="auth-title">Create Your EcoQuest Account</h2>
        <p className="auth-subtitle">Join the mission to save the planet!</p>
        
        <div className="auth-input-box">
          <label className="auth-label" htmlFor="email">Email:</label>
          <Mail className="auth-icon" size={16} />
          <input 
            id="email" 
            type="email" 
            placeholder="you@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="auth-input-box">
          <label className="auth-label" htmlFor="username">Username:</label>
          <User className="auth-icon" size={16} />
          <input 
            id="username" 
            type="text" 
            placeholder="EcoChampion"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
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
          onClick={handleSignup} 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="auth-footer">
          <div style={{ marginBottom: '10px' }}>
            Already have an account?{' '}
            <Link href="/login" className="auth-text-link">
              Log In
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
