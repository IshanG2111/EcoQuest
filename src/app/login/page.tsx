'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Send, Terminal, RefreshCw, Leaf } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type Sender = 'bot' | 'user' | 'system';
type Step = 'init' | 'login_email' | 'login_password' | 'signup_email' | 'signup_username' | 'signup_password' | 'loading' | 'error' | 'success';

interface Message {
  id: number;
  text: string | React.ReactNode;
  sender: Sender;
  isPassword?: boolean;
}

export default function ChatAuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const { data: session } = useSession();
  const nextMessageIdRef = useRef(2);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to EcoQuest Terminal. Are you a returning EcoWarrior or a new recruit?',
    },
  ]);
  const [step, setStep] = useState<Step>('init');
  const [inputValue, setInputValue] = useState('');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const getNextMessageId = () => {
    const id = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    return id;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (step !== 'init' && step !== 'loading' && step !== 'success') {
      inputRef.current?.focus();
    }
  }, [messages, step]);

  const addMessage = (text: string | React.ReactNode, sender: Sender, isPassword = false) => {
    setMessages((prev) => [...prev, { id: getNextMessageId(), text, sender, isPassword }]);
  };

  const handleModeSelect = (mode: 'login' | 'signup') => {
    if (mode === 'login') {
      addMessage('I am a returning EcoWarrior.', 'user');
      setTimeout(() => {
        addMessage('Welcome back! Please enter your email address:', 'bot');
        setStep('login_email');
      }, 500);
    } else {
      addMessage('I am a new recruit.', 'user');
      setTimeout(() => {
        addMessage('Awesome! Let\'s get you set up. What email would you like to use?', 'bot');
        setStep('signup_email');
      }, 500);
    }
  };

  const processSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || step === 'loading' || step === 'init' || step === 'success') return;

    const currentInput = inputValue.trim();
    setInputValue('');

    // Handle restart command
    if (currentInput.toLowerCase() === 'restart' || currentInput.toLowerCase() === 'clear') {
      addMessage(currentInput, 'user');
      setTimeout(() => resetChat(), 500);
      return;
    }

    // Add user message to chat
    addMessage(currentInput, 'user', step.includes('password'));

    // State machine logic
    switch (step) {
      case 'login_email':
        if (!validateEmail(currentInput)) {
          addMessage('Invalid email format. Please enter a valid email address (e.g., eco@warrior.com):', 'bot');
          return;
        }
        setEmail(currentInput);
        setTimeout(() => {
          addMessage('Got it. Now enter your password:', 'bot');
          setStep('login_password');
        }, 500);
        break;

      case 'login_password':
        setPassword(currentInput);
        setStep('loading');
        setTimeout(() => {
          addMessage('Authenticating...', 'system');
          executeLogin(email, currentInput);
        }, 500);
        break;

      case 'signup_email':
        if (!validateEmail(currentInput)) {
          addMessage('Invalid email format. Please enter a valid email address:', 'bot');
          return;
        }
        setEmail(currentInput);
        setTimeout(() => {
          addMessage('Great. What should we call you? (Choose a username)', 'bot');
          setStep('signup_username');
        }, 500);
        break;

      case 'signup_username':
        if (currentInput.length < 2) {
          addMessage('Username is too short. Please use at least 2 characters:', 'bot');
          return;
        }
        setUsername(currentInput);
        setTimeout(() => {
          addMessage(`Nice to meet you, ${currentInput}! Lastly, choose a strong password (min 6 chars):`, 'bot');
          setStep('signup_password');
        }, 500);
        break;

      case 'signup_password':
        if (currentInput.length < 6) {
          addMessage('Password too weak. Please use at least 6 characters:', 'bot');
          return;
        }
        setPassword(currentInput);
        setStep('loading');
        setTimeout(() => {
          addMessage('Creating your account...', 'system');
          executeSignup(email, username, currentInput);
        }, 500);
        break;
    }
  };

  const executeLogin = async (e: string, p: string) => {
    try {
      await login(e, p);
      addMessage('Authentication successful! Access granted.', 'system');
      setStep('success');
      setTimeout(() => {
        router.push('/desktop');
      }, 1500);
    } catch (err: any) {
      addMessage(`ACCESS DENIED: ${err.message}`, 'error' as any);
      setTimeout(() => {
        addMessage('Would you like to try logging in again or reset?', 'bot');
        setStep('init'); // Back to start but keep context or offer buttons
      }, 800);
    }
  };

  const executeSignup = async (e: string, u: string, p: string) => {
    try {
      await signup(e, p, u);
      addMessage('Account created successfully! Welcome to the mission.', 'system');
      setStep('success');
      setTimeout(() => {
        router.push('/desktop');
      }, 1500);
    } catch (err: any) {
      addMessage(`REGISTRATION FAILED: ${err.message}`, 'error' as any);
      setTimeout(() => {
        addMessage('Please try again with a different email or username.', 'bot');
        setStep('init');
      }, 800);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: getNextMessageId(),
        sender: 'system',
        text: 'Terminal reset.',
      },
      {
        id: getNextMessageId(),
        sender: 'bot',
        text: 'Welcome to EcoQuest Terminal. Are you a returning EcoWarrior or a new recruit?',
      }
    ]);
    setStep('init');
    setEmail('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Background GIF */}
      <div 
        className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/sig.gif')",
          imageRendering: 'pixelated'
        }}
      ></div>
      {/* Dark Overlay to ensure readability */}
      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none"></div>

      <Card className="w-full max-w-2xl retro-window z-10 flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="window-drag-handle rounded-t-lg">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <span className="font-headline tracking-wider uppercase text-xs">EcoQuest://Auth</span>
          </div>
          <button 
            onClick={resetChat} 
            className="hover:text-primary transition-colors opacity-70 hover:opacity-100"
            title="Restart Terminal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Window */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[10px] text-foreground/50 mb-1 px-1 uppercase tracking-widest font-headline">
                {msg.sender === 'bot' ? 'EcoBot' : msg.sender === 'system' || msg.sender === ('error' as any) ? 'System' : 'You'}
              </span>
              <div
                className={`p-3 rounded-lg text-sm sm:text-base border transition-all duration-300 ${
                  msg.sender === 'user'
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.1)]'
                    : msg.sender === 'bot'
                    ? 'bg-secondary/20 text-foreground border-border/50'
                    : msg.sender === ('error' as any)
                    ? 'quiz-incorrect !bg-destructive/10'
                    : 'bg-accent/10 text-accent border-accent/30 italic'
                }`}
              >
                {msg.isPassword ? '••••••••' : msg.text}
              </div>
            </div>
          ))}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={() => handleModeSelect('login')}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto font-headline text-xs tracking-widest"
              >
                LOGIN
              </Button>
              <Button 
                onClick={() => handleModeSelect('signup')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto font-headline text-xs tracking-widest"
              >
                SIGN UP
              </Button>
            </div>
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 bg-secondary/30 border-t border-border/30 rounded-b-lg">
          <form onSubmit={processSubmit} className="flex gap-2">
            <span className="text-primary pt-2 font-bold animate-pulse">{'>'}</span>
            <Input
              ref={inputRef}
              type={step.includes('password') ? 'password' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === 'init' ? "Select an option above..." : 
                step === 'loading' || step === 'success' ? "Please wait..." : 
                "Enter command..."
              }
              disabled={step === 'init' || step === 'loading' || step === 'success'}
              className="bg-transparent border-none text-foreground placeholder:text-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none font-body text-lg"
              autoComplete="off"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputValue.trim() || step === 'init' || step === 'loading' || step === 'success'}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
