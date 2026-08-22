'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { RetroDvdTv } from '@/components/ui/retro-dvd-tv';
import DotGrid from '@/components/ui/DotGrid';
import anime from '@/lib/anime';

export function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('CALIBRATING NEURAL LINK...');
  const prevPathRef = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);

  const loadingPhrases = [
    'CALIBRATING GAIA ARCHIVE...',
    'SYNCHRONIZING ECO-MATRIX...',
    'INITIALIZING 3D ENGINE...',
    'CONNECTING BIOLUMINESCENT THREADS...',
    'OPTIMIZING KNOWLEDGE NODES...',
  ];

  useEffect(() => {
    // Check if route changed
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;

      const randomPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
      setLoadingText(randomPhrase);
      setIsVisible(true);

      // Animate entry with smooth cubic easing
      if (overlayRef.current) {
        anime({
          targets: overlayRef.current,
          opacity: [0, 1],
          scale: [0.98, 1],
          duration: 180,
          easing: 'easeOutCubic',
        });
      }

      // Keep loader displayed for calibrated duration (~650ms) to allow heavy Three.js/WebGL canvases to settle
      const timer = setTimeout(() => {
        if (overlayRef.current) {
          anime({
            targets: overlayRef.current,
            opacity: [1, 0],
            scale: [1, 1.01],
            duration: 220,
            easing: 'easeInOutQuad',
            complete: () => {
              setIsVisible(false);
            },
          });
        } else {
          setIsVisible(false);
        }
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-[#030609]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-4 pointer-events-auto select-none font-sans"
    >
      {/* Subtle DotGrid background effect */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-25">
        <DotGrid
          dotSize={2}
          gap={24}
          baseColor="rgba(16, 185, 129, 0.15)"
          activeColor="#10b981"
          proximity={80}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-lg w-full">
        {/* Retro DVD CRT Television Component */}
        <RetroDvdTv
          width="min(24rem, 88vw)"
          logoText="ECO"
          speed={4.5}
          color="#10b981"
          colorCycle={true}
        />

        {/* Retro Status Bar with vibrant Emerald & Cyan gradients */}
        <div className="w-full max-w-[280px] sm:max-w-xs space-y-2 text-center">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#10b981]" />
              <span>{loadingText}</span>
            </span>
            <span className="text-emerald-300 font-mono">100%</span>
          </div>

          <div className="w-full h-1.5 bg-zinc-900/90 rounded-full overflow-hidden border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
