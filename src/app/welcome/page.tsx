'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Leaf, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import anime from '@/lib/anime';
import DotGrid from '@/components/ui/DotGrid';

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
      className="relative w-screen h-screen bg-[#06080c] text-zinc-100 overflow-hidden flex flex-col justify-between font-mono select-none"
    >
      {/* Background Interactive DotGrid from React Bits */}
      <DotGrid
        dotSize={3}
        gap={26}
        baseColor="rgba(16, 185, 129, 0.14)"
        activeColor="#10b981"
        proximity={140}
        shockRadius={240}
        shockStrength={5}
        returnDuration={1.3}
        className="opacity-75"
      />

      {/* Top Meta Header */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between text-[11px] text-zinc-500 tracking-widest uppercase pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-400 font-bold">ECOQUEST // SYS 2.6</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-zinc-600">
          <span>KNOWLEDGE MESH // ONLINE</span>
          <span>EST. 2026</span>
        </div>
      </header>

      {/* Center Hero Card */}
      <main
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-xl mx-auto px-6 space-y-8"
      >
        {/* Emblem */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <Leaf className="w-6 h-6" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-sans uppercase">
            EcoQuest
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wider max-w-md mx-auto leading-relaxed">
            The Planetary Sustainability Computing Environment.
          </p>
        </div>

        {/* User Session Info if authenticated */}
        {user && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-400">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Session: <strong className="text-white">{user.name || user.email}</strong></span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-sm">
          <button
            onClick={() => handleEnter('/desktop')}
            disabled={isTransitioning}
            className="w-full py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#06080c] font-bold text-xs tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{user ? 'Enter Environment' : 'Initialize Session'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {!user && (
            <button
              onClick={() => handleEnter('/login')}
              disabled={isTransitioning}
              className="w-full py-3 px-6 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Micro note */}
        <p className="text-[10px] text-zinc-600 tracking-wider">
          Explore as guest or sign in to persist achievements and rankings.
        </p>
      </main>

      {/* Footer Meta */}
      <footer className="relative z-10 p-6 sm:p-8 flex items-center justify-between text-[10px] text-zinc-600 tracking-widest uppercase pointer-events-none">
        <span>EARTH // BIOSPHERE INTERFACE</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" /> SECURE GAIA CLIENT
        </span>
      </footer>
    </div>
  );
}
