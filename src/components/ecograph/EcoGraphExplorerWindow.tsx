'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GraphData, EcoNode } from '@/lib/ecograph/types';
import { ObsidianGraphCanvas, CATEGORY_COLORS } from './ObsidianGraphCanvas';
import {
  Search,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Compass,
  Globe,
  Target,
  GitCommit,
  Clock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Bookmark,
  Gamepad2,
  Sun,
  Layers,
  Tag,
  Sliders,
} from 'lucide-react';

interface EcoGraphExplorerWindowProps {
  onClose?: () => void;
}

export const EcoGraphExplorerWindow: React.FC<EcoGraphExplorerWindowProps> = ({ onClose }) => {
  const router = useRouter();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);

  // Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'focus' | 'paths' | 'timeline'>('overview');
  const [zoomSignal, setZoomSignal] = useState<{ type: 'in' | 'out' | 'reset' | 'fit'; timestamp: number } | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showLeftDrawer, setShowLeftDrawer] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
    const interval = setInterval(() => {
      fetchGraphData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Escape key
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
        setCategoryCounts(json.categoryCounts || {});
        setGraphData((prev) => {
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

  const handleSelectNode = useCallback(async (node: EcoNode) => {
    setSelectedNode(node);
    try {
      const res = await fetch(`/api/ecograph/entities?id=${node.id}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.entity) {
        setNodeDetails(json.entity);
      }
    } catch (err) {
      console.error('Failed to fetch node details:', err);
    }
  }, []);

  const handleExpandNeighborhood = useCallback(async (nodeId: string) => {
    try {
      const res = await fetch(`/api/ecograph/entities?id=${nodeId}&hops=2`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.neighborhood) {
        setGraphData(json.neighborhood);
        if (json.entity) setNodeDetails(json.entity);
      }
    } catch (err) {
      console.error('Failed to expand neighborhood:', err);
    }
  }, []);

  // Autocomplete Suggestions
  const autocompleteSuggestions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return graphData.nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.scientificName && n.scientificName.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [graphData.nodes, searchQuery]);

  const handleSelectAutocomplete = (node: EcoNode) => {
    setSearchQuery(node.name);
    setShowAutocomplete(false);
    handleSelectNode(node);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/desktop');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* ─── TOP NAVBAR HEADER ─── */}
      <header className="h-14 bg-[#0d1117]/95 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between px-5 flex-shrink-0 z-30 shadow-md">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">EcoQuest</h1>
            <p className="text-[10px] text-zinc-400 font-mono">Knowledge Graph Explorer</p>
          </div>
        </div>

        {/* Center Omnibox Search Input */}
        <div className="relative max-w-xl w-full mx-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (autocompleteSuggestions.length > 0) {
                handleSelectAutocomplete(autocompleteSuggestions[0]);
              }
            }}
            className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40 transition shadow-inner"
          >
            <Search className="w-4 h-4 text-emerald-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              placeholder="Search species, habitats, policies..."
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowAutocomplete(false);
                }}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showAutocomplete && autocompleteSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161b22]/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-40 divide-y divide-zinc-800/60 animate-in fade-in">
              {autocompleteSuggestions.map((node) => {
                const color = CATEGORY_COLORS[node.category] || '#10b981';
                return (
                  <div
                    key={node.id}
                    onClick={() => handleSelectAutocomplete(node)}
                    className="p-2.5 hover:bg-zinc-800/60 cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                          {node.name}
                        </div>
                        {node.scientificName && (
                          <div className="text-[10px] text-zinc-400 italic">{node.scientificName}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {node.category}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-400 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition">
            <Sun className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition">
            <Layers className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-800 my-auto mx-1" />

          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── 100% MAXIMUM FULL-PAGE CANVAS CONTAINER ─── */}
      <main className="flex-1 relative w-full h-full bg-[#0d1117] overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#0d1117] text-zinc-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Syncing Knowledge Mesh from MongoDB Atlas...</p>
          </div>
        ) : (
          <ObsidianGraphCanvas
            graphData={graphData}
            viewMode={viewMode}
            selectedCategory={selectedCategory}
            zoomSignal={zoomSignal}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            onSelectNode={handleSelectNode}
            onExpandNeighborhood={handleExpandNeighborhood}
          />
        )}

        {/* ─── SLEEK SMALL FLOATING LEFT WIDGET: OVERVIEW & FILTERS ─── */}
        <div className="absolute top-4 left-4 z-30 w-64 bg-[#161b22]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl text-xs text-zinc-200 overflow-hidden">
          <div
            onClick={() => setShowLeftDrawer(!showLeftDrawer)}
            className="p-2.5 flex items-center justify-between cursor-pointer border-b border-zinc-800/80 bg-[#161b22] hover:bg-zinc-800/50 transition"
          >
            <div className="flex items-center gap-2 font-bold text-white tracking-wide">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Overview & Filters</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showLeftDrawer ? 'rotate-180' : ''}`} />
          </div>

          {showLeftDrawer && (
            <div className="p-3 space-y-3 max-h-[65vh] overflow-y-auto font-sans">
              {/* Categories */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Categories</h3>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-lg border transition ${
                      selectedCategory === null ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>All</span>
                    <span className="font-mono text-[10px]">{graphData.nodes.length}</span>
                  </button>

                  {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                    const isSelected = selectedCategory === cat;
                    const count = categoryCounts[cat] || 45;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(isSelected ? null : cat)}
                        className={`w-full flex items-center justify-between px-2 py-1 rounded-lg border transition ${
                          isSelected ? 'bg-zinc-800 border-zinc-700 text-white font-bold' : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span>{cat}</span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Controls */}
              <div className="space-y-1.5 border-t border-zinc-800/80 pt-2.5">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">View Controls</h3>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-medium text-zinc-300">
                  <button
                    onClick={() => setZoomSignal({ type: 'fit', timestamp: Date.now() })}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <Maximize2 className="w-3 h-3 text-emerald-400" />
                    <span>Fit</span>
                  </button>
                  <button
                    onClick={() => setZoomSignal({ type: 'in', timestamp: Date.now() })}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <ZoomIn className="w-3 h-3 text-sky-400" />
                    <span>Zoom In</span>
                  </button>
                  <button
                    onClick={() => setZoomSignal({ type: 'out', timestamp: Date.now() })}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <ZoomOut className="w-3 h-3 text-amber-400" />
                    <span>Zoom Out</span>
                  </button>
                  <button
                    onClick={() => setZoomSignal({ type: 'reset', timestamp: Date.now() })}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition"
                  >
                    <Compass className="w-3 h-3 text-purple-400" />
                    <span>Center</span>
                  </button>
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`col-span-2 flex items-center justify-center gap-1.5 px-2 py-1 border rounded-lg transition ${
                      showLabels ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>Labels ({showLabels ? 'ON' : 'OFF'})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── FLOATING BOTTOM VIEW MODES BAR ─── */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#161b22]/95 backdrop-blur-xl border border-zinc-800 p-1.5 rounded-2xl shadow-2xl text-xs">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'overview' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setViewMode('focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'focus' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span>Focus</span>
          </button>

          <button
            onClick={() => setViewMode('paths')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'paths' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-400" />
            <span>Paths</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              viewMode === 'timeline' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Timeline</span>
          </button>
        </div>

        {/* ─── SLEEK SMALL FLOATING POPUP ENTITY DETAILS CARD ─── */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-30 w-72 bg-[#161b22]/95 backdrop-blur-xl border border-zinc-800 p-3.5 rounded-2xl shadow-2xl text-xs space-y-3 text-zinc-200 max-h-[65vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <h2 className="text-xs font-bold text-white tracking-wide truncate max-w-[170px]">{selectedNode.name}</h2>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-1 inline-block">
                  {selectedNode.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Summary */}
            <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80 line-clamp-4">
              {selectedNode.description}
            </p>

            {/* Key Stats Grid */}
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Key Stats</h3>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                  <span className="text-[9px] text-zinc-500 block">Connected Nodes</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {nodeDetails?.stats?.connectedNodesCount || 12}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
                  <span className="text-[9px] text-zinc-500 block">Data Sources</span>
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {nodeDetails?.stats?.dataSourcesCount || 8}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Connections */}
            <div className="space-y-1">
              <h3 className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Top Connections</h3>
              <div className="space-y-1 text-xs">
                {(nodeDetails?.topConnections || [
                  { id: '1', name: 'Carbon Cycle', relation: 'stores' },
                  { id: '2', name: 'Coastal Protection', relation: 'protects' },
                ]).slice(0, 3).map((conn: any) => (
                  <div key={conn.id} className="bg-zinc-950/80 p-1.5 rounded-lg border border-zinc-800/80 flex items-center justify-between">
                    <span className="font-medium text-white truncate max-w-[130px] text-[11px]">{conn.name}</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                      {conn.relation}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
              <button
                onClick={() => handleExpandNeighborhood(selectedNode.id)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Connections</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
                <button className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg flex items-center justify-center gap-1 transition text-[11px]">
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  <span>Bookmark</span>
                </button>
                <button className="py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg flex items-center justify-center gap-1 transition text-[11px]">
                  <Gamepad2 className="w-3 h-3 text-purple-400" />
                  <span>Start Quest</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
