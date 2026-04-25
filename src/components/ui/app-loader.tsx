'use client';

import { Loader2, Sparkles } from 'lucide-react';

interface AppLoaderProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export function AppLoader({
  title = 'Preparing your EcoQuest experience',
  subtitle = 'Loading your progress, badges, and quests...',
  fullScreen = true,
}: AppLoaderProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 text-emerald-50',
        fullScreen ? 'flex min-h-screen w-full items-center justify-center' : 'flex min-h-[280px] w-full items-center justify-center',
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,rgba(110,231,183,0.35),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(34,211,238,0.35),transparent_35%)]" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/20 bg-black/20 p-8 text-center backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-300/10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-200" />
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 text-emerald-100">
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold tracking-wide">EcoQuest Sync</span>
          <Sparkles className="h-4 w-4" />
        </div>

        <h2 className="text-lg font-bold text-emerald-50">{title}</h2>
        <p className="mt-2 text-sm text-emerald-100/90">{subtitle}</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-emerald-100/20">
          <div className="h-full w-1/3 animate-[loader-slide_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
        </div>
      </div>
    </div>
  );
}
