'use client';

import React from 'react';
import { RetroDvdTv } from '@/components/ui/retro-dvd-tv';

export const PageTransitionLoader: React.FC<{ message?: string }> = ({
  message = 'SYNCHRONIZING GAIA ARCHIVE...',
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#030609]/96 backdrop-blur-2xl flex flex-col items-center justify-center font-mono select-none p-4 animate-in fade-in duration-150">
      <div className="flex flex-col items-center justify-center space-y-4 max-w-sm w-full">
        {/* Retro DVD CRT Television Display */}
        <RetroDvdTv
          width="min(22rem, 85vw)"
          logoText="ECO"
          speed={4}
          color="#10b981"
          colorCycle={true}
        />

        {/* Minimal High-Tech Telemetry Status */}
        <div className="w-full max-w-xs space-y-2 text-center">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-bold tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#10b981]" />
              <span>{message}</span>
            </span>
            <span className="text-emerald-400 font-mono">100%</span>
          </div>

          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-emerald-500/20">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTransitionLoader;
