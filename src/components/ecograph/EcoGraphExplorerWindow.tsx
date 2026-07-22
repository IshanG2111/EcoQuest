'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GraphData } from '@/lib/ecograph/types';
import { ObsidianGraphCanvas } from './ObsidianGraphCanvas';
import { X } from 'lucide-react';

interface EcoGraphExplorerWindowProps {
  onClose?: () => void;
}

export const EcoGraphExplorerWindow: React.FC<EcoGraphExplorerWindowProps> = ({ onClose }) => {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ecograph/entities');
      const json = await res.json();

      if (json.success) {
        setGraphData({
          nodes: json.nodes || [],
          edges: json.edges || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandNeighborhood = useCallback(async (nodeId: string) => {
    try {
      const res = await fetch(`/api/ecograph/entities?id=${nodeId}&hops=2`);
      const json = await res.json();
      if (json.success && json.neighborhood) {
        setGraphData(json.neighborhood);
        setActiveNodeId(nodeId);
      }
    } catch (err) {
      console.error('Failed to expand neighborhood:', err);
    }
  }, []);

  const handleClose = () => {
    if (onClose) onClose();
    else router.push('/desktop');
  };

  return (
    // z-[200] to render above DesktopLayout's CRT overlays (z-50) and taskbar (z-40)
    <div className="fixed inset-0 w-screen h-screen bg-[#0d1117] text-zinc-100 font-sans overflow-hidden select-none" style={{ zIndex: 200 }}>

      {/* ─── Top Header Bar ──────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-40 h-9 flex items-center justify-between px-3 bg-[#0d1117]/80 backdrop-blur-sm border-b border-zinc-800/30">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
            <line x1="12" y1="3" x2="12" y2="21" />
            <polyline points="8 8 4 12 8 16" />
            <polyline points="16 8 20 12 16 16" />
          </svg>
          <span className="text-[11px] font-medium text-zinc-300 tracking-wide">Graph view</span>
        </div>

        {/* Right: Floating Close Button */}
        <div className="flex items-center gap-1">
          <button onClick={handleClose}
            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
            title="Close (Esc)">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Loading State ───────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0d1117]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-zinc-500 font-mono">Loading knowledge graph…</span>
          </div>
        </div>
      )}

      {/* ─── Full Screen Canvas (below header) ───────────────────────────── */}
      <div className="absolute top-9 left-0 right-0 bottom-0">
        <ObsidianGraphCanvas
          graphData={graphData}
          activeNodeId={activeNodeId}
          onSelectNode={(node) => setActiveNodeId(node.id)}
          onExpandNeighborhood={handleExpandNeighborhood}
        />
      </div>
    </div>
  );
};
