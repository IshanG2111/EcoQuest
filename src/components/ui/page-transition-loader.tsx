'use client';

import React, { useEffect, useState } from 'react';
import { RetroDvdTv } from '@/components/ui/retro-dvd-tv';

export const PageTransitionLoader: React.FC<{ message?: string }> = ({
  message = 'SYNCHRONIZING GAIA ARCHIVE...',
}) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1500;
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-[#030609]/98 backdrop-blur-2xl flex flex-col items-center justify-center font-sans select-none p-4 animate-in fade-in duration-200">
      <div className="flex flex-col items-center justify-center space-y-5 max-w-sm w-full">
        {/* Retro DVD CRT Television Display */}
        <RetroDvdTv
          width="min(22rem, 85vw)"
          logoText="ECO"
          speed={3.8}
          color="#10b981"
          colorCycle={true}
        />

        {/* Minimal High-Tech Telemetry Status */}
        <div className="w-full max-w-[300px] sm:max-w-xs space-y-2.5 text-center">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold tracking-wider">
            <span className="flex items-center gap-1.5 truncate max-w-[230px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981] flex-shrink-0" />
              <span className="truncate">{message}</span>
            </span>
            <span className="text-emerald-300 font-mono pl-2">{progress}%</span>
          </div>

          <div className="w-full h-2 bg-zinc-900/90 rounded-full overflow-hidden border border-emerald-500/20 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_#10b981]"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTransitionLoader;

