'use client';

import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

interface GameRunnerProps {
  title: string;
  htmlPath: string;
}

export function GameRunner({ title, htmlPath }: GameRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const reloadGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <Desktop>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between bg-card p-3 border-2 border-primary/20 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/play">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Arcade
              </Button>
            </Link>
            <div className="h-6 w-px bg-border mx-2" />
            <h1 className="font-headline text-lg tracking-wider text-primary uppercase">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={reloadGame} title="Restart Game">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-black rounded-xl border-4 border-card shadow-2xl overflow-hidden group">
           {/* Scanline overlay for the whole window */}
           <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
           
           <iframe
            ref={iframeRef}
            src={htmlPath}
            className="w-full h-full border-none"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          
          {/* Controls Overlay (Hidden by default, shows on hover) */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <div className="flex gap-2 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
               <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => {
                    if (iframeRef.current?.requestFullscreen) {
                        iframeRef.current.requestFullscreen();
                    }
                }}
               >
                 <Maximize2 className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center px-2 py-1">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Terminal Link: Active</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">
                EcoQuest_Engine v4.0 // Secure_Mode
            </div>
        </div>
      </div>
    </Desktop>
  );
}
