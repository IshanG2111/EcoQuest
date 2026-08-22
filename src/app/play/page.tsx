'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/hooks/use-auth';
import { games, Game } from '@/lib/games';
import { soundFX } from '@/lib/audio-fx';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Gamepad2,
  Sparkles,
  Layers,
  X,
  ExternalLink,
  Flame,
  Star,
  Play,
  RotateCcw,
  Trophy,
  Filter,
} from 'lucide-react';
import DotGrid from '@/components/ui/DotGrid';

export default function PlayPage() {
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const playableGames = games.filter((g) => g.id !== 'physical-archive');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop default to 3D mode, on mobile default to fast native arcade grid
      if (!mobile && window.innerWidth >= 1024) {
        setIs3DMode(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter tags
  const tags = ['all', 'conservation', 'climate change', 'waste management', 'marine biology', 'urban planning'];

  const filteredGames = selectedTag === 'all'
    ? playableGames
    : playableGames.filter((g) => g.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())));

  return (
    <AuthGuard>
      <div className="relative w-screen h-screen overflow-hidden bg-[#030608] select-none z-50 font-sans text-zinc-100 flex flex-col">
        
        {/* Interactive DotGrid Background for Arcade Grid */}
        {!is3DMode && (
          <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
            <DotGrid
              dotSize={2}
              gap={24}
              baseColor="rgba(16, 185, 129, 0.14)"
              activeColor="#10b981"
              proximity={90}
            />
          </div>
        )}

        {/* ── TOP NAVIGATION BAR ── */}
        <header className="relative z-50 h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800/80 bg-[#070b10]/90 backdrop-blur-xl flex-shrink-0">
          
          {/* Back to Desktop */}
          <Link
            href="/desktop"
            onClick={() => soundFX.playClick()}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 rounded-xl font-mono text-xs tracking-wider transition-all duration-150 backdrop-blur-md shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DESKTOP</span>
          </Link>

          {/* Center Title Badge */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="font-bold text-white uppercase tracking-wider">Planetary Arcade Vault</span>
            <span className="text-zinc-600">·</span>
            <span className="text-emerald-400">{playableGames.length} Sim Cartridges</span>
          </div>

          {/* Right Tools (3D/Grid Toggle, Mute) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playClick();
                setIs3DMode(!is3DMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border text-xs font-mono transition-all duration-150 backdrop-blur-md shadow-md cursor-pointer ${
                is3DMode
                  ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
              title="Toggle 3D Hardware Rack / Grid Roster"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{is3DMode ? '3D Rack' : 'Grid'}</span>
            </button>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                soundFX.playClick();
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition backdrop-blur-md shadow-md cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="relative flex-1 w-full overflow-hidden flex flex-col">
          
          {/* VIEW A: 3D HARDWARE CARTRIDGE CRATE IFRAME */}
          {is3DMode ? (
            <div className="relative w-full h-full">
              <iframe
                src="/games/physical-archive.html"
                className="w-full h-full border-none block"
                title="Physical Archive 3D Engine"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            /* VIEW B: HIGH-PERFORMANCE NATIVE ARCADE ROSTER (MOBILE & DESKTOP OPTIMIZED) */
            <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
                <span className="text-zinc-500 flex items-center gap-1 mr-1 flex-shrink-0 text-[11px]">
                  <Filter className="w-3 h-3" />
                  <span>FILTER:</span>
                </span>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      soundFX.playClick();
                      setSelectedTag(tag);
                    }}
                    className={`py-1.5 px-3 rounded-xl border text-[11px] whitespace-nowrap transition cursor-pointer flex-shrink-0 capitalize ${
                      selectedTag === tag
                        ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Responsive Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                {filteredGames.map((game) => {
                  const Icon = game.icon;
                  return (
                    <Link
                      key={game.id}
                      href={game.gameLink}
                      onMouseEnter={() => !isMuted && soundFX.playCartridgeHover()}
                      onClick={() => !isMuted && soundFX.playCartridgeSelect()}
                      className="group flex flex-col justify-between p-5 rounded-3xl bg-[#0b0f16]/95 hover:bg-[#101622] border border-zinc-800/90 hover:border-emerald-500/60 transition-all duration-200 shadow-xl cursor-pointer relative overflow-hidden backdrop-blur-xl transform hover:-translate-y-1 active:scale-[0.98]"
                    >
                      {/* Subtle Top-Right Ambient Glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all pointer-events-none" />

                      <div className="space-y-3 relative z-10">
                        {/* Card Header Badge */}
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded-full border border-zinc-800">
                            SIM #{game.id.slice(0, 4).toUpperCase()}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors font-sans">
                            {game.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed font-sans">
                            {game.description}
                          </p>
                        </div>

                        {/* Tag Badges */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {game.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Launch Button */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs font-mono relative z-10">
                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold text-[11px]">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Active Quest</span>
                        </span>
                        
                        <div className="flex items-center gap-1 text-zinc-400 group-hover:text-white font-bold group-hover:translate-x-1 transition-transform">
                          <span>PLAY</span>
                          <span>→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
