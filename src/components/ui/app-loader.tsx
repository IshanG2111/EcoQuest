'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface AppLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export function AppLoader({
  title = 'PREPARING_ENVIRONMENT',
  subtitle = 'SYNCHRONIZING_ECO_DATA...',
  fullScreen = true,
}: AppLoaderProps) {
  return (
    <div
      className={[
        'relative overflow-hidden bg-background text-foreground font-headline',
        fullScreen ? 'flex min-h-screen w-full items-center justify-center' : 'flex min-h-[280px] w-full items-center justify-center',
      ].join(' ')}
    >
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative z-10 mx-4 w-full max-w-sm p-8 text-left border-2 border-primary/30 bg-card shadow-[8px_8px_0px_rgba(0,0,0,0.2)]">
        <div className="mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary animate-pulse flex-shrink-0 flex items-center justify-center text-primary-foreground text-2xl font-bold">
            !
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] text-primary opacity-70 mb-1 uppercase">SYSTEM_STATUS</div>
            <h2 className="text-sm tracking-widest uppercase">{title}</h2>
          </div>
        </div>

        <p className="mb-8 text-[10px] text-foreground/60 tracking-wider h-8">{subtitle}</p>

        <div className="space-y-2">
          <div className="flex justify-between text-[8px] tracking-[0.2em] text-primary/70">
            <span>PROGRESS_DATA</span>
            <span className="animate-pulse">LOADING...</span>
          </div>
          <div className="h-6 w-full border-2 border-primary/20 p-1">
            <div className="h-full bg-primary/40 flex gap-1 overflow-hidden">
               {[...Array(12)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-4 h-full bg-primary" 
                   style={{ 
                     animation: 'pixel-blink 1s steps(2) infinite',
                     animationDelay: `${i * 0.1}s`,
                     opacity: 0.1
                   }} 
                 />
               ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-end">
            <div className="text-[8px] opacity-30">v2.0.4-EVOLVED</div>
            <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
      </div>
    </div>
  );
}
