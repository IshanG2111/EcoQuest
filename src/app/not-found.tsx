'use client';

import React from 'react';
import Link from 'next/link';
import { RetroDvdTv } from '@/components/ui/retro-dvd-tv';
import DotGrid from '@/components/ui/DotGrid';
import { ArrowLeft, Home, Compass, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-[#05070a] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden select-none">
      
      {/* ── Subtle DotGrid Backdrop ── */}
      <div className="absolute inset-0 pointer-events-auto z-0 opacity-30">
        <DotGrid
          dotSize={2.8}
          gap={24}
          baseColor="rgba(16, 185, 129, 0.12)"
          activeColor="#10b981"
          proximity={110}
          shockRadius={240}
          shockStrength={4.5}
          resistance={600}
          returnDuration={1.2}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 max-w-xl text-center">
        
        {/* Retro Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs tracking-wider">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>ERROR 404 // COORDINATE UNRESOLVED</span>
        </div>

        {/* ── Retro CRT Television with 404 Logo ── */}
        <div className="relative group cursor-pointer">
          <RetroDvdTv
            width="min(28rem, 88vw)"
            logoText="404"
            speed={5}
            color="#ef4444"
            colorCycle={true}
          />
        </div>

        {/* Description */}
        <div className="space-y-2 max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Planetary Sector Not Found
          </h1>
          <p className="text-zinc-400 text-xs leading-relaxed font-sans">
            The telemetry coordinates you navigated to do not exist in the Gaia knowledge database or have been archived.
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/desktop"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-sans shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Return to Desktop</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Welcome Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
