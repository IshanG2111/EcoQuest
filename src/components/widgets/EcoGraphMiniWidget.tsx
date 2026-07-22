'use client';

import React, { useState } from 'react';
import { Network, Sparkles, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { INITIAL_ECOGRAPH_DATA } from '@/lib/ecograph/seed-data';

export const EcoGraphMiniWidget: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  const sampleNodes = INITIAL_ECOGRAPH_DATA.nodes;
  const currentNode = sampleNodes[activeNodeIndex % sampleNodes.length];

  const handleNext = () => {
    setActiveNodeIndex((prev) => (prev + 1) % sampleNodes.length);
  };

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 p-3 flex flex-col justify-between font-mono select-none">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
          <Network className="w-4 h-4 animate-pulse" />
          <span>ECO_GRAPH_MINI.SYS</span>
        </div>
        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
          LIVE ENGINE
        </span>
      </div>

      {/* Featured Entity Showcase */}
      <div className="my-2 bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded font-semibold">
            {currentNode.category} • {currentNode.label}
          </span>
          <span className="text-zinc-500 font-sans">{currentNode.spatial?.region || 'Global'}</span>
        </div>

        <h4 className="text-xs font-bold text-white flex items-center gap-1 mt-1">
          <span>{currentNode.icon}</span> {currentNode.name}
        </h4>

        <p className="text-[11px] font-sans text-zinc-300 line-clamp-2 leading-relaxed">
          {currentNode.description}
        </p>

        <div className="mt-1 flex items-center justify-between text-[9px] text-zinc-400 border-t border-zinc-800/60 pt-1">
          <span>Source: {currentNode.provenance.source}</span>
          <span className="text-emerald-400">
            {Math.round(currentNode.provenance.confidenceScore * 100)}% Conf
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={handleNext}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[10px] py-1 rounded transition flex items-center justify-center gap-1"
        >
          Next Discovery <ArrowRight className="w-3 h-3 text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
