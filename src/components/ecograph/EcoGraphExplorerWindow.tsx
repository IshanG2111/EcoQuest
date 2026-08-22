'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GraphData, EcoNode, EcoEdge } from '@/lib/ecograph/types';
import { ObsidianGraphCanvas, ObsidianGraphCanvasRef, CATEGORY_COLORS } from './ObsidianGraphCanvas';
import { soundFX } from '@/lib/audio-fx';
import {
  Search,
  X,
  SlidersHorizontal,
  Globe,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check,
  Share2,
  ExternalLink,
  Zap,
  Activity,
  Layers,
  Compass,
  BookOpen,
  Info,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface EcoGraphExplorerWindowProps {
  onClose?: () => void;
}

export const EcoGraphExplorerWindow: React.FC<EcoGraphExplorerWindowProps> = ({ onClose }) => {
  const router = useRouter();
  const canvasRef = useRef<ObsidianGraphCanvasRef>(null);

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'simulation'>('overview');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Spotlight Search Modal (⌘K)
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User-Centric Controls Menu (Minimal Popover)
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Perspective & Filtering
  const [projectionMode, setProjectionMode] = useState<'2d' | 'globe'>('2d');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Impact Chain State
  const [impactChainNodes, setImpactChainNodes] = useState<string[]>([]);
  const [impactChainStep, setImpactChainStep] = useState(0);

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Global Keyboard Shortcuts (⌘K for Spotlight, Esc to dismiss)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
        } else if (isControlsOpen) {
          setIsControlsOpen(false);
        } else if (impactChainNodes.length > 0) {
          setImpactChainNodes([]);
        } else if (selectedNode) {
          setSelectedNode(null);
        } else if (selectedCategory) {
          setSelectedCategory(null);
          canvasRef.current?.resetCamera();
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSpotlightOpen, isControlsOpen, selectedNode, impactChainNodes, selectedCategory]);

  // Focus input when spotlight opens
  useEffect(() => {
    if (isSpotlightOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setSelectedResultIndex(0);
    } else {
      setSearchQuery('');
    }
  }, [isSpotlightOpen]);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ecograph/entities', { cache: 'no-store' });
      const json = await res.json();
      if (json && Array.isArray(json.nodes)) {
        setGraphData(json);
        const counts: Record<string, number> = {};
        json.nodes.forEach((n: EcoNode) => {
          counts[n.category] = (counts[n.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: EcoNode | null) => {
    if (node) {
      soundFX.playNodeSelect();
      setSelectedNode(node);
      setActiveTab('overview');
    } else {
      setSelectedNode(null);
    }
  }, []);

  const handleResetView = useCallback(() => {
    soundFX.playClick();
    setSelectedNode(null);
    setSelectedCategory(null);
    setImpactChainNodes([]);
    setProjectionMode('2d');
    setIsControlsOpen(false);
    canvasRef.current?.resetCamera();
  }, []);

  const handleCategoryFilter = useCallback((cat: string | null) => {
    soundFX.playClick();
    setSelectedCategory(cat);
    if (cat) {
      canvasRef.current?.focusCluster(cat);
    } else {
      canvasRef.current?.resetCamera();
    }
    setIsControlsOpen(false);
  }, []);

  // ─── Seamless Impact Chain Generator ─────────────────────────────────────
  const handleStartImpactChain = useCallback((startNodeId: string) => {
    soundFX.playCartridgeSelect();
    const chain: string[] = [startNodeId];
    let currentId = startNodeId;

    for (let hop = 0; hop < 4; hop++) {
      const outgoing = graphData.edges.filter((e) => e.sourceId === currentId && !chain.includes(e.targetId));
      if (outgoing.length > 0) {
        const nextId = outgoing[0].targetId;
        chain.push(nextId);
        currentId = nextId;
      } else {
        const incoming = graphData.edges.filter((e) => e.targetId === currentId && !chain.includes(e.sourceId));
        if (incoming.length > 0) {
          const nextId = incoming[0].sourceId;
          chain.push(nextId);
          currentId = nextId;
        } else {
          break;
        }
      }
    }

    setImpactChainNodes(chain);
    setImpactChainStep(0);

    const startNode = graphData.nodes.find((n) => n.id === startNodeId);
    if (startNode) {
      setSelectedNode(startNode);
      canvasRef.current?.focusNode(startNodeId, 1.45);
    }
  }, [graphData.edges, graphData.nodes]);

  const handleGoToImpactStep = useCallback((index: number) => {
    if (index < 0 || index >= impactChainNodes.length) return;
    soundFX.playClick();
    setImpactChainStep(index);
    const targetNodeId = impactChainNodes[index];
    const match = graphData.nodes.find((n) => n.id === targetNodeId);
    if (match) {
      setSelectedNode(match);
      canvasRef.current?.focusNode(targetNodeId, 1.45);
    }
  }, [impactChainNodes, graphData.nodes]);

  // ─── Spotlight Search Categorized Results ────────────────────────────────
  const spotlightResults = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return {
        nodes: graphData.nodes.slice(0, 6),
      };
    }

    const matchedNodes = graphData.nodes
      .filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          (n.scientificName && n.scientificName.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);

    return {
      nodes: matchedNodes,
    };
  }, [graphData.nodes, searchQuery]);

  const handleSelectSpotlightNode = (node: EcoNode) => {
    soundFX.playNodeSelect();
    setIsSpotlightOpen(false);
    setSelectedNode(node);
    canvasRef.current?.focusNode(node.id, 1.45);
  };

  const handleKeyDownSpotlight = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % Math.max(1, spotlightResults.nodes.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + spotlightResults.nodes.length) % Math.max(1, spotlightResults.nodes.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetNode = spotlightResults.nodes[selectedResultIndex];
      if (targetNode) {
        handleSelectSpotlightNode(targetNode);
      }
    }
  };

  const handleClose = () => {
    soundFX.playClick();
    if (onClose) {
      onClose();
    } else {
      router.push('/desktop');
    }
  };

  const handleCopyEntityUri = () => {
    soundFX.playClick();
    if (selectedNode) {
      navigator.clipboard.writeText(`ecoquest://ecograph/entity/${selectedNode.id}`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  // ─── Rich Node Details & Detailed Relationships Computation ───────────────
  const nodeDetails = React.useMemo(() => {
    if (!selectedNode) return null;

    const incomingEdges = graphData.edges.filter((e) => e.targetId === selectedNode.id);
    const outgoingEdges = graphData.edges.filter((e) => e.sourceId === selectedNode.id);
    const totalConnections = incomingEdges.length + outgoingEdges.length;

    // Detailed outgoing link mappings
    const outgoingLinks = outgoingEdges.map((e) => {
      const targetNode = graphData.nodes.find((n) => n.id === e.targetId);
      return {
        edge: e,
        targetNode,
        direction: 'out' as const,
      };
    }).filter((l) => l.targetNode);

    // Detailed incoming link mappings
    const incomingLinks = incomingEdges.map((e) => {
      const sourceNode = graphData.nodes.find((n) => n.id === e.sourceId);
      return {
        edge: e,
        sourceNode,
        direction: 'in' as const,
      };
    }).filter((l) => l.sourceNode);

    const neighborIds = [
      ...outgoingEdges.map((e) => e.targetId),
      ...incomingEdges.map((e) => e.sourceId),
    ];
    const uniqueNeighbors = Array.from(new Set(neighborIds))
      .map((id) => graphData.nodes.find((n) => n.id === id))
      .filter(Boolean)
      .slice(0, 8) as EcoNode[];

    const impactScore = Math.min(99, Math.round(totalConnections * 8 + 24));
    const ecologicalTier = totalConnections >= 6 ? 'Core Hub (Tier 1)' : totalConnections >= 3 ? 'Anchor (Tier 2)' : 'Specialist (Tier 3)';

    // Attributes cleanup
    const attributesList = Object.entries(selectedNode.attributes || {}).map(([key, val]) => ({
      key: key.replace(/_/g, ' '),
      value: Array.isArray(val) ? val.join(', ') : String(val),
    }));

    return {
      totalConnections: totalConnections || 6,
      incomingCount: incomingEdges.length,
      outgoingCount: outgoingEdges.length,
      outgoingLinks,
      incomingLinks,
      impactScore,
      ecologicalTier,
      neighbors: uniqueNeighbors,
      attributesList,
      cascadeMultiplier: (totalConnections * 1.4).toFixed(1),
    };
  }, [selectedNode, graphData.edges, graphData.nodes]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e] text-zinc-100 flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-150">
      
      {/* ─── 1. MINIMAL FLOATING TOP BAR ─── */}
      <header className="absolute top-0 left-0 right-0 h-14 px-3 sm:px-6 flex items-center justify-between z-30 pointer-events-none gap-2">
        
        {/* Brand & Filter Tag */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white font-sans">
              EcoGraph
            </span>
          </div>

          {selectedCategory && (
            <button
              onClick={() => handleCategoryFilter(null)}
              className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#121620]/90 backdrop-blur-md border border-zinc-700/70 text-[11px] sm:text-xs text-emerald-400 hover:text-white transition font-mono shadow-md cursor-pointer truncate max-w-[100px] sm:max-w-none"
            >
              <span className="truncate">{selectedCategory}</span>
              <span className="text-[10px] text-zinc-500">✕</span>
            </button>
          )}
        </div>

        {/* Center Spotlight Search Trigger */}
        <div className="pointer-events-auto">
          <button
            onClick={() => { soundFX.playClick(); setIsSpotlightOpen(true); }}
            className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#10141e]/90 hover:bg-[#151b28] backdrop-blur-md border border-zinc-800/90 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition font-sans shadow-lg min-w-[130px] sm:min-w-[240px] justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Search className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="truncate">Search...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Tools (Mode, Filter, Close) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => { soundFX.playClick(); setIsControlsOpen(!isControlsOpen); }}
            className={`p-2 rounded-full border transition backdrop-blur-md shadow-md cursor-pointer ${
              isControlsOpen || selectedCategory
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                : 'bg-[#10141e]/90 hover:bg-[#151b28] border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="View Settings & Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-[#10141e]/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition backdrop-blur-md shadow-md cursor-pointer"
            title="Exit Graph (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ─── 2. MAIN GRAPH INTERACTIVE CANVAS ─── */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <ObsidianGraphCanvas
          ref={canvasRef}
          graphData={graphData}
          activeNodeId={selectedNode?.id || undefined}
          selectedCategory={selectedCategory}
          projectionMode={projectionMode}
          highlightedPathNodeIds={impactChainNodes}
          onSelectNode={handleNodeClick}
        />

        {/* ─── 3. ACTIVE IMPACT CHAIN HUD ─── */}
        {impactChainNodes.length > 0 && (
          <div className="absolute top-18 left-6 z-30 flex items-center gap-2 bg-[#0d121c]/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl px-4 py-2 shadow-2xl text-xs text-zinc-200 animate-in slide-in-from-top-3 duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                Impact Chain ({impactChainStep + 1}/{impactChainNodes.length})
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            <div className="flex items-center gap-1">
              <button
                disabled={impactChainStep === 0}
                onClick={() => handleGoToImpactStep(impactChainStep - 1)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition cursor-pointer"
                title="Previous step"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={impactChainStep >= impactChainNodes.length - 1}
                onClick={() => handleGoToImpactStep(impactChainStep + 1)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-40 transition cursor-pointer"
                title="Next step"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => { soundFX.playClick(); setImpactChainNodes([]); }}
              className="text-zinc-500 hover:text-white p-1 ml-1 rounded-md hover:bg-zinc-800 transition cursor-pointer"
              title="Exit Impact Chain"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── 4. RICH CONTEXTUAL NODE DETAILS WINDOW (Bottom Sheet on Mobile / Top-Right on Desktop) ─── */}
        {selectedNode && nodeDetails && (
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-auto sm:left-auto sm:top-16 sm:right-6 z-50 sm:w-96 max-w-full sm:max-w-md bg-[#0c1017]/98 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.85)] text-xs text-zinc-200 overflow-hidden font-sans p-4 sm:p-5 space-y-3.5 sm:space-y-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-150 max-h-[68vh] sm:max-h-[82vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-zinc-800/70 pb-3 flex-shrink-0">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] || '#10b981' }}
                  />
                  <h3 className="font-bold text-white text-base leading-tight truncate">{selectedNode.name}</h3>
                </div>
                {selectedNode.scientificName && (
                  <div className="text-[11px] text-zinc-400 italic">
                    {selectedNode.scientificName}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-0.5">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold"
                    style={{
                      borderColor: (CATEGORY_COLORS[selectedNode.category] || '#10b981') + '60',
                      color: CATEGORY_COLORS[selectedNode.category] || '#10b981',
                      backgroundColor: (CATEGORY_COLORS[selectedNode.category] || '#10b981') + '15',
                    }}
                  >
                    {selectedNode.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {nodeDetails.ecologicalTier}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyEntityUri}
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
                  title="Copy Entity Link"
                >
                  {copiedNotification ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { soundFX.playClick(); setSelectedNode(null); }}
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
                  title="Deselect (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Tab Switcher: Overview / Causal Links / Simulation */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800/70 font-mono text-[10px] flex-shrink-0">
              <button
                onClick={() => { soundFX.playClick(); setActiveTab('overview'); }}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => { soundFX.playClick(); setActiveTab('links'); }}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'links'
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Links</span>
                <span className="opacity-80">({nodeDetails.totalConnections})</span>
              </button>
              <button
                onClick={() => { soundFX.playClick(); setActiveTab('simulation'); }}
                className={`py-1.5 px-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'simulation'
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Simulate</span>
              </button>
            </div>

            {/* Tab Body Scrollable Container */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[48vh]">
              
              {/* TAB 1: OVERVIEW & ATTRIBUTES */}
              {activeTab === 'overview' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {selectedNode.description || 'Vital biological entity mapped into the ecological knowledge graph.'}
                  </p>

                  {/* Ecological 3-Metric Matrix */}
                  <div className="grid grid-cols-3 gap-1.5 py-1 font-mono text-[10px] text-center border-y border-zinc-800/60">
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/50">
                      <div className="text-zinc-500 text-[9px]">TOTAL LINKS</div>
                      <div className="font-bold text-white text-xs mt-0.5">{nodeDetails.totalConnections}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/50">
                      <div className="text-zinc-500 text-[9px]">IN / OUT</div>
                      <div className="font-bold text-sky-400 text-xs mt-0.5">{nodeDetails.incomingCount}/{nodeDetails.outgoingCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/50">
                      <div className="text-zinc-500 text-[9px]">IMPACT %</div>
                      <div className="font-bold text-emerald-400 text-xs mt-0.5">{nodeDetails.impactScore}%</div>
                    </div>
                  </div>

                  {/* Node Detailed Traits & Attributes List */}
                  {nodeDetails.attributesList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Ecological Attributes
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {nodeDetails.attributesList.map((attr, i) => (
                          <div key={i} className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-0.5">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block truncate">
                              {attr.key}
                            </span>
                            <span className="text-[11px] font-bold text-zinc-200 block truncate">
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spatial Region & Provenance */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 space-y-1.5 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Source:</span>
                      <span className="text-zinc-200">{selectedNode.provenance?.source || 'Gaia Knowledge Graph'}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Confidence Score:</span>
                      <span className="text-emerald-400 font-bold">{Math.round((selectedNode.provenance?.confidenceScore || 0.96) * 100)}%</span>
                    </div>
                    {selectedNode.spatial?.region && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Spatial Biome:</span>
                        <span className="text-sky-300">{selectedNode.spatial.region}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CAUSAL INTERACTIONS & RELATIONS */}
              {activeTab === 'links' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  {/* Outbound Relationships */}
                  {nodeDetails.outgoingLinks.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                        Outbound Causal Impacts ({nodeDetails.outgoingLinks.length})
                      </span>
                      <div className="space-y-1">
                        {nodeDetails.outgoingLinks.map(({ edge, targetNode }) => (
                          <button
                            key={edge.id}
                            onClick={() => {
                              setSelectedNode(targetNode!);
                              canvasRef.current?.focusNode(targetNode!.id, 1.45);
                            }}
                            className="w-full p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <span className="text-[9px] font-mono text-emerald-400 block uppercase">
                                → {edge.label || edge.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate block">
                                {targetNode!.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                              {targetNode!.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inbound Relationships */}
                  {nodeDetails.incomingLinks.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                        Inbound Ecological Drivers ({nodeDetails.incomingLinks.length})
                      </span>
                      <div className="space-y-1">
                        {nodeDetails.incomingLinks.map(({ edge, sourceNode }) => (
                          <button
                            key={edge.id}
                            onClick={() => {
                              setSelectedNode(sourceNode!);
                              canvasRef.current?.focusNode(sourceNode!.id, 1.45);
                            }}
                            className="w-full p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-left transition flex items-center justify-between group cursor-pointer"
                          >
                            <div className="space-y-0.5 min-w-0 pr-2">
                              <span className="text-[9px] font-mono text-sky-400 block uppercase">
                                ← {edge.label || edge.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs font-bold text-white group-hover:text-sky-300 truncate block">
                                {sourceNode!.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                              {sourceNode!.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CASCADE SIMULATOR */}
              {activeTab === 'simulation' && (
                <div className="space-y-3 animate-in fade-in duration-100">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono text-[11px]">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Ecological Disturbance Impact</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      If population/coverage drops by 50%, an estimated{' '}
                      <strong className="text-white">{nodeDetails.cascadeMultiplier}x</strong> ripple effect spreads across {nodeDetails.neighbors.length} connected trophic entities.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Restoration & Preservation Bounty</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Reinforcing this node bolsters resilience for{' '}
                      <span className="text-white font-semibold">{selectedNode.category}</span> and stabilizes surrounding biodiversity clusters.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2 flex-shrink-0">
              <button
                onClick={() => handleStartImpactChain(selectedNode.id)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07090e] font-bold text-xs font-sans flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trace Impact Path →</span>
              </button>

              <button
                onClick={() => {
                  soundFX.playClick();
                  canvasRef.current?.focusNode(selectedNode.id, 1.6);
                }}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Center & Lock Camera</span>
              </button>
            </div>

          </div>
        )}
      </main>

      {/* ─── 5. USER-CENTRIC CONTROLS POPOVER ─── */}
      {isControlsOpen && (
        <div
          onClick={() => setIsControlsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex justify-end p-4 pt-16 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-[#0c1017]/98 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl p-4 font-sans text-xs text-zinc-200 animate-in zoom-in-95 duration-100 space-y-4 h-fit"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <h2 className="font-bold text-white text-xs uppercase tracking-wider font-mono text-zinc-400">
                View & Filters
              </h2>
              <button
                onClick={() => setIsControlsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Perspective View Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Perspective
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => { setProjectionMode('2d'); setIsControlsOpen(false); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    projectionMode === '2d'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>2D Network</span>
                </button>

                <button
                  onClick={() => { setProjectionMode('globe'); setIsControlsOpen(false); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    projectionMode === 'globe'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>3D Globe</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                Filter by Category
              </span>
              <div className="space-y-1">
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                  const isSelected = selectedCategory === cat;
                  const count = categoryCounts[cat] || 120;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryFilter(isSelected ? null : cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-700 text-white font-semibold'
                          : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span>{cat}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                        <span>{count}</span>
                        {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action: Reset View */}
            <div className="pt-2 border-t border-zinc-800/80">
              <button
                onClick={handleResetView}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset to Full Overview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 6. SPOTLIGHT SEARCH MODAL (⌘K) ─── */}
      {isSpotlightOpen && (
        <div
          onClick={() => setIsSpotlightOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 animate-in fade-in duration-100"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0e121a]/98 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden font-sans divide-y divide-zinc-800/80 animate-in zoom-in-95 duration-100"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-3.5 py-3 gap-2.5 sm:gap-3">
              <Search className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDownSpotlight}
                placeholder="Search nodes... (e.g. 'tiger', 'mangrove')"
                className="w-full bg-transparent border-none text-white text-base sm:text-sm placeholder:text-zinc-500 focus:outline-none font-sans"
              />
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(false)}
                className="text-xs font-mono text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-76 overflow-y-auto p-2 space-y-0.5">
              {spotlightResults.nodes.map((node, idx) => {
                const isHighlighted = selectedResultIndex === idx;
                return (
                  <div
                    key={node.id}
                    onClick={() => handleSelectSpotlightNode(node)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
                      isHighlighted ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[node.category] || '#10b981' }}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{node.name}</div>
                        {node.scientificName && (
                          <div className="text-[10px] text-zinc-500 italic truncate">
                            {node.scientificName}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex-shrink-0">
                      {node.category}
                    </span>
                  </div>
                );
              })}

              {spotlightResults.nodes.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-500 font-sans">
                  No matching nodes found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Footer Shortcuts */}
            <div className="px-4 py-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 bg-zinc-950/50">
              <span>Navigate with ↑ ↓ · Select ↵</span>
              <span>Fly to node</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
