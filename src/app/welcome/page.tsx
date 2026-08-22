'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Leaf, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import anime from '@/lib/anime';
import DitherCanvas from '@/components/ui/DitherCanvas';

export default function WelcomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ─── Click to Reveal Transition into Desktop ─────────────────────────────
  const handleEnter = (destination = '/desktop') => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (contentRef.current) {
      anime({
        targets: contentRef.current,
        opacity: [1, 0],
        scale: [1, 1.05],
        translateY: [0, -20],
        filter: ['blur(0px)', 'blur(10px)'],
        easing: 'easeInOutCubic',
        duration: 400,
        complete: () => {
          router.push(destination);
        },
      });
    } else {
      router.push(destination);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-[#02080a] text-zinc-100 overflow-hidden flex flex-col justify-between font-mono select-none"
    >
      {/* ── Interactive Dither Background ── */}
      <DitherCanvas
        src="/forest-bg.jpg"
        lensRadius={180}
        className="z-0"
      />

      {/* Dark gradient overlay so text stays readable */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/55 via-black/30 to-black/65 pointer-events-none" />

      {/* Top Meta Header */}
      <header className="relative z-20 p-6 sm:p-8 flex items-center justify-between text-[11px] text-zinc-400 tracking-widest uppercase pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">ECOQUEST // SYS 2.6</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-500">
          <span>KNOWLEDGE MESH // ONLINE</span>
          <span>EST. 2026</span>
        </div>
      </header>

      {/* Center Hero Card */}
      <main
        ref={contentRef}
        className="relative z-20 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-6 space-y-8"
      >
        {/* Emblem */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md">
          <Leaf className="w-6 h-6" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans uppercase drop-shadow-2xl">
            EcoQuest
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-mono tracking-wider max-w-md mx-auto leading-relaxed">
            The Planetary Sustainability Computing Environment.
          </p>
        </div>

        {/* User Session Info if authenticated */}
        {user && (
          <div className="flex items-center gap-2 text-[11px] text-zinc-300">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Session: <strong className="text-white">{user.name || user.email}</strong></span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm">
          <button
            onClick={() => handleEnter('/desktop')}
            disabled={isTransitioning}
            className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#06080c] font-bold text-xs tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{user ? 'Enter Environment' : 'Initialize Session'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {!user && (
            <button
              onClick={() => handleEnter('/login')}
              disabled={isTransitioning}
              className="w-full py-3 px-6 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 backdrop-blur-md border border-zinc-700/60 hover:border-zinc-600 text-zinc-200 hover:text-white text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Micro note */}
        <p className="text-[10px] text-zinc-500 tracking-wider">
          Move your cursor to reveal the forest. Explore as guest or sign in to persist achievements.
        </p>
      </main>

      {/* Footer Meta */}
      <footer className="relative z-20 p-6 sm:p-8 flex items-center justify-between text-[10px] text-zinc-500 tracking-widest uppercase pointer-events-none">
        <span className="hidden sm:inline">EARTH // BIOSPHERE INTERFACE</span>
        <Link 
          href="/privacy" 
          className="pointer-events-auto hover:text-emerald-400 text-zinc-400 transition underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" /> SECURE GAIA CLIENT
        </span>
      </footer>
    </div>
  );
}
