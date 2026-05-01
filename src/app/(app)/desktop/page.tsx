'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Power,
  LogIn,
  Briefcase,
  Users,
  FileQuestion,
  MessageSquare,
  Palette,
  Settings,
  LayoutGrid,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import Image from 'next/image';
import { FactWidget } from '@/components/widgets/FactWidget';
import Draggable from 'react-draggable';
import { WidgetDock } from '@/components/widgets/WidgetDock';
import { DailyBriefingWidget } from '@/components/widgets/DailyBriefingWidget';
import { PixelWeatherWidget } from '@/components/widgets/PixelWeatherWidget';
import { EcoNewsWidget } from '@/components/widgets/EcoNewsWidget';
import { DailyBriefingIcon } from '@/lib/user-data';
import { CommsIcon, RankingsIcon, ThemesIcon } from '@/lib/user-data';
import { AuthGuard } from '@/hooks/use-auth';


const desktopIcons = [
  { href: '/play', label: 'Games', icon: Gamepad2 },
  { href: '/dashboard', label: 'Dashboard', icon: DailyBriefingIcon },
  { href: '/leaderboard', label: 'Rankings', icon: RankingsIcon },
  { href: '/quizzes', label: 'Quizzes', icon: FileQuestion },
];

const themes = [
  { name: 'Verdant Grove (Earth)', id: 'the-verdant-grove' },
  { name: 'Ember Hearth (Fire)', id: 'the-ember-hearth' },
  { name: 'Abyssal Tide (Water)', id: 'the-abyssal-tide' },
];

type WidgetType = 'fact' | 'briefing' | 'weather' | 'news';

const widgetComponents: Record<WidgetType, React.FC<any>> = {
  fact: FactWidget,
  briefing: DailyBriefingWidget,
  weather: PixelWeatherWidget,
  news: EcoNewsWidget,
};

export default function DesktopHomePage() {
  const [time, setTime] = React.useState('');
  const [date, setDate] = React.useState('');
  const [isWidgetDockOpen, setIsWidgetDockOpen] = useState(false);
  const [desktopWidgets, setDesktopWidgets] = useState<WidgetType[]>(['fact', 'news']);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme: activeTheme, setTheme } = useTheme();

  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
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
  
  const toggleWidget = (widgetId: WidgetType) => {
    setDesktopWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const getStartButtonContent = () => {
    if (!isClient) return '...';
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
    if (!isClient) return <div className="w-5 h-5 mr-2" />;
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
  
  const DraggableWidget = ({ id, component: Component, onClose, defaultPosition }: { id: WidgetType, component: React.FC<any>, onClose: (id: string) => void, defaultPosition: {x: number, y: number} }) => {
    const nodeRef = useRef(null);
    // Each widget has its own drag handle class (e.g. .handle for most, .enw-titlebar for news)
    const handleSel = '.handle';
    return (
      <Draggable nodeRef={nodeRef} handle={handleSel} bounds="parent" defaultPosition={defaultPosition}>
        <div ref={nodeRef} className="absolute" style={{ zIndex: 20 }}>
          <Component onClose={() => onClose(id)} theme={id === 'weather' ? 'forest' : undefined} />
        </div>
      </Draggable>
    );
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen overflow-hidden font-body relative">
        {/* CRT Monitor Effects */}
        <div className="absolute inset-0 pointer-events-none z-50 vignette"></div>
        <div className="absolute inset-0 pointer-events-none z-50 scanlines"></div>

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

        <main className="flex-1 p-4 z-30">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] grid-rows-[repeat(auto-fill,90px)] gap-y-4 gap-x-2">
            {desktopIcons.map((item) => (
              <Link href={item.href} key={item.label} className="flex-shrink-0">
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline cursor-pointer hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                  <item.icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  <span className="text-sm leading-tight font-code">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
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
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                <Palette className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-sm leading-tight font-code">Themes</span>
              </div>
            </div>
            <div
              onClick={() => setIsWidgetDockOpen(true)}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                <LayoutGrid className="w-10 h-10 group-hover:scale-110 transition-transform" />
                <span className="text-sm leading-tight font-code">Widgets</span>
              </div>
            </div>
            {user && (
              <Link href="/account-settings" className="flex-shrink-0 cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-primary/20 hover:border-solid hover:border-primary/50 hover:shadow-lg border border-transparent p-2 rounded-lg h-full transition-all group backdrop-blur-[2px]">
                  <Settings className="w-10 h-10 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                  <span className="text-sm leading-tight font-code">Settings</span>
                </div>
              </Link>
            )}
          </div>
          
          {desktopWidgets.map((widgetId, index) => {
            const Component = widgetComponents[widgetId];
            const defaultPos = widgetId === 'news'
              ? { x: typeof window !== 'undefined' ? Math.max(window.innerWidth - 420, 400) : 700, y: 60 }
              : { x: 200 + index * 280, y: 150 };
            return (
              <DraggableWidget
                key={widgetId}
                id={widgetId}
                component={Component}
                onClose={() => toggleWidget(widgetId)}
                defaultPosition={defaultPos}
              />
            );
          })}

        </main>

        <footer className="w-full h-12 bg-background/80 backdrop-blur-md border-t border-primary/20 flex items-center px-4 z-40 shadow-xl">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="font-bold text-xs h-8"
              >
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
            {user && <span>{user.name || user.email}</span>}
            <div className="flex items-center px-3 h-8 bg-background/10 border border-t-white/20 border-l-white/20 border-b-black/20 border-r-black/20">
              <span className="font-code text-xs">{time}</span>
            </div>
            <div className="flex items-center px-3 h-8 bg-background/10 border border-t-white/20 border-l-white/20 border-b-black/20 border-r-black/20">
              <span className="font-code text-xs">{date}</span>
            </div>
          </div>
        </footer>

        <WidgetDock 
          isOpen={isWidgetDockOpen} 
          onOpenChange={setIsWidgetDockOpen}
          activeWidgets={desktopWidgets}
          toggleWidget={toggleWidget}
        />
      </div>
    </AuthGuard>
  );
}
