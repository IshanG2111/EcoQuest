'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';
import anime from '@/lib/anime';
import DotGrid from '@/components/ui/DotGrid';

export function Desktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [windowState, setWindowState] = useState<'open' | 'minimized' | 'maximized'>('maximized');
  const [isBrowser, setIsBrowser] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  useEffect(() => {
    // Reset closed state when navigating to a new "app"
    if (pathname !== '/desktop' && pathname !== '/') {
      setWindowState('maximized');
      setIsClosing(false);
      
      // Smooth window open animation
      if (nodeRef.current) {
        anime({
          targets: nodeRef.current,
          opacity: [0, 1],
          scale: [0.97, 1],
          translateY: [8, 0],
          easing: 'easeOutCubic',
          duration: 260,
        });
      }
    }
  }, [pathname]);

  // Don't render window decoration on the main desktop page
  if (pathname === '/desktop' || pathname === '/') {
    return <>{children}</>;
  }

  if (!isBrowser) {
    return null;
  }
  
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (nodeRef.current) {
      anime({
        targets: nodeRef.current,
        opacity: [1, 0],
        scale: [1, 0.94],
        translateY: [0, 12],
        easing: 'easeInCubic',
        duration: 220,
        complete: () => {
          router.push('/desktop');
        }
      });
    } else {
      router.push('/desktop');
    }
  };

  const handleMinimize = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (nodeRef.current) {
      anime({
        targets: nodeRef.current,
        opacity: [1, 0],
        scale: [1, 0.85],
        translateY: [0, 60],
        easing: 'easeInCubic',
        duration: 200,
        complete: () => {
          setWindowState('minimized');
          router.push('/desktop');
        }
      });
    } else {
      setWindowState('minimized');
      router.push('/desktop');
    }
  };

  const toggleMaximize = () => {
    const nextState = windowState === 'maximized' ? 'open' : 'maximized';
    setWindowState(nextState);
    if (nodeRef.current) {
      anime({
        targets: nodeRef.current,
        scale: [0.98, 1],
        easing: 'easeOutCubic',
        duration: 200,
      });
    }
  };

  // A simple way to get a title from the pathname
  const title = pathname.split('/').filter(Boolean).map(p => p.replace(/-/g, ' ')).join(' > ');
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  if (windowState === 'minimized') {
    return null;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveState = isMobile ? 'maximized' : windowState;

  const windowClasses = cn(
    "retro-window absolute pointer-events-auto shadow-2xl",
    {
      'top-[8%] left-[10%] w-[80%] max-w-5xl h-[82%] max-h-[82vh] rounded-xl flex flex-col': effectiveState === 'open',
      'inset-0 w-full h-full max-w-full max-h-full rounded-none border-none flex flex-col': effectiveState === 'maximized',
    }
  );
  
  const contentClasses = cn(
    "window-content bg-card flex-1 min-h-0 overflow-y-auto p-0"
  );

  return (
    <Draggable nodeRef={nodeRef} handle=".window-drag-handle" bounds="parent" disabled={effectiveState === 'maximized' || isMobile}>
      <div 
        ref={nodeRef} 
        className={windowClasses}
        style={effectiveState === 'maximized' ? { top: 0, left: 0 } : {}}
      >
        <div className="window-drag-handle flex items-center justify-between border-b border-primary/20 bg-card/90 backdrop-blur-md px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
            <span className="font-headline text-xs tracking-widest uppercase text-foreground">{capitalizedTitle}</span>
          </div>
          <div className="flex items-center gap-1 pr-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/20 text-muted-foreground hover:text-foreground" onClick={handleMinimize}>
              <Minus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/20 text-muted-foreground hover:text-foreground" onClick={toggleMaximize}>
              {windowState === 'maximized' ? <Square className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive text-muted-foreground" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className={cn(contentClasses, "relative")}>
          <div className="absolute inset-0 pointer-events-none opacity-30 z-0 overflow-hidden">
            <DotGrid
              dotSize={2}
              gap={24}
              baseColor="rgba(16, 185, 129, 0.15)"
              activeColor="#10b981"
              proximity={90}
              shockRadius={160}
              shockStrength={3}
              returnDuration={1.2}
            />
          </div>
          <div className="relative z-10 p-4 sm:p-6 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </Draggable>
  );
}
