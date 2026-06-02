/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, MouseEvent } from 'react';
import { Gallery } from './components/Gallery';

export default function App() {
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const gameLinks: Record<string, string> = {
    'env-01': '/play/ocean-explorer',      // CORAL_REEF -> Reef Rescue
    'env-03': '/play/forest-guardian',     // FOREST_MICRO_CLIMATE -> Forest Defender
    'env-06': '/play/migration-map',       // ARID_DESERTIFICATION -> Migration Map
    'env-08': '/play/eco-city-builder',    // URBAN_HEAT_ISLAND -> Eco City Builder (Next.js)
    'env-10': '/play/recycle-rally',       // SOIL_DEGRADATION -> Waste Wizard
    'env-11': '/play/carbon-quest',        // ATMOSPHERIC_AEROSOLS -> Carbon Crunch
  };

  const handleSelectCartridge = (item: any) => {
    const gameLink = gameLinks[item.id];
    if (gameLink) {
      if (window.top) {
        window.top.location.href = gameLink;
      } else {
        window.location.href = gameLink;
      }
    }
  };

  return (
    <div 
      className="h-screen bg-[#010201] bg-grid scanlines flex flex-col p-4 relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(55,139,41,0.12), transparent 80%)`
        }}
      />
      
      {/* Main Gallery Scene - Centered and Maximized */}
      <main className="flex-1 w-full flex items-center justify-center relative z-10 -mt-12">
         <Gallery onSelectCartridge={handleSelectCartridge} />
      </main>
    </div>
  );
}

