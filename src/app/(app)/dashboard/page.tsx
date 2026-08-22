'use client';

import React, { useState } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import {
  Flame,
  Star,
  Award,
  ChevronRight,
  BookOpen,
  Gamepad2,
  Compass,
  Sliders,
  Download,
  Printer,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Desktop } from '@/components/desktop';
import { useAuth, AuthGuard } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { AdmitOneTicket, playShutterSound } from '@/components/ui/admit-one-ticket';
import { soundFX } from '@/lib/audio-fx';
import { getAvatarUrl } from '@/lib/utils';
import {
  PassportConfig,
  PASSPORT_THEMES,
  PassportCustomizerModal,
  loadSavedPassportConfig,
  savePassportConfig,
  downloadPassportPng,
} from '@/components/passport/PassportCustomizerModal';

function xpPercent(points: number) {
  const level = Math.floor(points / 500) + 1;
  const levelMin = (level - 1) * 500;
  const levelMax = level * 500;
  return { level, pct: Math.round(((points - levelMin) / (levelMax - levelMin)) * 100), levelMax };
}

const LEVEL_NAMES = [
  'Seedling', 'Sprout', 'Sapling', 'Green Explorer',
  'Forest Ranger', 'Earth Guardian', 'Eco Hero', 'Gaia Champion',
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

  const [passportConfig, setPassportConfig] = useState<PassportConfig>(() => loadSavedPassportConfig(username));
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

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

  const handleDownload = () => downloadPassportPng(passportConfig);
  const handlePrint = () => window.print();

  const displayName = passportConfig.name || username;

  return (
    <AuthGuard allowGuest={false}>
      <Desktop>
        <div className="space-y-6 max-w-5xl mx-auto font-sans pb-10 px-1">

          {/* ── USER IDENTITY HERO ── */}
          <section className="relative overflow-hidden rounded-3xl bg-[#0b0f18] border border-zinc-800/80 shadow-2xl p-6 md:p-8">
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500/8 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700/80 overflow-hidden shadow-xl">
                  <Image
                    src={getAvatarUrl(displayName)}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full"
                    unoptimized
                  />
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0b0f18] flex items-center justify-center text-black font-black text-xs shadow-lg">
                  {level}
                </div>
              </div>

              {/* Name + Level */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
                  Gaia Citizen · {levelName}
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {displayName}
                </h1>
                <p className="text-zinc-500 text-xs">
                  Planetary Explorer · EcoQuest Class of 2026
                </p>

                {/* XP Bar */}
                <div className="pt-2 max-w-sm mx-auto sm:mx-0 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">{pts.toLocaleString()} XP</span>
                    <span className="text-zinc-600">{levelMax.toLocaleString()} XP</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats inline */}
              <div className="flex sm:flex-col gap-3 sm:gap-2 text-center sm:text-right flex-shrink-0">
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-lg font-black text-white font-mono">{pts.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">XP</span>
                </div>
                <div className="w-px sm:w-full sm:h-px bg-zinc-800 hidden sm:block" />
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-lg font-black text-amber-400 font-mono">{streak}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Streak</span>
                </div>
                <div className="w-px sm:w-full sm:h-px bg-zinc-800 hidden sm:block" />
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-lg font-black text-sky-400 font-mono">{badges.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Badges</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3D PLANETARY PASSPORT (FULL WIDTH HERO) ── */}
          <section className="relative overflow-hidden rounded-3xl bg-[#0b0f18] border border-zinc-800/80 shadow-2xl p-6 md:p-8">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              {/* Section label */}
              <div className="w-full flex items-center justify-between">
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                  Planetary Passport
                </p>
                <span className="text-[10px] font-mono text-emerald-500">{passportConfig.rank}</span>
              </div>

              {/* 3D Ticket — center stage */}
              <div className="w-full flex justify-center">
                <AdmitOneTicket
                  name={displayName.toUpperCase()}
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

              {/* Toolbar — clean 3-button row */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => { soundFX.playClick(); setIsCustomizerOpen(true); }}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Customize
                </button>
                <button
                  onClick={() => { playShutterSound(); handleDownload(); }}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  Download PNG
                </button>
                <button
                  onClick={() => { soundFX.playClick(); handlePrint(); }}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Print
                </button>
              </div>
            </div>
          </section>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Eco Points', value: isLoading ? '—' : pts.toLocaleString(), sub: 'Earned from games & quizzes', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Day Streak', value: isLoading ? '—' : `${streak}d`, sub: 'Daily login multiplier', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { label: 'Badges', value: isLoading ? '—' : String(badges.length), sub: 'Planetary achievements', icon: Award, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-[#0b0f18] border border-zinc-800/80 shadow-xl space-y-2">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-xl font-black text-white font-mono">{s.value}</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── QUICK LAUNCH ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: '/play', label: 'Play Games', sub: 'Arcade & 3D Quests', Icon: Gamepad2, color: 'text-emerald-400', border: 'hover:border-emerald-500/40', iconBg: 'bg-emerald-500/10 border-emerald-500/25' },
              { href: '/quizzes', label: 'Quizzes', sub: 'Knowledge Challenges', Icon: BookOpen, color: 'text-sky-400', border: 'hover:border-sky-500/40', iconBg: 'bg-sky-500/10 border-sky-500/25' },
              { href: '/ecograph', label: 'EcoGraph', sub: 'Knowledge Galaxy', Icon: Compass, color: 'text-teal-400', border: 'hover:border-teal-500/40', iconBg: 'bg-teal-500/10 border-teal-500/25' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between p-4 rounded-2xl bg-[#0b0f18] border border-zinc-800/80 ${item.border} hover:bg-zinc-900/60 transition shadow-xl`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform`}>
                    <item.Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{item.label}</div>
                    <div className="text-[11px] text-zinc-500">{item.sub}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

        </div>
      </Desktop>

      <PassportCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={passportConfig}
        onChange={(cfg) => { setPassportConfig(cfg); savePassportConfig(cfg); }}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
    </AuthGuard>
  );
}

function windowWidthDashboard() {
  if (typeof window === 'undefined') return 480;
  if (window.innerWidth < 640) return Math.min(340, window.innerWidth - 40);
  if (window.innerWidth < 1024) return 440;
  return 520;
}
