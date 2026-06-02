import React from 'react';
import * as LucideIcons from 'lucide-react';

const tagColors: Record<string, string> = {
  'AQUATIC': '#00d2ff',
  'MARINE': '#0378bc',
  'DEEP_SEA': '#14125b',
  'TERRESTRIAL': '#39ff14',
  'WETLAND': '#359d73',
  'HAZARD': '#ff003c',
  'DRYLAND': '#fc8720',
  'CRYOSPHERE': '#00ffff',
  'ATMOSPHERE': '#a4c9eb',
  'ANTHROPOGENIC': '#ffffff',
};

const gameGifs: Record<string, string> = {
  'env-01': '/games/ocean-explorer.gif',
  'env-03': '/games/forest-guardian.gif',
  'env-06': '/games/ocean-explorer.gif', // fallback
  'env-08': '/games/eco-city-builder.gif',
  'env-10': '/games/recycle-rally.gif',
  'env-11': '/games/carbon-quest.gif',
};

export function CartridgeLabel({ item, index, isHovered }: { item: any, index: number, isHovered?: boolean }) {
  const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
  const neonColor = tagColors[item.tag] || '#00d2ff';
  const gifUrl = gameGifs[item.id];
  
  const formattedIndex = (index + 1).toString().padStart(2, '0');

  // Slight pseudo-random delay for glitch effect so they don't sync up perfectly
  const glitchDelay = `${(item.id.length % 5) * 0.3}s`;

  return (
      <div className="w-full h-full bg-[#0a0a0a] rounded-[6px] relative box-border overflow-hidden
                  shadow-[inset_1.5px_1.5px_2px_rgba(255,255,255,0.2),inset_-2px_-2px_6px_rgba(0,0,0,0.95)] border border-[#111] flex flex-col">
          
          {/* Intense Rim Light (Top and Left) */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[rgba(255,245,235,0.8)] via-[rgba(255,255,255,0.2)] to-transparent pointer-events-none z-30 opacity-90" />
          <div className="absolute top-0 left-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[rgba(255,245,235,0.8)] via-[rgba(255,255,255,0.1)] to-transparent pointer-events-none z-30 opacity-90" />

          {/* subtle matte texture */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '3px 3px' }} />
          <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(45deg,transparent,rgba(0,0,0,0.8),transparent)] pointer-events-none" />

          {/* Top Title Display indent */}
          <div className="w-full px-[14px] pt-[20px] pb-[8px] relative z-10 flex justify-center">
              <div className="w-full h-[32px] bg-[#020302] rounded-[2px] shadow-[inset_0_4px_8px_rgba(0,0,0,1),inset_0_-1px_2px_rgba(255,255,255,0.05)] border border-[#000] flex items-center justify-center overflow-hidden relative">
                  {/* Scanline overlay for screen effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-80 z-10" />
                  
                  <span className={`text-[#56d33f] font-mono tracking-[0.05em] text-[16px] leading-[1] uppercase relative z-20 font-bold ${isHovered ? 'animate-glitch' : ''}`} 
                        style={{ textShadow: '0 0 10px rgba(86,211,63,0.9), 0 0 4px rgba(86,211,63,1)', animationDelay: glitchDelay }}>
                      {item.title.replace(/_/g, ' ')}
                  </span>
              </div>
          </div>

          {/* Subtitle / Brand text */}
          <div className="px-[16px] flex justify-between items-center text-[#777] relative z-10 pb-[10px]">
             <span className="font-mono text-[9px] tracking-widest uppercase">MX-CORE</span>
             <span className="font-mono text-[9px] tracking-widest">{formattedIndex}/12</span>
          </div>

          {/* Central Holographic / Glass screen area */}
          <div className="mx-[14px] mb-[30px] flex-1 rounded-[4px] bg-[#080808] shadow-[inset_0_8px_20px_rgba(0,0,0,1)] border border-[#000] relative overflow-hidden flex flex-col justify-center items-center">
              
              {/* Shimmering glass reflection */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform ${isHovered ? 'translate-y-[-100%]' : 'translate-y-[100%]'} transition-transform duration-[1200ms] pointer-events-none z-20`} />

              {/* Glowing Icon / GIF */}
              {gifUrl ? (
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={gifUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" 
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none mix-blend-multiply" />
                  <div 
                     className="absolute inset-0 blur-[20px] opacity-20 pointer-events-none"
                     style={{ backgroundColor: neonColor }} 
                  />
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-4 transition-transform duration-500 ease-out" style={{ transform: isHovered ? 'scale(1.15)' : 'scale(1)' }}>
                    <div 
                       className="absolute inset-0 blur-[32px] opacity-40 transition-opacity duration-300"
                       style={{ backgroundColor: neonColor, opacity: isHovered ? 1 : 0.6 }} 
                    />
                    <div style={{ color: neonColor }} className="drop-shadow-[0_0_12px_currentColor] relative z-10 scale-[1.35]">
                        <IconComponent size={64} strokeWidth={1} />
                    </div>
                </div>
              )}
              
              {/* Screen noise/texture */}
              <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '4px 4px' }} />
              
              {/* Edge glow */}
              <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,1)] pointer-events-none z-30" />
          </div>
          
      </div>
  );
}
