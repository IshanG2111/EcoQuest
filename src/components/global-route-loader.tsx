'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { RetroDvdTv } from '@/components/ui/retro-dvd-tv';
import DotGrid from '@/components/ui/DotGrid';
import anime from '@/lib/anime';

export function GlobalRouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('INITIALIZING OS ENVIRONMENT...');
  const prevPathRef = useRef<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const loadingPhrases = [
    'INITIALIZING OS ENVIRONMENT...',
    'CALIBRATING GAIA ARCHIVE...',
    'SYNCHRONIZING ECO-MATRIX...',
    'INITIALIZING 3D ENGINE...',
    'CONNECTING BIOLUMINESCENT THREADS...',
    'OPTIMIZING KNOWLEDGE NODES...',
    'FINALIZING SUBSYSTEMS...',
  ];

  const triggerLoader = (isInitial: boolean) => {
    // Pick initial text
    const initialText = isInitial
      ? 'BOOTING GAIA ARCHIVE OS...'
      : loadingPhrases[Math.floor(Math.random() * (loadingPhrases.length - 2)) + 1];

    setLoadingText(initialText);
    setProgress(0);
    setIsVisible(true);

    // Fade in overlay smoothly
    if (overlayRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        scale: [0.98, 1],
        duration: 250,
        easing: 'easeOutCubic',
      });
    }

    // Smooth progress counter over ~1500ms
    const totalDuration = isInitial ? 1800 : 1500;
    const startTime = performance.now();

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / totalDuration, 1);

      // Ease out quartic for natural, satisfying deceleration into 100%
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentVal = Math.min(100, Math.round(easedProgress * 100));
      setProgress(currentVal);

      // Dynamic text update as progress advances
      if (currentVal > 30 && currentVal < 65) {
        setLoadingText(isInitial ? 'CALIBRATING DITHER SHADERS...' : 'SYNCHRONIZING ECO-MATRIX...');
      } else if (currentVal >= 65 && currentVal < 90) {
        setLoadingText(isInitial ? 'LINKING BIOLUMINESCENT THREADS...' : 'OPTIMIZING KNOWLEDGE NODES...');
      } else if (currentVal >= 90) {
        setLoadingText('SYSTEMS ONLINE & READY');
      }

      if (progressRatio < 1) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Complete - hold briefly at 100% then smoothly fade out
        setTimeout(() => {
          if (overlayRef.current) {
            anime({
              targets: overlayRef.current,
              opacity: [1, 0],
              scale: [1, 1.015],
              duration: 350,
              easing: 'easeInOutQuad',
              complete: () => {
                setIsVisible(false);
              },
            });
          } else {
            setIsVisible(false);
          }
        }, 120);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    // Initial mount or route change trigger
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      triggerLoader(true);
    } else if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      triggerLoader(false);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [pathname, searchParams]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-[#030609]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 pointer-events-auto select-none font-sans"
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

      <div className="relative z-10 flex flex-col items-center justify-center space-y-5 max-w-lg w-full">
        {/* Retro DVD CRT Television Component */}
        <RetroDvdTv
          width="min(24rem, 88vw)"
          logoText="ECO"
          speed={3.8}
          color="#10b981"
          colorCycle={true}
        />

        {/* Retro Status Bar with vibrant Emerald & Cyan gradients */}
        <div className="w-full max-w-[300px] sm:max-w-xs space-y-2.5 text-center">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold tracking-wider">
            <span className="flex items-center gap-1.5 truncate max-w-[230px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#10b981] flex-shrink-0" />
              <span className="truncate">{loadingText}</span>
            </span>
            <span className="text-emerald-300 font-mono pl-2">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-zinc-900/90 rounded-full overflow-hidden border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_#10b981]"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

