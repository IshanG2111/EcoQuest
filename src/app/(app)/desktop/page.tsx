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
  { name: 'The TVA Archives', id: 'the-tva-archives' },
  { name: 'The Vault-Ed Program', id: 'the-vault-ed-program' },
  { name: 'The Lumon Method', id: 'the-lumon-method' },
];

type WidgetType = 'fact' | 'briefing' | 'weather';

const widgetComponents: Record<WidgetType, React.FC<any>> = {
  fact: FactWidget,
  briefing: DailyBriefingWidget,
  weather: PixelWeatherWidget,
};

export default function DesktopHomePage() {
  const [time, setTime] = React.useState('');
  const [date, setDate] = React.useState('');
  const [isWidgetDockOpen, setIsWidgetDockOpen] = useState(false);
  const [desktopWidgets, setDesktopWidgets] = useState<WidgetType[]>(['fact']);
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
      case 'the-vault-ed-program':
        return 'PIP-BOY 3000';
      case 'the-lumon-method':
        return 'MAIN DIRECTORY';
      default:
        return 'INDEX';
    }
  };

  const getStartButtonIcon = () => {
    if (!isClient) return <div className="w-5 h-5 mr-2" />;
    switch (activeTheme) {
      case 'the-vault-ed-program':
        return (
          <Image
            src="/vault-tec-logo.svg"
            alt="Vault-Tec"
            width={20}
            height={20}
            className="mr-2 filter-primary"
          />
        );
      case 'the-lumon-method':
        return (
          <Image
            src="/lumon-logo.svg"
            alt="Lumon"
            width={12}
            height={12}
            className="mr-2"
          />
        );
      default:
        return (
          <Image
            src="/tva-logo.svg"
            alt="TVA"
            width={20}
            height={20}
            className="mr-2"
          />
        );
    }
  };
  
  const DraggableWidget = ({ id, component: Component, onClose, defaultPosition }: { id: WidgetType, component: React.FC<any>, onClose: (id: string) => void, defaultPosition: {x: number, y: number} }) => {
    const nodeRef = useRef(null);
    return (
      <Draggable nodeRef={nodeRef} handle=".handle" bounds="parent" defaultPosition={defaultPosition} grid={[20, 20]}>
        <div ref={nodeRef} className="handle absolute w-auto cursor-move">
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
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline cursor-pointer hover:bg-black/20 hover:border-dotted hover:border-white/50 border border-transparent p-2 rounded-md h-full [text-shadow:1px_1px_2px_#000]">
                  <item.icon className="w-10 h-10" />
                  <span className="text-sm leading-tight font-code">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
            <div
              onClick={() =>
                setTheme(
                  activeTheme === 'the-tva-archives'
                    ? 'the-vault-ed-program'
                    : activeTheme === 'the-vault-ed-program'
                    ? 'the-lumon-method'
                    : 'the-tva-archives'
                )
              }
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-black/20 hover:border-dotted hover:border-white/50 border border-transparent p-2 rounded-md h-full [text-shadow:1px_1px_2px_#000]">
                <Palette className="w-10 h-10" />
                <span className="text-sm leading-tight font-code">Themes</span>
              </div>
            </div>
            <div
              onClick={() => setIsWidgetDockOpen(true)}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-black/20 hover:border-dotted hover:border-white/50 border border-transparent p-2 rounded-md h-full [text-shadow:1px_1px_2px_#000]">
                <LayoutGrid className="w-10 h-10" />
                <span className="text-sm leading-tight font-code">Widgets</span>
              </div>
            </div>
            {user && (
              <Link href="/account-settings" className="flex-shrink-0 cursor-pointer">
                <div className="flex flex-col items-center justify-center gap-1 text-white text-center no-underline hover:bg-black/20 hover:border-dotted hover:border-white/50 border border-transparent p-2 rounded-md h-full [text-shadow:1px_1px_2px_#000]">
                  <Settings className="w-10 h-10" strokeWidth={1} />
                  <span className="text-sm leading-tight font-code">Settings</span>
                </div>
              </Link>
            )}
          </div>
          
          {desktopWidgets.map((widgetId, index) => {
            const Component = widgetComponents[widgetId];
            return (
              <DraggableWidget 
                key={widgetId}
                id={widgetId}
                component={Component}
                onClose={() => toggleWidget(widgetId)}
                defaultPosition={{ x: 200 + index * 300, y: 150 }}
              />
            );
          })}

        </main>

        <footer className="w-full h-10 bg-secondary border-t-2 border-border flex items-center px-2 z-40">
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
            {user && <span>{user.displayName || user.email}</span>}
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
