'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  Globe,
  Zap,
  Leaf,
  Briefcase,
  Users,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/components/theme-provider';
import { useDesktop, WidgetType } from '@/components/desktop-context';

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
import { PixelWeatherWidget } from '@/components/widgets/PixelWeatherWidget';
import { EcoNewsWidget } from '@/components/widgets/EcoNewsWidget';
import { EcoTilesCalendarWidget } from '@/components/widgets/EcoTilesCalendarWidget';
import { EcoGardenWidget } from '@/components/widgets/EcoGardenWidget';
import { EcoGraphMiniWidget } from '@/components/widgets/EcoGraphMiniWidget';

import { WidgetShell } from '@/components/widgets/WidgetShell';
import { WidgetDock } from '@/components/widgets/WidgetDock';

import { DailyBriefingIcon, RankingsIcon, ThemesIcon } from '@/lib/user-data';

const desktopIcons = [
  { href: '/play', label: 'Games', icon: Gamepad2 },
  { href: '/dashboard', label: 'Dashboard', icon: DailyBriefingIcon },
  { href: '/ecograph', label: 'EcoGraph', icon: Network },
  { href: '/leaderboard', label: 'Rankings', icon: RankingsIcon },
  { href: '/quizzes', label: 'Quizzes', icon: FileQuestion },
];

const themes = [
  { name: 'Verdant Grove (Earth)', id: 'the-verdant-grove' },
  { name: 'Ember Hearth (Fire)', id: 'the-ember-hearth' },
  { name: 'Abyssal Tide (Water)', id: 'the-abyssal-tide' },
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
  const {
    isWidgetDockOpen,
    setIsWidgetDockOpen,
    desktopWidgets,
    toggleWidget
  } = useDesktop();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme: activeTheme, setTheme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

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
    await logout();
    router.push('/login');
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
            width={20}
            height={20}
            className="mr-2 filter-primary"
          />
        );
      case 'the-abyssal-tide':
        return (
          <Image
            src="/lumon-logo.svg"
            alt="Water"
            width={12}
            height={12}
            className="mr-2 filter-primary"
          />
        );
      default:
        return (
          <Image
            src="/tva-logo.svg"
            alt="Earth"
            width={20}
            height={20}
            className="mr-2 filter-primary"
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden font-body relative select-none">
      {/* CRT Monitor Effects */}
      <div className="absolute inset-0 pointer-events-none z-50 vignette"></div>
      <div className="absolute inset-0 pointer-events-none z-50 scanlines"></div>

      {/* Desktop Wallpaper Video */}
      <div className="absolute inset-0 z-0">
        <video
          src="/videos/desktop.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        ></video>
        <div className="absolute inset-0 z-10 bg-black/30"></div>
      </div>

      {/* Desktop Workspace (contains widgets, icons grid, and app windows) */}
      <div className="flex-1 relative overflow-hidden z-20">
        
        {/* 1. Widgets Layer (z-10) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
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
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] grid-rows-[repeat(auto-fill,90px)] gap-y-4 gap-x-2 pointer-events-none max-w-full">
            {desktopIcons.map((item) => (
              <Link href={item.href} key={item.label} className="flex-shrink-0 pointer-events-auto">
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline cursor-pointer hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                  <item.icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  <span className="text-sm leading-tight font-code">{item.label}</span>
                </div>
              </Link>
            ))}
            
            {/* Custom Desktop Utility Icons */}
            <div
              onClick={() =>
                setTheme(
                  activeTheme === 'the-verdant-grove'
                    ? 'the-ember-hearth'
                    : activeTheme === 'the-ember-hearth'
                    ? 'the-abyssal-tide'
                    : 'the-verdant-grove'
                )
              }
              className="flex-shrink-0 cursor-pointer pointer-events-auto"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                <Palette className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-sm leading-tight font-code">Themes</span>
              </div>
            </div>
            
            <div
              onClick={() => setIsWidgetDockOpen(true)}
              className="flex-shrink-0 cursor-pointer pointer-events-auto"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                <LayoutGrid className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-sm leading-tight font-code">Widgets</span>
              </div>
            </div>

            {user && (
              <Link href="/account-settings" className="flex-shrink-0 cursor-pointer pointer-events-auto">
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                  <Settings className="w-10 h-10 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <span className="text-sm leading-tight font-code">Settings</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* 3. Window Container Layer (z-30) */}
        <div className="absolute inset-0 p-4 z-30 pointer-events-none">
          {children}
        </div>
      </div>

      {/* Taskbar / Footer (z-40) */}
      <footer className="w-full h-12 bg-background/80 backdrop-blur-md border-t border-primary/20 flex items-center px-4 z-40 shadow-xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" className="font-bold text-xs h-8">
              {getStartButtonIcon()}
              {getStartButtonContent()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Themes</DropdownMenuLabel>
            {themes.map((theme) => (
              <DropdownMenuItem key={theme.id} onClick={() => setTheme(theme.id)}>
                <span className="flex-1">{theme.name}</span>
                {activeTheme === theme.id && (
                  <div className="w-4 h-4 bg-primary rounded-full ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem onClick={() => router.push('/account-settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <Power className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Log In</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1"></div>

        <div className="flex items-center h-full text-foreground/80 text-xs font-code gap-4 px-3">
          {user && <span className="hidden sm:inline">{user.name || user.email}</span>}
          <div className="flex items-center px-3 h-8 bg-background/10 border border-t-white/20 border-l-white/20 border-b-black/20 border-r-black/20">
            <span className="font-code text-xs">{time}</span>
          </div>
          <div className="flex items-center px-3 h-8 bg-background/10 border border-t-white/20 border-l-white/20 border-b-black/20 border-r-black/20">
            <span className="font-code text-xs">{date}</span>
          </div>
        </div>
      </footer>

      {/* Widget Library Library Dock Sheet (z-50 modal) */}
      <WidgetDock
        isOpen={isWidgetDockOpen}
        onOpenChange={setIsWidgetDockOpen}
        activeWidgets={desktopWidgets}
        toggleWidget={toggleWidget}
      />
    </div>
  );
}
