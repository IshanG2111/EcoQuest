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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to EcoQuest Terminal. Are you a returning EcoWarrior or a new recruit?',
    },
  ]);
  const [step, setStep] = useState<Step>('init');
  const [inputValue, setInputValue] = useState('');
  
  // Data collection
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    setMessages((prev) => [...prev, { id: Date.now(), text, sender, isPassword }]);
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
        setEmail(currentInput);
        setTimeout(() => {
          addMessage('Great. What should we call you? (Choose a username)', 'bot');
          setStep('signup_username');
        }, 500);
        break;

      case 'signup_username':
        setUsername(currentInput);
        setTimeout(() => {
          addMessage(`Nice to meet you, ${currentInput}! Lastly, choose a strong password:`, 'bot');
          setStep('signup_password');
        }, 500);
        break;

      case 'signup_password':
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
        const role = (session?.user as any)?.role ?? 'user';
        if (role === 'admin') {
          router.push('/desktop'); // Or admin dashboard if you build one
        } else {
          router.push('/desktop');
        }
      }, 1500);
    } catch (err: any) {
      addMessage(`Error: ${err.message}`, 'error' as any); // Render as system error
      addMessage('Type "restart" to try again.', 'bot');
      setStep('error');
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
      addMessage(`Error: ${err.message}`, 'error' as any);
      addMessage('Type "restart" to start over.', 'bot');
      setStep('error');
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'system',
        text: 'Terminal reset.',
      },
      {
        id: Date.now() + 1,
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-mono relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <Leaf className="w-96 h-96 text-green-500 blur-3xl" />
      </div>

      <Card className="w-full max-w-2xl bg-zinc-900/90 border-zinc-800 text-zinc-100 shadow-2xl backdrop-blur-md z-10 flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/50 rounded-t-xl">
          <div className="flex items-center gap-2 text-green-500">
            <Terminal className="w-5 h-5" />
            <span className="font-bold tracking-wider">ECO_QUEST://AUTH</span>
          </div>
          <button 
            onClick={resetChat} 
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
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
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[10px] text-zinc-500 mb-1 px-1 uppercase">
                {msg.sender === 'bot' ? 'EcoBot' : msg.sender === 'system' || msg.sender === ('error' as any) ? 'System' : 'You'}
              </span>
              <div
                className={`p-3 rounded-lg text-sm sm:text-base ${
                  msg.sender === 'user'
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : msg.sender === 'bot'
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : msg.sender === ('error' as any)
                    ? 'bg-red-900/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-900/20 text-blue-400 border border-blue-500/30 italic'
                }`}
              >
                {msg.isPassword ? '••••••••' : msg.text}
              </div>
            </div>
          ))}

          {step === 'init' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={() => handleModeSelect('login')}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-300 w-full sm:w-auto"
              >
                Login
              </Button>
              <Button 
                onClick={() => handleModeSelect('signup')}
                className="bg-green-600 hover:bg-green-500 text-white w-full sm:w-auto"
              >
                Sign Up
              </Button>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 rounded-b-xl">
          <form onSubmit={processSubmit} className="flex gap-2">
            <span className="text-green-500 pt-2 font-bold">{'>'}</span>
            <Input
              ref={inputRef}
              type={step.includes('password') ? 'password' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === 'init' ? "Select an option above..." : 
                step === 'loading' || step === 'success' ? "Please wait..." : 
                "Type your response..."
              }
              disabled={step === 'init' || step === 'loading' || step === 'success'}
              className="bg-transparent border-none text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 shadow-none font-mono text-base"
              autoComplete="off"
              autoFocus
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputValue.trim() || step === 'init' || step === 'loading' || step === 'success'}
              className="bg-green-600 hover:bg-green-500 text-white shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
