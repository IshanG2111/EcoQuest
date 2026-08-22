'use client';

import React, { useState } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import {
  Flame,
  Star,
  Award,
  Sparkles,
  ChevronRight,
  Shield,
  TrendingUp,
  Zap,
  BookOpen,
  Gamepad2,
  Compass,
  Sliders,
  Download,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Desktop } from '@/components/desktop';
import { useAuth, AuthGuard } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { AdmitOneTicket, playShutterSound } from '@/components/ui/admit-one-ticket';
import { soundFX } from '@/lib/audio-fx';
import {
  PassportConfig,
  PASSPORT_THEMES,
  PassportCustomizerModal,
  loadSavedPassportConfig,
  savePassportConfig,
  downloadPassportPng,
} from '@/components/passport/PassportCustomizerModal';

// XP level calculation
function xpPercent(points: number) {
  const level = Math.floor(points / 500) + 1;
  const levelMin = (level - 1) * 500;
  const levelMax = level * 500;
  return { level, pct: Math.round(((points - levelMin) / (levelMax - levelMin)) * 100), levelMax };
}

const LEVEL_NAMES = [
  'Seedling',
  'Sprout',
  'Sapling',
  'Green Explorer',
  'Forest Ranger',
  'Earth Guardian',
  'Eco Hero',
  'Gaia Champion',
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { progress, isLoading } = useUserProgress();

  const username = user?.name ?? 'Explorer';
  const pts = progress?.points ?? 0;
  const streak = progress?.streak ?? 0;
  const badges = progress?.badges ?? [];
  const { level, pct, levelMax } = xpPercent(pts);
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? 'Eco Warrior';

  // Passport Configuration & Customization State (Persistent in localStorage)
  const [passportConfig, setPassportConfig] = useState<PassportConfig>(() => loadSavedPassportConfig(username));
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Active theme properties
  const activeTheme = PASSPORT_THEMES[passportConfig.themeId] || PASSPORT_THEMES.emerald;

  const dashTicketTexture = {
    engine: 'generative',
    colorBack: activeTheme.colorBack,
    colorFront: activeTheme.colorFront,
    colorHighlight: activeTheme.colorHighlight,
    shape: 'warp',
    type: 'random',
    size: 0.6,
    colorSteps: 4,
    originalColors: true,
    scale: 1.15,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    speed: 0.35,
  };

  const dashTicketLayout = {
    padding: 57 / 741,
    labelTop: 58 / 741,
    labelSize: 18 / 741,
    labelLead: 26 / 741,
    labelTracking: 0.02,
    nameTop: 185 / 741,
    nameSize: 56 / 741,
    nameLead: 58 / 741,
    nameTracking: -0.01,
    footerTop: 348 / 741,
    footerSize: 18 / 741,
    footerTracking: 0.02,
    stubSize: 60 / 741,
    stubTracking: 0,
    stubOpacity: 0.9,
    watermarkSize: 140 / 741,
    watermarkOpacity: 0.55,
    watermarkColor: activeTheme.watermarkColor,
    inkColor: activeTheme.inkColor,
  };

  const handleDownload = () => {
    downloadPassportPng(passportConfig);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthGuard allowGuest={false}>
      <Desktop>
        <div className="dash-redesign space-y-6 max-w-6xl mx-auto font-sans pb-10">
          
          {/* ── HERO WITH 3D ADMIT-ONE TICKET SHOWCASE ── */}
          <section className="relative overflow-hidden rounded-3xl bg-[#0c1017]/95 border border-zinc-800/90 shadow-2xl p-6 md:p-8 backdrop-blur-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              
              {/* Left Greeting & Level Telemetry */}
              <div className="space-y-4 max-w-xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>GAIA CITIZEN · LEVEL {level}</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">ID: {user?.id?.slice(0, 8) || 'ONLINE'}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Welcome back, <span className="text-emerald-400 font-mono">{passportConfig.name || username}</span>
                </h1>

                <p className="text-zinc-400 text-sm leading-relaxed">
                  Planetary Explorer Passport active. Continue your quests, preserve biomes, and expand the ecological knowledge graph.
                </p>

                {/* Level Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[11px]">
                        {level}
                      </div>
                      <span className="font-bold text-white font-mono">{levelName}</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">
                      {pts.toLocaleString()} / {levelMax.toLocaleString()} XP
                    </span>
                  </div>

                  <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: 3D Tilting Admit-One Passport Badge */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative group cursor-pointer">
                  <AdmitOneTicket
                    name={passportConfig.name || username.toUpperCase()}
                    presenter="ECOQUEST // GAIA PROTOCOL"
                    event={passportConfig.rank}
                    venue={`RANK: ${levelName.toUpperCase()}`}
                    dates={`LEVEL 0${level} · ${pts.toLocaleString()} XP`}
                    stubText="SECTOR 7 // ACTIVE"
                    watermark={passportConfig.watermark}
                    width={windowWidthDashboard()}
                    texture={dashTicketTexture}
                    layout={dashTicketLayout}
                  />
                </div>

                {/* Passport Action Toolbar */}
                <div className="flex items-center justify-center gap-2 print:hidden">
                  <button
                    onClick={() => {
                      soundFX.playClick();
                      setIsCustomizerOpen(true);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={() => {
                      playShutterSound();
                      handleDownload();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFX.playClick();
                      handlePrint();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Eco Points */}
            <div className="p-5 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/80 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">ECO POINTS</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Star className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {isLoading ? <Skeleton className="h-8 w-24 bg-zinc-800" /> : pts.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Earn points by completing ecological quizzes and minigames.
              </p>
            </div>

            {/* Daily Streak */}
            <div className="p-5 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/80 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">DAY STREAK</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : `${streak} Days`}
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Log in daily to keep your conservation multiplier active.
              </p>
            </div>

            {/* Badges Count */}
            <div className="p-5 rounded-2xl bg-[#0c1017]/95 border border-zinc-800/80 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">MINTED BADGES</span>
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {isLoading ? <Skeleton className="h-8 w-16 bg-zinc-800" /> : badges.length}
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Unlocked through achievements and planetary research.
              </p>
            </div>
          </div>

          {/* ── QUICK LAUNCH NAVIGATION ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/play"
              className="group p-5 rounded-2xl bg-[#0c1017]/90 hover:bg-[#101622] border border-zinc-800/80 hover:border-emerald-500/40 transition shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">Play Games</h2>
                  <p className="text-[11px] text-zinc-400">Arcade & 3D Quests</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/quizzes"
              className="group p-5 rounded-2xl bg-[#0c1017]/90 hover:bg-[#101622] border border-zinc-800/80 hover:border-sky-500/40 transition shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">Quizzes</h2>
                  <p className="text-[11px] text-zinc-400">Knowledge Challenges</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/ecograph"
              className="group p-5 rounded-2xl bg-[#0c1017]/90 hover:bg-[#101622] border border-zinc-800/80 hover:border-teal-500/40 transition shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">EcoGraph</h2>
                  <p className="text-[11px] text-zinc-400">3D Relational Explorer</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

        </div>
      </Desktop>

      {/* ─── Interactive Passport Customizer Modal ─── */}
      <PassportCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={passportConfig}
        onChange={(cfg) => {
          setPassportConfig(cfg);
          savePassportConfig(cfg);
        }}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
    </AuthGuard>
  );
}

function windowWidthDashboard() {
  if (typeof window === 'undefined') return 480;
  if (window.innerWidth < 640) return Math.min(330, window.innerWidth - 48);
  if (window.innerWidth < 1024) return 420;
  return 480;
}
