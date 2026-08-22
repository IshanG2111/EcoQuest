'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Terminal,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  Lock,
  Compass,
  AlertCircle,
  ShieldCheck,
  Download,
  Printer,
  Sliders,
  Palette,
} from 'lucide-react';
import DotGrid from '@/components/ui/DotGrid';
import { AdmitOneTicket, playShutterSound } from '@/components/ui/admit-one-ticket';
import { soundFX } from '@/lib/audio-fx';
import anime from '@/lib/anime';
import {
  PassportConfig,
  PASSPORT_THEMES,
  PassportCustomizerModal,
  loadSavedPassportConfig,
  savePassportConfig,
  downloadPassportPng,
} from '@/components/passport/PassportCustomizerModal';

type AuthMode = 'signin' | 'signup' | 'terminal';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passport Configuration & Customization State (Persistent in localStorage)
  const [passportConfig, setPassportConfig] = useState<PassportConfig>(() => loadSavedPassportConfig('EXPLORER'));
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Passport Celebration Screen State
  const [passportMinted, setPassportMinted] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);

  // ─── Terminal Bot Chat State ───
  const [termMessages, setTermMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'EcoQuest Authentication Terminal initialized.' },
    { sender: 'bot', text: 'Authenticate with your explorer credentials or type "guest".' },
  ]);
  const [termInput, setTermInput] = useState('');
  const termEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termMessages]);

  // Update passport name when registering
  useEffect(() => {
    if (name.trim()) {
      setPassportConfig((prev) => {
        const next = { ...prev, name: name.trim().toUpperCase() };
        savePassportConfig(next);
        return next;
      });
    }
  }, [name]);

  const switchMode = (newMode: AuthMode) => {
    soundFX.playClick();
    setError(null);
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0.75, 1],
        scale: [0.98, 1],
        duration: 180,
        easing: 'easeOutCubic',
      });
    }
    setMode(newMode);
  };

  const handleSuccessfulAuth = (displayName: string) => {
    const finalName = (displayName || passportConfig.name || 'EXPLORER').toUpperCase();
    const updatedConfig = { ...passportConfig, name: finalName };
    setPassportConfig(updatedConfig);
    savePassportConfig(updatedConfig);

    setPassportMinted(true);
    playShutterSound();
    soundFX.playSuccessChime();

    if (celebrationRef.current) {
      anime({
        targets: celebrationRef.current,
        opacity: [0, 1],
        scale: [0.94, 1],
        duration: 320,
        easing: 'easeOutBack',
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      soundFX.playError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Always show proper Explorer Name, NOT raw email address
      const existingName = passportConfig.name && passportConfig.name !== 'EXPLORER'
        ? passportConfig.name
        : 'ECO EXPLORER';
      handleSuccessfulAuth(existingName);
    } catch (err: any) {
      soundFX.playError();
      let msg = err?.message || 'Invalid email or password.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please check your credentials or register an account.';
      } else if (msg.includes('auth/too-many-requests')) {
        msg = 'Too many failed login attempts. Please wait a moment.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setError('Please fill in all required fields.');
      soundFX.playError();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signup(email, password, name);
      handleSuccessfulAuth(name);
    } catch (err: any) {
      soundFX.playError();
      let msg = err?.message || 'Failed to create account.';
      if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    soundFX.playClick();
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      handleSuccessfulAuth('ECO EXPLORER');
    } catch (err: any) {
      soundFX.playError();
      setError(err?.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    soundFX.playClick();
    router.push('/desktop');
  };

  const handleEnterWorld = () => {
    soundFX.playCartridgeSelect();
    router.push('/desktop');
  };

  const handleDownload = () => {
    downloadPassportPng(passportConfig);
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle Terminal CLI Inputs
  const handleTermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = termInput.trim().toLowerCase();
    if (!cmd) return;

    soundFX.playClick();
    setTermMessages((prev) => [...prev, { sender: 'user', text: termInput }]);
    setTermInput('');

    if (cmd === 'clear') {
      setTermMessages([{ sender: 'bot', text: 'Terminal buffer cleared.' }]);
      return;
    }
    if (cmd === 'guest' || cmd === 'explore') {
      setTermMessages((prev) => [...prev, { sender: 'bot', text: 'Passport verified. Welcome, Guest Explorer.' }]);
      setTimeout(() => router.push('/desktop'), 600);
      return;
    }
    if (cmd === 'help') {
      setTermMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Commands: "login", "signup", "google", "guest", "clear", "help"' },
      ]);
      return;
    }
    if (cmd === 'login' || cmd === 'signin') {
      switchMode('signin');
      return;
    }
    if (cmd === 'signup' || cmd === 'register') {
      switchMode('signup');
      return;
    }

    setTermMessages((prev) => [
      ...prev,
      { sender: 'bot', text: `Unknown command: "${cmd}". Type "help" or "guest".` },
    ]);
  };

  // Active theme properties
  const activeTheme = PASSPORT_THEMES[passportConfig.themeId] || PASSPORT_THEMES.emerald;

  const ecoTicketTexture = {
    engine: 'generative',
    colorBack: activeTheme.colorBack,
    colorFront: activeTheme.colorFront,
    colorHighlight: activeTheme.colorHighlight,
    shape: 'warp',
    type: 'random',
    size: 0.6,
    colorSteps: 4,
    originalColors: true,
    scale: 1.1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    speed: 0.35,
  };

  const ecoTicketLayout = {
    padding: 57 / 741,
    labelTop: 58 / 741,
    labelSize: 18 / 741,
    labelLead: 26 / 741,
    labelTracking: 0.02,
    nameTop: 185 / 741,
    nameSize: 58 / 741,
    nameLead: 60 / 741,
    nameTracking: -0.01,
    footerTop: 348 / 741,
    footerSize: 18 / 741,
    footerTracking: 0.02,
    stubSize: 62 / 741,
    stubTracking: 0,
    stubOpacity: 0.9,
    watermarkSize: 140 / 741,
    watermarkOpacity: 0.55,
    watermarkColor: activeTheme.watermarkColor,
    inkColor: activeTheme.inkColor,
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030708] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-x-hidden select-none">
      
      {/* ─── Interactive DotGrid Background ─── */}
      <div className="absolute inset-0 pointer-events-auto z-0 opacity-40 print:hidden">
        <DotGrid
          dotSize={2.8}
          gap={24}
          baseColor="rgba(16, 185, 129, 0.16)"
          activeColor="#10b981"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={600}
          returnDuration={1.2}
        />
      </div>

      {/* Atmospheric Radial Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_65%)] print:hidden" />

      {/* ─── STATE A: "HERE IS YOUR PASSPORT TO EXPLORE ECOQUEST" CELEBRATION SCREEN ─── */}
      {passportMinted ? (
        <div
          ref={celebrationRef}
          className="relative z-20 flex flex-col items-center justify-center space-y-5 max-w-2xl text-center animate-in zoom-in-95 duration-200"
        >
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
              Here is Your Passport to Explore EcoQuest
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Your official credentials have been registered into the Gaia network. Collect points, preserve biomes, and climb the planetary leaderboard.
            </p>
          </div>

          {/* 3D Tilting Minted Passport */}
          <div className="relative group cursor-pointer py-1">
            <AdmitOneTicket
              name={passportConfig.name || 'EXPLORER'}
              presenter="ECOQUEST // GAIA PROTOCOL"
              event={passportConfig.rank}
              venue="GAIA KNOWLEDGE ARCHIVE"
              dates={passportConfig.dates}
              stubText={passportConfig.stubText}
              watermark={passportConfig.watermark}
              width={windowWidthScale()}
              texture={ecoTicketTexture}
              layout={ecoTicketLayout}
            />
          </div>

          {/* Passport Customization & Export Toolbar */}
          <div className="flex items-center justify-center gap-2 print:hidden">
            <button
              onClick={() => {
                soundFX.playClick();
                setIsCustomizerOpen(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customize</span>
            </button>

            <button
              onClick={() => {
                playShutterSound();
                handleDownload();
              }}
              className="py-2 px-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClick();
                handlePrint();
              }}
              className="py-2 px-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>
          </div>

          {/* Action Button: Enter Environment */}
          <div className="w-full max-w-md space-y-3 pt-1 print:hidden">
            <button
              onClick={handleEnterWorld}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm font-sans flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <span>Enter EcoQuest Environment</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session encrypted with Firebase Security Guard</span>
            </div>
          </div>
        </div>
      ) : (
        /* ─── STATE B: AUTHENTICATION PORTAL (PASSPORT + GLASS TERMINAL) ─── */
        <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 my-auto">
          
          {/* Left Side: 3D Dithering Live Passport Showcase */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative group cursor-pointer">
              <AdmitOneTicket
                name={passportConfig.name || 'EXPLORER'}
                presenter="ECOQUEST // GAIA PROTOCOL"
                event={passportConfig.rank}
                venue="GAIA KNOWLEDGE ARCHIVE"
                dates={passportConfig.dates}
                stubText={passportConfig.stubText}
                watermark={passportConfig.watermark}
                width={windowWidthScale()}
                texture={ecoTicketTexture}
                layout={ecoTicketLayout}
              />
            </div>

            {/* Quick Passport Customization & Download Bar */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setIsCustomizerOpen(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customize Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playShutterSound();
                  handleDownload();
                }}
                className="py-1.5 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Save PNG</span>
              </button>
            </div>
          </div>

          {/* Right Side: Glassmorphic Auth Terminal Card */}
          <div
            ref={cardRef}
            className="w-full max-w-md bg-[#0c1017]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden font-sans"
          >
            {/* Window Top Bar */}
            <div className="px-5 py-3.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="font-mono text-xs font-bold text-zinc-300 tracking-wider">
                  Firebase // Explorer Authentication
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="p-4 pb-0">
              <div className="grid grid-cols-3 gap-1 bg-zinc-950/70 p-1 rounded-2xl border border-zinc-800/70 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>Register</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('terminal')}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'terminal'
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>CLI</span>
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode 1: Sign In Form */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="p-5 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Explorer Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="explorer@ecoquest.world"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer disabled:opacity-50 mt-1"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to EcoQuest'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Google Sign In Option */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-sans flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span className="font-bold text-white">G</span>
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* Mode 2: Create Account Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="p-5 space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Explorer Codename / Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Captain Gaia"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-sans uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="explorer@ecoquest.world"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Set Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-sans flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer disabled:opacity-50 mt-1"
                >
                  <span>{loading ? 'Minting Passport...' : 'Create Account & Mint Passport'}</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Mode 3: Terminal Mode */}
            {mode === 'terminal' && (
              <div className="p-5 space-y-3.5">
                <div className="bg-black/80 rounded-2xl p-4 border border-zinc-800 font-mono text-[11px] h-44 overflow-y-auto space-y-2 text-zinc-300">
                  {termMessages.map((msg, i) => (
                    <div key={i} className={msg.sender === 'bot' ? 'text-emerald-400' : 'text-sky-300'}>
                      <span className="text-zinc-600 mr-1.5">{msg.sender === 'bot' ? 'gaia>' : 'user>'}</span>
                      <span>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={termEndRef} />
                </div>

                <form onSubmit={handleTermSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    placeholder="Type 'login', 'signup', or 'guest'..."
                    className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono text-xs cursor-pointer border border-zinc-700"
                  >
                    SEND
                  </button>
                </form>
              </div>
            )}

            {/* Instant Guest Access Option */}
            <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-2">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explore as Guest (No Account Required)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ─── Interactive Passport Customizer Modal ─── */}
      <PassportCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={passportConfig}
        onChange={setPassportConfig}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
    </div>
  );
}

function windowWidthScale() {
  if (typeof window === 'undefined') return 520;
  if (window.innerWidth < 640) return Math.min(340, window.innerWidth - 32);
  if (window.innerWidth < 1024) return 440;
  return 520;
}
