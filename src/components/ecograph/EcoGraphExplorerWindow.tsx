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
    // Fast 4-second background sync interval
    const interval = setInterval(() => {
      fetchGraphData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const fetchGraphData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch('/api/ecograph/entities', { cache: 'no-store' });
      const json = await res.json();

      if (json.success && json.nodes && json.edges) {
        setGraphData((prev) => {
          // Compare length/data to prevent unnecessary re-renders
          if (prev.nodes.length === json.nodes.length && prev.edges.length === json.edges.length) {
            return prev;
          }
          return {
            nodes: json.nodes,
            edges: json.edges,
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleExpandNeighborhood = useCallback(async (nodeId: string) => {
    try {
      const res = await fetch(`/api/ecograph/entities?id=${nodeId}&hops=2`, { cache: 'no-store' });
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
    if (onClose) {
      onClose();
    } else {
      router.push('/desktop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0d1117]/95 backdrop-blur-md flex flex-col font-sans select-none animate-in fade-in duration-200">
      {/* Window Top Controls */}
      <div className="h-10 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 animate-pulse" />
          <span className="text-xs font-bold text-zinc-200 font-mono tracking-wide">
            EcoGraph Public Knowledge SaaS Explorer
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            Live MongoDB Atlas Synced
          </span>
        </div>

        <button
          onClick={handleClose}
          className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded transition"
          title="Close Graph Explorer (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Body */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#0d1117] text-zinc-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Syncing Knowledge Mesh from MongoDB Atlas...</p>
          </div>
        ) : (
          <ObsidianGraphCanvas
            graphData={graphData}
            activeNodeId={activeNodeId}
            onExpandNeighborhood={handleExpandNeighborhood}
          />
        )}
      </div>
    </div>
  );
};
