'use client';

import Link from 'next/link';
import { AuthGuard } from '@/hooks/use-auth';

export default function PlayPage() {
  return (
    <AuthGuard>
      <div className="relative w-screen h-screen overflow-hidden bg-[#010201] select-none z-50">
        {/* Absolute floating retro Back Button */}
        <Link 
          href="/desktop" 
          className="absolute top-6 left-6 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-black/90 border border-zinc-800 hover:border-[#378b29] text-zinc-500 hover:text-[#56d33f] rounded font-mono text-xs tracking-widest transition-all duration-300 backdrop-blur-md"
        >
          ← BACK
        </Link>
        
        {/* Full screen Iframe loading the 3D cartridge launcher */}
        <iframe 
          src="/games/physical-archive.html"
          className="w-full h-full border-none"
          title="Physical Archive"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </AuthGuard>
  );
}
