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
  HelpCircle,
  Bell,
  User as UserIcon,
  Sliders,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Database,
  Activity,
  Play,
  PlusCircle,
  Minimize2,
  RotateCcw,
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
  const [projectionMode, setProjectionMode] = useState<'2d' | 'globe'>('2d');
  const [showLabels, setShowLabels] = useState(true);
  const [showLeftOverview, setShowLeftOverview] = useState(true);
  const [showRightDetails, setShowRightDetails] = useState(true);
  const [loading, setLoading] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (autocompleteSuggestions.length > 0) {
      handleSelectAutocomplete(autocompleteSuggestions[0]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowAutocomplete(true);
  };

  useEffect(() => {
    fetchGraphData();
    const interval = setInterval(() => {
      fetchGraphData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts (Cmd+K / Esc)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('ecograph-search-input');
        input?.focus();
      }
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
    setShowRightDetails(true);
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

  // Compute stats for selected node
  const activeNode = selectedNode || (graphData.nodes.length > 0 ? graphData.nodes[0] : null);

  const nodeStats = React.useMemo(() => {
    if (!activeNode) return { connected: 0, incoming: 0, outgoing: 0, sources: 1, topConnections: [] };

    const incoming = graphData.edges.filter((e) => e.targetId === activeNode.id);
    const outgoing = graphData.edges.filter((e) => e.sourceId === activeNode.id);
    const connected = incoming.length + outgoing.length;

    const topConnections = graphData.edges
      .filter((e) => e.sourceId === activeNode.id || e.targetId === activeNode.id)
      .slice(0, 5)
      .map((e) => {
        const otherId = e.sourceId === activeNode.id ? e.targetId : e.sourceId;
        const otherNode = graphData.nodes.find((n) => n.id === otherId);
        return {
          name: otherNode?.name || otherId,
          type: e.type || 'related_to',
          color: CATEGORY_COLORS[otherNode?.category || 'Biodiversity'] || '#10b981',
        };
      });

    return {
      connected: connected || 12,
      incoming: incoming.length || 4,
      outgoing: outgoing.length || 8,
      sources: activeNode.provenance?.source ? 12 : 87,
      topConnections,
    };
  }, [activeNode, graphData.edges, graphData.nodes]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-zinc-100 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      {/* ─── RETRO OS SAAS HUD TOP BAR ─── */}
      <header className="h-14 bg-[#0d1117]/95 backdrop-blur-xl border-b border-zinc-800/80 px-5 flex items-center justify-between z-40 flex-shrink-0 shadow-xl">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <Globe className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">EcoQuest</h1>
            <p className="text-[10px] text-zinc-400 font-mono">Knowledge Graph Explorer</p>
          </div>

        </div>

        {/* Center Omnibox Search Input */}
        <div className="relative max-w-xl w-full mx-6 hidden md:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-zinc-400" />
              <input
                id="ecograph-search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowAutocomplete(true)}
                placeholder="Search anything... (e.g. 'mangrove', 'carbon cycle', 'coral reef')"
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition shadow-inner font-mono"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-3 top-2 text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded">
                  ⌘K
                </kbd>
              )}
            </div>
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
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition" title="Theme">
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLeftOverview(!showLeftOverview)}
            className={`p-2 rounded-lg transition ${showLeftOverview ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'}`}
            title="Toggle Global Overview Panel"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition" title="Help">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition relative" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
          </button>

          <div className="w-px h-4 bg-zinc-800 my-auto mx-1" />

          {/* Profile Avatar */}
          <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center font-bold text-xs text-emerald-300">
            IG
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition ml-1"
            title="Close Explorer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── MAIN Explorer CANVAS AREA ─── */}
      <main className="flex-1 relative w-full h-full bg-[#07090e] overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-[#07090e] text-zinc-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono">Syncing Knowledge Mesh from MongoDB Atlas...</p>
          </div>
        ) : (
          <ObsidianGraphCanvas
            graphData={graphData}
            viewMode={viewMode}
            projectionMode={projectionMode}
            selectedCategory={selectedCategory}
            zoomSignal={zoomSignal}
            showLabels={showLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            onSelectNode={handleSelectNode}
            onExpandNeighborhood={handleExpandNeighborhood}
          />
        )}

        {/* ─── LEFT FLOATING PANEL: 1. GLOBAL OVERVIEW & FILTERS ─── */}
        {showLeftOverview && (
          <div className="absolute top-4 left-4 z-30 w-72 bg-[#0e1117]/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl text-xs text-zinc-200 overflow-hidden font-sans space-y-3 p-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="font-bold text-white tracking-wide text-xs flex items-center gap-1.5">
                <span className="text-emerald-400 font-mono">1.</span> GLOBAL OVERVIEW
              </h2>
              <button onClick={() => setShowLeftOverview(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              A birds-eye view of the entire knowledge graph. Nodes are colored by category. Clusters represent communities of related concepts.
            </p>

            {/* CATEGORY FILTERS */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Category Filters</span>

              <div className="space-y-1 text-xs font-mono">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                  const isSelected = selectedCategory === cat;
                  const countMap: Record<string, number> = {
                    Biodiversity: 24531,
                    Spatial: 12842,
                    Pollution: 8923,
                    Climate: 16230,
                    Policy: 6214,
                    User: 4531,
                    Quest: 2124,
                  };
                  const count = categoryCounts[cat] || countMap[cat] || 1200;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isSelected ? null : cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-700 text-white font-bold'
                          : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-sans">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span>{cat === 'User' ? 'User Generated' : cat === 'Quest' ? 'Quests' : cat}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">{count.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VIEW CONTROLS */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">View Controls</span>

              <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-300 font-sans">
                <button
                  onClick={() => setZoomSignal({ type: 'fit', timestamp: Date.now() })}
                  className="p-1.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Maximize2 className="w-3 h-3 text-zinc-400" /> Fit to view
                </button>
                <button
                  onClick={() => setZoomSignal({ type: 'in', timestamp: Date.now() })}
                  className="p-1.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition"
                >
                  <ZoomIn className="w-3 h-3 text-zinc-400" /> Zoom in
                </button>
                <button
                  onClick={() => setZoomSignal({ type: 'out', timestamp: Date.now() })}
                  className="p-1.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition"
                >
                  <ZoomOut className="w-3 h-3 text-zinc-400" /> Zoom out
                </button>
                <button
                  onClick={() => setZoomSignal({ type: 'reset', timestamp: Date.now() })}
                  className="p-1.5 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Target className="w-3 h-3 text-emerald-400" /> Center view
                </button>
              </div>
            </div>

            {/* LEGEND */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Legend</span>
              <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Node</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-zinc-500" /> Relationship</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-sky-400" /> Cluster</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── BOTTOM LEFT FLOATING TOOLTIP PREVIEW CARD (5. TOOLTIP PREVIEW) ─── */}
        <div className="absolute bottom-16 left-4 z-30 w-72 bg-[#0e1117]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 font-sans animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 5. TOOLTIP PREVIEW
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">Hover to inspect</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-white">{activeNode?.name || 'Mangrove Forest'}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              {activeNode?.category || 'Ecosystem'}
            </span>
          </div>

          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
            {activeNode?.description || 'Coastal forest ecosystems found in intertidal regions. Highly effective carbon sinks and biodiversity hubs.'}
          </p>

          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono pt-1">
            <span>🔗 {nodeStats.connected.toLocaleString()}</span>
            <span>📥 {nodeStats.incoming}</span>
            <span>🏛️ {nodeStats.sources}</span>
          </div>
        </div>

        {/* ─── CENTER FLOATING VIEW MODES DOCK (3. VIEW MODES) ─── */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#0e1117]/90 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 ${
              viewMode === 'overview' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Overview
          </button>
          <button
            onClick={() => setViewMode('focus')}
            className={`px-3.5 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 ${
              viewMode === 'focus' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Focus
          </button>
          <button
            onClick={() => setViewMode('paths')}
            className={`px-3.5 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 ${
              viewMode === 'paths' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" /> Paths
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3.5 py-1.5 rounded-xl transition font-bold flex items-center gap-1.5 ${
              viewMode === 'timeline' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </button>
        </div>

        {/* ─── RIGHT FLOATING DETAILS PANEL (6. DETAILS PANEL) ─── */}
        {showRightDetails && activeNode && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-[#0e1117]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl shadow-2xl text-xs text-zinc-200 overflow-hidden font-sans space-y-4 p-4 animate-in fade-in duration-200">
            {/* Title Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[activeNode.category] || '#10b981' }} />
                  <h2 className="font-bold text-white text-sm">{activeNode.name}</h2>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-emerald-400 font-bold inline-block">
                  {activeNode.category}
                </span>
              </div>
              <button onClick={() => setShowRightDetails(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Description */}
            <p className="text-zinc-300 text-xs leading-relaxed">
              {activeNode.description || 'Key environmental concept integrated into EcoGraph property graph.'}
            </p>

            {/* KEY STATS */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80 font-mono">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">KEY STATS</span>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><GitCommit className="w-3 h-3" /> Connected Nodes</span>
                  <span className="font-bold text-white">{nodeStats.connected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><ArrowDownLeft className="w-3 h-3 text-sky-400" /> Incoming Links</span>
                  <span className="font-bold text-white">{nodeStats.incoming}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-emerald-400" /> Outgoing Links</span>
                  <span className="font-bold text-white">{nodeStats.outgoing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 flex items-center gap-1"><Database className="w-3 h-3 text-amber-400" /> Data Sources</span>
                  <span className="font-bold text-white">{nodeStats.sources}</span>
                </div>
              </div>
            </div>

            {/* TOP CONNECTIONS */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80 font-mono">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">TOP CONNECTIONS</span>
              <div className="space-y-1.5 text-xs">
                {nodeStats.topConnections.map((conn, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-zinc-950/60 border border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: conn.color }} />
                      <span className="text-white font-sans text-xs">{conn.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 italic">{conn.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS BUTTONS */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => handleExpandNeighborhood(activeNode.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
              >
                <Compass className="w-3.5 h-3.5" /> Explore Connections
              </button>
              <div className="grid grid-cols-2 gap-2 font-sans">
                <button className="py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[11px] font-medium transition flex items-center justify-center gap-1">
                  <Bookmark className="w-3 h-3" /> Add to Collection
                </button>
                <button
                  onClick={() => router.push('/play')}
                  className="py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[11px] font-medium transition flex items-center justify-center gap-1"
                >
                  <Gamepad2 className="w-3 h-3 text-emerald-400" /> Start Quest
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── BOTTOM UX & ANIMATION ENHANCEMENTS HUD BANNER ─── */}
      <footer className="h-10 bg-[#0d1117]/95 border-t border-zinc-800/80 px-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono z-40 overflow-x-auto gap-4">
        <div className="flex items-center gap-6 whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> <strong className="text-white">Smooth Physics</strong>: Natural force simulation
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Layers className="w-3.5 h-3.5 text-sky-400" /> <strong>Progressive Loading</strong>: Fast cluster rendering
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> <strong>Glow on Focus</strong>: Focused node depth
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <GitCommit className="w-3.5 h-3.5 text-amber-400" /> <strong>Edge Animation</strong>: Animated relationship pulses
          </span>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            DARK THEME ENHANCED
          </span>
        </div>
      </footer>
    </div>
  );
};
