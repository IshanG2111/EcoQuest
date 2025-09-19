'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';

export function Desktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [windowState, setWindowState] = useState<'open' | 'minimized' | 'maximized'>('maximized');
  const [isClosing, setIsClosing] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  useEffect(() => {
    // Reset closed state when navigating to a new "app"
    if (pathname !== '/') {
        setIsClosing(false);
        setWindowState('maximized');
    }
  }, [pathname]);

  // Don't render window decoration on the main desktop page
  if (pathname === '/') {
    return <>{children}</>;
  }

  if (!isBrowser) {
    return null;
  }
  
  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to finish before routing
    setTimeout(() => {
        router.push('/');
    }, 500);
  }

  const handleMinimize = () => {
    setIsClosing(true);
    setTimeout(() => {
        setWindowState('minimized');
        router.push('/');
    }, 500);
  }

  const toggleMaximize = () => {
    setWindowState(prev => prev === 'maximized' ? 'open' : 'maximized');
  }

  // A simple way to get a title from the pathname
  const title = pathname.split('/').filter(Boolean).map(p => p.replace(/-/g, ' ')).join(' > ');
  const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);

  if (windowState === 'minimized') {
      return null;
  }

  const windowClasses = cn(
    "retro-window absolute",
    {
      'top-[10%] left-[15%] w-full max-w-4xl': windowState === 'open' && !isClosing,
      'inset-0 w-full h-full max-w-full max-h-full rounded-none border-none': windowState === 'maximized',
      'animate-crt-open': !isClosing,
      'animate-crt-close': isClosing,
    }
  );
  
  const contentClasses = cn(
    "window-content bg-card overflow-auto",
     {
      'max-h-[70vh]': windowState === 'open',
      'h-[calc(100vh-40px)]': windowState === 'maximized',
    }
  );


  return (
    <Draggable nodeRef={nodeRef} handle=".window-drag-handle" bounds="parent" disabled={windowState === 'maximized'}>
      <div 
        ref={nodeRef} 
        className={windowClasses}
        style={windowState === 'maximized' ? { top: 0, left: 0 } : {}}
      >
        <div className="window-drag-handle flex items-center justify-between">
          <span className="pl-2">{capitalizedTitle}</span>
          <div className="flex items-center">
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMinimize}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleMaximize}>
              {windowState === 'maximized' ? <Square className="h-3 w-3" /> : <Maximize className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className={contentClasses}>
          {children}
        </div>
      </div>
    </Draggable>
  );
}
