'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Gamepad2,
  FileQuestion,
  Palette,
  LayoutGrid,
  Settings,
  Power,
  LogIn,
  Network,
  ShieldCheck,
  Users,
  Compass,
  Trophy,
  Volume2,
  VolumeX,
  X,
  User,
  Sparkles,
  ChevronRight,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';
import { useDesktop, WidgetType } from '@/components/desktop-context';
import { soundFX } from '@/lib/audio-fx';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Widgets
import { FactWidget } from '@/components/widgets/FactWidget';
import { DailyBriefingWidget } from '@/components/widgets/DailyBriefingWidget';
import DitherCanvas from '@/components/ui/DitherCanvas';
import { PixelWeatherWidget } from '@/components/widgets/PixelWeatherWidget';
import { EcoNewsWidget } from '@/components/widgets/EcoNewsWidget';
import { EcoTilesCalendarWidget } from '@/components/widgets/EcoTilesCalendarWidget';
import { EcoGardenWidget } from '@/components/widgets/EcoGardenWidget';
import { EcoGraphMiniWidget } from '@/components/widgets/EcoGraphMiniWidget';

import { WidgetShell } from '@/components/widgets/WidgetShell';
import { WidgetDock } from '@/components/widgets/WidgetDock';

import { DailyBriefingIcon, RankingsIcon } from '@/lib/user-data';

const desktopIcons = [
  { href: '/play', label: 'Games', icon: Gamepad2, color: 'text-emerald-400' },
  { href: '/dashboard', label: 'Dashboard', icon: DailyBriefingIcon, color: 'text-sky-400' },
  { href: '/ecograph', label: 'EcoGraph', icon: Network, color: 'text-teal-400' },
  { href: '/leaderboard', label: 'Rankings', icon: RankingsIcon, color: 'text-amber-400' },
  { href: '/quizzes', label: 'Quizzes', icon: FileQuestion, color: 'text-purple-400' },
];

const themes = [
  { name: 'Verdant Grove (Earth)', id: 'the-verdant-grove', color: '#10b981' },
  { name: 'Ember Hearth (Fire)', id: 'the-ember-hearth', color: '#f97316' },
  { name: 'Abyssal Tide (Water)', id: 'the-abyssal-tide', color: '#06b6d4' },
];

const widgetComponents: Record<WidgetType, React.FC<any>> = {
  fact: FactWidget,
  briefing: DailyBriefingWidget,
  weather: PixelWeatherWidget,
  news: EcoNewsWidget,
  calendar: EcoTilesCalendarWidget,
  garden: EcoGardenWidget,
  ecograph: EcoGraphMiniWidget,
};

const widgetTitles: Record<WidgetType, string> = {
  fact: 'Eco Fact',
  briefing: 'Daily Briefing',
  weather: 'Pixel Weather',
  news: 'Eco News Feed',
  calendar: 'Eco Tiles Calendar',
  garden: 'Eco Garden Pet',
  ecograph: 'EcoGraph Knowledge Mini',
};

const getWidgetDefaultPos = (id: WidgetType, width: number) => {
  const isRightSide = width > 1024;
  switch (id) {
    case 'fact':
      return { x: 50, y: 120 };
    case 'weather':
      return { x: 50, y: 350 };
    case 'briefing':
      return { x: 380, y: 120 };
    case 'calendar':
      return { x: 380, y: 350 };
    case 'news':
      return { x: isRightSide ? width - 420 : 700, y: 120 };
    case 'garden':
      return { x: isRightSide ? width - 420 : 700, y: 440 };
    default:
      return { x: 200, y: 200 };
  }
};

export function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const {
    isWidgetDockOpen,
    setIsWidgetDockOpen,
    desktopWidgets,
    toggleWidget
  } = useDesktop();
  const { user, isGuest, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme: activeTheme, setTheme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(1200);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Update clock every minute
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setDate(
        now
          .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .replace(/ /g, '-')
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    soundFX.playClick();
    await logout();
    router.push('/welcome');
  };

  const getStartButtonContent = () => {
    switch (activeTheme) {
      case 'the-ember-hearth':
        return 'HEARTH_CMD';
      case 'the-abyssal-tide':
        return 'TIDE_LINK';
      default:
        return 'VERDANT_SYS';
    }
  };

  const getStartButtonIcon = () => {
    switch (activeTheme) {
      case 'the-ember-hearth':
        return (
          <Image
            src="/vault-tec-logo.svg"
            alt="Fire"
            width={18}
            height={18}
            className="mr-1.5 filter-primary"
          />
        );
      case 'the-abyssal-tide':
        return (
          <Image
            src="/lumon-logo.svg"
            alt="Water"
            width={14}
            height={14}
            className="mr-1.5 filter-primary"
          />
        );
      default:
        return (
          <Image
            src="/tva-logo.svg"
            alt="Earth"
            width={18}
            height={18}
            className="mr-1.5 filter-primary"
          />
        );
    }
  };

  // Get active page label for breadcrumb
  const getPageName = () => {
    if (pathname === '/desktop' || pathname === '/') return null;
    const segment = pathname.split('/').filter(Boolean).pop() || '';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  const pageName = getPageName();

  const toggleSound = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      soundFX.playClick();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans relative select-none bg-[#020508] text-zinc-100">

      {/* Guest banner */}
      {isGuest && (
        <div className="guest-banner z-50">
          <span>Exploring as guest</span>
          <Link href="/login">Create an account to save your progress</Link>
        </div>
      )}

      {/* Desktop Wallpaper — Live Video True-Color Dither */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#020508]">
        {/* Real-time Meticulous True-Color Dither Shader over desktop.mp4 */}
        <DitherCanvas
          src="/videos/desktop.mp4"
          colorMode="rgb"
          lensRadius={220}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/15 backdrop-blur-[0.5px]" />
      </div>

      {/* Desktop Workspace */}
      <div className="flex-1 relative overflow-hidden z-20">
        
        {/* 1. Widgets Layer (z-10) — hidden on mobile */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          {desktopWidgets.map((widgetId) => {
            const Component = widgetComponents[widgetId];
            if (!Component) return null;
            const defaultPos = getWidgetDefaultPos(widgetId, windowWidth);
            return (
              <WidgetShell
                key={widgetId}
                id={widgetId}
                title={widgetTitles[widgetId]}
                onClose={() => toggleWidget(widgetId)}
                defaultX={defaultPos.x}
                defaultY={defaultPos.y}
              >
                <Component />
              </WidgetShell>
            );
          })}
        </div>

        {/* 2. Icons Grid Layer (z-20) */}
        <div className="absolute inset-0 p-4 z-20 pointer-events-none">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3 sm:gap-4 pointer-events-none max-w-full">
            {desktopIcons.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link href={item.href} key={item.label} className="flex-shrink-0 pointer-events-auto">
                  <div className={`flex flex-col items-center justify-center gap-1.5 text-white text-center no-underline cursor-pointer hover:bg-emerald-500/20 active:scale-95 hover:border-emerald-500/50 hover:shadow-lg border border-transparent p-3 rounded-2xl h-full transition-all duration-150 group backdrop-blur-[4px] bg-black/15 hover:bg-black/35 ${isActive ? 'bg-emerald-500/20 border-emerald-500/60 shadow-md' : ''}`}>
                    <item.icon className={`w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-150 ${isActive ? item.color : 'text-zinc-200'}`} />
                    <span className="text-xs sm:text-sm leading-tight font-sans font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Utility: Themes — cycle on click */}
            <div
              onClick={() => {
                soundFX.playClick();
                setTheme(
                  activeTheme === 'the-verdant-grove'
                    ? 'the-ember-hearth'
                    : activeTheme === 'the-ember-hearth'
                    ? 'the-abyssal-tide'
                    : 'the-verdant-grove'
                );
              }}
              className="flex-shrink-0 cursor-pointer pointer-events-auto"
            >
              <div className="flex flex-col items-center justify-center gap-1.5 text-white text-center no-underline hover:bg-emerald-500/20 active:scale-95 hover:border-emerald-500/50 hover:shadow-lg border border-transparent p-3 rounded-2xl h-full transition-all duration-150 group backdrop-blur-[4px] bg-black/15 hover:bg-black/35">
                <Palette className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-150 text-zinc-200" />
                <span className="text-xs sm:text-sm leading-tight font-sans font-medium">Theme</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Window Container Layer (z-30) */}
        <div className="absolute inset-0 p-2 sm:p-4 z-30 pointer-events-none">
          {children}
        </div>
      </div>

      {/* ─── 4. HIGH-TECH RETRO OS TASKBAR (z-40) ─── */}
      <footer className="w-full h-12 bg-[#0a0e14]/92 backdrop-blur-2xl border-t border-zinc-800/90 flex items-center justify-between px-2.5 sm:px-4 z-40 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] font-sans">
        
        {/* Left Section: Start Button + Quick Launch Apps */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* OS Start Menu Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="font-bold text-xs h-8 px-2.5 sm:px-3.5 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all font-mono tracking-wider flex items-center gap-1.5 cursor-pointer rounded-xl"
              >
                {getStartButtonIcon()}
                <span className="font-bold">{getStartButtonContent()}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="w-72 sm:w-80 bg-[#0c1017]/98 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-2.5 font-sans text-xs text-zinc-200 animate-in zoom-in-95 duration-100"
            >
              {/* User Profile Summary Header */}
              {user ? (
                <div className="p-3 mb-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/30 bg-zinc-900 flex-shrink-0">
                      <Image
                        src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${encodeURIComponent((user.name || 'Explorer').trim())}&backgroundColor=0f172a&radius=50`}
                        alt={user.name || 'Explorer'}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{user.name || 'Explorer'}</div>
                      <div className="text-[10px] font-mono text-emerald-400 truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Online · Verified</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/account-settings')}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-3 mb-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px] font-mono">Guest Explorer Mode</span>
                  <button
                    onClick={() => router.push('/login')}
                    className="py-1 px-2.5 rounded-lg bg-emerald-500 text-black font-bold text-[11px] hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <DropdownMenuLabel className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
                Planetary Applications
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => router.push('/play')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Arcade & Missions</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/ecograph')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
              >
                <Network className="w-4 h-4 text-teal-400" />
                <span className="font-medium">EcoGraph Knowledge Web</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
              >
                <DailyBriefingIcon className="w-4 h-4 text-sky-400" />
                <span className="font-medium">Citizen Dashboard</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/quizzes')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
              >
                <FileQuestion className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Ecological Quizzes</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/leaderboard')}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
              >
                <RankingsIcon className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Global Rankings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />

              <DropdownMenuLabel className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-2 py-1">
                System Customization
              </DropdownMenuLabel>

              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/90 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span>{t.name}</span>
                  </div>
                  {activeTheme === t.id && <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>}
                </DropdownMenuItem>
              ))}

              {user && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />

                  {Boolean(
                    user.role === 'SUPER_ADMIN' ||
                    user.role === 'ADMIN' ||
                    ['admin.master@ecoquest.org', 'ishan.ghosh2004@gmail.com', 'ishan.ghosh@ecoquest.com'].includes((user.email || '').toLowerCase().trim())
                  ) && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push('/admin/ecograph')}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold">Knowledge Studio (Admin)</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push('/admin/users')}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sky-400 hover:bg-sky-500/10 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-sky-400" />
                        <span className="font-bold">User Management (Admin)</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                    <span className="font-semibold">Log Out / Terminate Session</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Pinned Taskbar Apps (Desktop View) */}
          <div className="hidden sm:flex items-center gap-1 pl-1">
            {desktopIcons.map((app) => {
              const isActive = pathname.startsWith(app.href);
              return (
                <Link
                  key={app.href}
                  href={app.href}
                  onClick={() => soundFX.playClick()}
                  className={`p-1.5 rounded-xl border transition-all duration-150 cursor-pointer relative group ${
                    isActive
                      ? 'bg-zinc-800/90 border-zinc-700 text-white shadow-md'
                      : 'bg-zinc-900/60 hover:bg-zinc-800/80 border-transparent hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={app.label}
                >
                  <app.icon className={`w-4 h-4 ${isActive ? app.color : ''}`} />
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-0.5 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Active Window Breadcrumb Badge */}
          {pageName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-emerald-400 max-w-[140px] sm:max-w-none truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">{pageName}</span>
              <button
                onClick={() => router.push('/desktop')}
                className="ml-1 text-zinc-500 hover:text-white transition p-0.5 rounded"
                title="Minimize to Desktop"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Right Section: System Tray & Clock */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-mono">
          
          {/* Widget Toggle — shows live active count badge */}
          <button
            onClick={() => {
              soundFX.playClick();
              setIsWidgetDockOpen(!isWidgetDockOpen);
            }}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white transition cursor-pointer hidden md:flex items-center gap-1.5 px-2 relative"
            title="Desktop Widgets"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Widgets</span>
            {desktopWidgets.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center shadow">
                {desktopWidgets.length}
              </span>
            )}
          </button>

          {/* Sound / Mute Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* User Profile Pill or Sign In Button */}
          {user ? (
            <Link
              href="/account-settings"
              onClick={() => soundFX.playClick()}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] truncate max-w-[100px]">{user.name || user.email?.split('@')[0]}</span>
            </Link>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Digital Time & Date Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-zinc-300 shadow-inner" suppressHydrationWarning>
            <span className="font-mono text-xs font-bold text-white tracking-wider" suppressHydrationWarning>{time}</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="font-mono text-[11px] text-zinc-400 hidden sm:inline" suppressHydrationWarning>{date}</span>
          </div>
        </div>
      </footer>

      {/* Widget Dock Sheet */}
      <WidgetDock
        isOpen={isWidgetDockOpen}
        onOpenChange={setIsWidgetDockOpen}
        activeWidgets={desktopWidgets}
        toggleWidget={toggleWidget}
      />
    </div>
  );
}
