'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { EcoNode, GraphData } from '@/lib/ecograph/types';
import { Search, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// ─── Color Palette ───────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Biodiversity: '#10b981',
  Spatial:      '#38bdf8',
  Pollution:    '#f43f5e',
  Climate:      '#f97316',
  Policy:       '#a855f7',
  User:         '#ec4899',
  Quest:        '#06b6d4',
};

const NEON_PALETTE = [
  '#f97316', '#ff2a6d', '#a855f7', '#06b6d4', '#10b981',
  '#facc15', '#ec4899', '#38bdf8', '#fb7185', '#34d399',
  '#c084fc', '#f43f5e', '#22d3ee', '#e879f9', '#fbbf24',
];

// ─── Physics Node Type ───────────────────────────────────────────────────────
interface PhysicsNode {
  id: string;
  node: EcoNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface ObsidianGraphCanvasProps {
  graphData: GraphData;
  activeNodeId?: string;
  highlightedPathNodeIds?: string[];
  onSelectNode?: (node: EcoNode) => void;
  onExpandNeighborhood?: (nodeId: string) => void;
}

export const ObsidianGraphCanvas: React.FC<ObsidianGraphCanvasProps> = ({
  graphData,
  highlightedPathNodeIds = [],
  onSelectNode,
  onExpandNeighborhood,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<PhysicsNode[]>([]);
  const animIdRef = useRef<number>(0);
  const edgeMapRef = useRef<Map<string, PhysicsNode>>(new Map());
  const frameCountRef = useRef(0);

  // ─── Camera State ─────────────────────────────────────────────────────────
  const cameraRef = useRef({ zoom: 0.6, panX: 0, panY: 0 });
  const [, forceRender] = useState(0);

  // ─── Dynamic Global Admin Physics & Display Settings ──────────────────────
  const [repulsion, setRepulsion] = useState(1400);
  const [linkDist, setLinkDist] = useState(80);
  const [centerForce, setCenterForce] = useState(0.008);
  const [friction, setFriction] = useState(0.92);
  const [nodeSize, setNodeSize] = useState(1.2);
  const [lineOpacity, setLineOpacity] = useState(0.35);
  const [groupColors, setGroupColors] = useState<Record<string, string>>({ ...CATEGORY_COLORS });

  // Fetch live global presets on mount and poll every 4 seconds
  useEffect(() => {
    const fetchGlobalPresets = async () => {
      try {
        const res = await fetch('/api/ecograph/presets', { cache: 'no-store' });
        const json = await res.json();
        if (json.success && json.presets) {
          const p = json.presets;
          if (p.repulsion) setRepulsion(p.repulsion);
          if (p.linkDist) setLinkDist(p.linkDist);
          if (p.centerForce) setCenterForce(p.centerForce);
          if (p.friction) setFriction(p.friction);
          if (p.nodeSize) setNodeSize(p.nodeSize);
          if (p.lineOpacity) setLineOpacity(p.lineOpacity);
          if (p.categoryColors) setGroupColors((prev) => ({ ...prev, ...p.categoryColors }));
        }
      } catch (err) {
        // Fallback to defaults
      }
    };
    fetchGlobalPresets();
    const interval = setInterval(fetchGlobalPresets, 4000);
    return () => clearInterval(interval);
  }, []);

  // Re-wake physics simulation whenever global preset parameters change!
  useEffect(() => {
    frameCountRef.current = 0;
    physicsRef.current.forEach((n) => {
      n.vx = (Math.random() - 0.5) * 5;
      n.vy = (Math.random() - 0.5) * 5;
    });
  }, [repulsion, linkDist, centerForce, friction, nodeSize]);

  // ─── User Explore Controls State ──────────────────────────────────────────
  const [searchFilter, setSearchFilter] = useState('');
  const [showLabels, setShowLabels] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    Biodiversity: true, Spatial: true, Pollution: true, Climate: true, Policy: true, User: true, Quest: true,
  });

  // ─── Interaction State ────────────────────────────────────────────────────
  const dragRef = useRef<{
    mode: 'none' | 'pan' | 'node';
    nodeId: string | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({ mode: 'none', nodeId: null, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ─── Initialize Physics Nodes ─────────────────────────────────────────────
  useEffect(() => {
    const W = 1800;
    const H = 1200;
    const cx = W / 2;
    const cy = H / 2;

    const catCenters: Record<string, { x: number; y: number }> = {
      Biodiversity: { x: cx - 120, y: cy - 80 },
      Spatial:      { x: cx + 140, y: cy - 60 },
      Pollution:    { x: cx - 70,  y: cy + 100 },
      Climate:      { x: cx + 40,  y: cy + 140 },
      Policy:       { x: cx + 180, y: cy + 70 },
      User:         { x: cx - 180, y: cy + 30 },
      Quest:        { x: cx,       y: cy - 150 },
    };

    frameCountRef.current = 0; // reset cooling

    physicsRef.current = graphData.nodes.map((node, idx) => {
      const cc = catCenters[node.category] || { x: cx, y: cy };
      const angle = Math.random() * Math.PI * 2;
      const spread = 40 + Math.random() * 140;
      const baseColor = groupColors[node.category] || CATEGORY_COLORS[node.category] || NEON_PALETTE[idx % NEON_PALETTE.length];

      let r = 3;
      if (node.label === 'Species' || node.label === 'Policy') r = 5;
      if (node.label === 'Habitat') r = 6;
      if (node.id.startsWith('obsidian-node')) r = 2 + Math.random() * 2;

      return {
        id: node.id,
        node,
        x: cc.x + Math.cos(angle) * spread,
        y: cc.y + Math.sin(angle) * spread,
        vx: 0,
        vy: 0,
        radius: r * nodeSize,
        color: baseColor,
        glow: baseColor + '60',
      };
    });

    const map = new Map<string, PhysicsNode>();
    physicsRef.current.forEach(n => map.set(n.id, n));
    edgeMapRef.current = map;
  }, [graphData, groupColors, nodeSize]);

  // ─── Transform Helpers ────────────────────────────────────────────────────
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const cam = cameraRef.current;
    return {
      x: (sx - cam.panX) / cam.zoom,
      y: (sy - cam.panY) / cam.zoom,
    };
  }, []);

  // ─── Canvas Resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ─── Main Physics + Render Loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width;
      const H = canvas.height;
      const nodes = physicsRef.current;
      const cam = cameraRef.current;
      const worldCx = (W / dpr / 2 - cam.panX) / cam.zoom;
      const worldCy = (H / dpr / 2 - cam.panY) / cam.zoom;

      // ── Physics Step ──
      const catCenters: Record<string, { x: number; y: number; count: number }> = {};
      nodes.forEach((n) => {
        if (!catCenters[n.node.category]) {
          catCenters[n.node.category] = { x: 0, y: 0, count: 0 };
        }
        catCenters[n.node.category].x += n.x;
        catCenters[n.node.category].y += n.y;
        catCenters[n.node.category].count += 1;
      });
      Object.keys(catCenters).forEach((cat) => {
        const c = catCenters[cat];
        if (c.count > 0) {
          c.x /= c.count;
          c.y /= c.count;
        }
      });

      // 1. Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy + 1;
          if (distSq > 160000) continue;
          const dist = Math.sqrt(distSq);

          const sameCategory = a.node.category === b.node.category;
          const repMult = sameCategory ? 0.7 : 1.0;
          const f = (repulsion * repMult) / distSq;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      // 2. Spring attraction along edges
      const map = edgeMapRef.current;
      graphData.edges.forEach(edge => {
        const src = map.get(edge.sourceId);
        const tgt = map.get(edge.targetId);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (dist - linkDist) * 0.02;
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      });

      // 3. Category Cluster Gravity & Integration
      frameCountRef.current++;
      const frame = frameCountRef.current;
      const coolFriction = frame < 120 ? Math.min(friction, 0.75 + (frame / 120) * (friction - 0.75)) : friction;

      const dragging = dragRef.current;
      nodes.forEach(n => {
        if (dragging.mode === 'node' && dragging.nodeId === n.id) return;

        const catCenter = catCenters[n.node.category];
        if (catCenter && catCenter.count > 1) {
          const cdx = catCenter.x - n.x;
          const cdy = catCenter.y - n.y;
          n.vx += cdx * 0.003;
          n.vy += cdy * 0.003;
        }

        n.vx += (worldCx - n.x) * centerForce;
        n.vy += (worldCy - n.y) * centerForce;

        n.vx *= coolFriction;
        n.vy *= coolFriction;

        if (Math.abs(n.vx) < 0.02) n.vx = 0;
        if (Math.abs(n.vy) < 0.02) n.vy = 0;

        n.x += n.vx;
        n.y += n.vy;
      });

      // ── Render Step ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W / dpr, H / dpr);

      // Deep Obsidian background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      const grad = ctx.createRadialGradient(W / dpr / 2, H / dpr / 2, 100, W / dpr / 2, H / dpr / 2, W / dpr * 0.7);
      grad.addColorStop(0, 'rgba(20, 25, 40, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      ctx.save();
      ctx.translate(cam.panX, cam.panY);
      ctx.scale(cam.zoom, cam.zoom);

      const filterLower = searchFilter.toLowerCase().trim();
      const isFiltering = filterLower.length > 0;

      // ── Draw Edges ──
      graphData.edges.forEach(edge => {
        const src = map.get(edge.sourceId);
        const tgt = map.get(edge.targetId);
        if (!src || !tgt) return;
        if (!categoryFilters[src.node.category] || !categoryFilters[tgt.node.category]) return;

        const isConnectedToSelected =
          selectedNode && (edge.sourceId === selectedNode.id || edge.targetId === selectedNode.id);
        const isHighlighted =
          highlightedPathNodeIds.includes(edge.sourceId) && highlightedPathNodeIds.includes(edge.targetId);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isHighlighted) {
          ctx.strokeStyle = `rgba(16, 185, 129, 0.8)`;
          ctx.lineWidth = 2.5 / cam.zoom;
        } else if (isConnectedToSelected) {
          ctx.strokeStyle = src.color + 'aa';
          ctx.lineWidth = 1.8 / cam.zoom;
        } else {
          ctx.strokeStyle = `rgba(160, 60, 50, ${lineOpacity})`;
          ctx.lineWidth = 0.6 / cam.zoom;
        }
        ctx.stroke();
      });

      // ── Draw Nodes ──
      nodes.forEach((n, idx) => {
        if (!categoryFilters[n.node.category]) return;

        const matchesFilter = isFiltering
          ? n.node.name.toLowerCase().includes(filterLower) ||
            n.node.tags.some(t => t.toLowerCase().includes(filterLower))
          : true;

        const isSelected = selectedNode?.id === n.id;
        const isHovered = hoveredNode?.id === n.id;
        const isHighlighted = highlightedPathNodeIds.includes(n.id);
        const alpha = isFiltering && !matchesFilter ? 0.08 : 1.0;
        const r = n.radius * nodeSize;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isSelected || isHighlighted || isHovered) {
          const glowR = r + (isSelected ? 12 : 6);
          const glowGrad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, glowR);
          glowGrad.addColorStop(0, n.color + '80');
          glowGrad.addColorStop(1, n.color + '00');
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        } else if (idx % 9 === 0) {
          const glowR = r + 4;
          const glowGrad = ctx.createRadialGradient(n.x, n.y, r * 0.2, n.x, n.y, glowR);
          glowGrad.addColorStop(0, n.color + '40');
          glowGrad.addColorStop(1, n.color + '00');
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        if (r > 4) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        }

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5 / cam.zoom;
          ctx.stroke();
        }

        if (showLabels && cam.zoom > 0.5 && (isSelected || isHovered || isHighlighted || cam.zoom > 0.9)) {
          const fontSize = Math.max(9, 11 / cam.zoom);
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px sans-serif`;
          ctx.fillStyle = isSelected ? '#ffffff' : '#b0b8c8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const label = n.node.name.length > 22 ? n.node.name.substring(0, 20) + '…' : n.node.name;
          ctx.fillText(label, n.x, n.y + r + 4);
        }

        ctx.restore();
      });

      ctx.restore();
      animIdRef.current = requestAnimationFrame(tick);
    };

    animIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animIdRef.current);
  }, [
    graphData,
    selectedNode,
    hoveredNode,
    highlightedPathNodeIds,
    searchFilter,
    showLabels,
    categoryFilters,
    repulsion,
    linkDist,
    centerForce,
    friction,
    nodeSize,
    lineOpacity,
    groupColors,
  ]);

  // ─── Mouse Wheel Zoom ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
      const newZoom = Math.min(Math.max(cam.zoom * zoomFactor, 0.1), 5.0);

      cam.panX = mx - (mx - cam.panX) * (newZoom / cam.zoom);
      cam.panY = my - (my - cam.panY) * (newZoom / cam.zoom);
      cam.zoom = newZoom;
      forceRender(x => x + 1);
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // ─── Mouse Interactions ───────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x, y } = screenToWorld(sx, sy);

    const hitNode = physicsRef.current.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= (n.radius * nodeSize) + 6;
    });

    if (hitNode) {
      dragRef.current = { mode: 'node', nodeId: hitNode.id, startX: sx, startY: sy, startPanX: 0, startPanY: 0 };
      setSelectedNode(hitNode.node);
      onSelectNode?.(hitNode.node);
    } else {
      const cam = cameraRef.current;
      dragRef.current = { mode: 'pan', nodeId: null, startX: sx, startY: sy, startPanX: cam.panX, startPanY: cam.panY };
      setSelectedNode(null);
    }
  }, [screenToWorld, onSelectNode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    const dr = dragRef.current;
    if (dr.mode === 'pan') {
      const cam = cameraRef.current;
      cam.panX = dr.startPanX + (sx - dr.startX);
      cam.panY = dr.startPanY + (sy - dr.startY);
      forceRender(x => x + 1);
    } else if (dr.mode === 'node' && dr.nodeId) {
      const { x, y } = screenToWorld(sx, sy);
      const n = physicsRef.current.find(p => p.id === dr.nodeId);
      if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0; }
    } else {
      const { x, y } = screenToWorld(sx, sy);
      const hit = physicsRef.current.find(n => {
        const dx = n.x - x, dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= (n.radius * nodeSize) + 5;
      });
      setHoveredNode(hit || null);
    }
  }, [screenToWorld]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { mode: 'none', nodeId: null, startX: 0, startY: 0, startPanX: 0, startPanY: 0 };
  }, []);

  const handleDblClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const hit = physicsRef.current.find(n => {
      const dx = n.x - x, dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= (n.radius * nodeSize) + 6;
    });
    if (hit && onExpandNeighborhood) {
      onExpandNeighborhood(hit.id);
    }
  }, [screenToWorld, onExpandNeighborhood]);

  // ─── Backlinks for Selected Node ──────────────────────────────────────────
  const backlinks = useMemo(() => {
    if (!selectedNode) return null;
    const incoming = graphData.edges
      .filter(e => e.targetId === selectedNode.id)
      .map(e => ({ edge: e, node: graphData.nodes.find(n => n.id === e.sourceId)! }))
      .filter(x => x.node);
    const outgoing = graphData.edges
      .filter(e => e.sourceId === selectedNode.id)
      .map(e => ({ edge: e, node: graphData.nodes.find(n => n.id === e.targetId)! }))
      .filter(x => x.node);
    return { incoming, outgoing };
  }, [selectedNode, graphData]);

  const categories = Object.keys(CATEGORY_COLORS);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0d1117] overflow-hidden font-sans select-none">

      {/* ─── Main Interactive Canvas ────────────────────────────────────────── */}
      <canvas ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDblClick}
        className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* ─── Streamlined Public Floating Toolbar (Top Left) ────────────────── */}
      <div className="absolute top-10 left-3 z-30 flex flex-col gap-2 max-w-sm pointer-events-auto"
        onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>

        {/* Search Bar */}
        <div className="flex items-center gap-1.5 bg-[#161b22]/90 backdrop-blur-md border border-zinc-700/80 rounded-lg px-2.5 py-1.5 shadow-xl">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Search nodes or tags..."
            className="w-48 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {searchFilter && (
            <button onClick={() => setSearchFilter('')} className="text-xs text-zinc-500 hover:text-white">✕</button>
          )}
        </div>

        {/* Category Pills & Explorer Controls */}
        <div className="flex items-center gap-1.5 flex-wrap bg-[#161b22]/90 backdrop-blur-md border border-zinc-700/80 rounded-lg p-1.5 shadow-xl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilters(prev => ({ ...prev, [cat]: !prev[cat] }))}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                categoryFilters[cat] ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'opacity-40 text-zinc-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              {cat}
            </button>
          ))}

          <div className="h-3 w-px bg-zinc-700 mx-0.5" />

          {/* Labels Toggle */}
          <button
            onClick={() => setShowLabels(prev => !prev)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              showLabels ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Labels
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => {
                cameraRef.current.zoom = Math.min(cameraRef.current.zoom * 1.2, 5.0);
                forceRender(x => x + 1);
              }}
              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                cameraRef.current.zoom = Math.max(cameraRef.current.zoom / 1.2, 0.1);
                forceRender(x => x + 1);
              }}
              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                cameraRef.current = { zoom: 0.6, panX: 0, panY: 0 };
                forceRender(x => x + 1);
              }}
              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Hover Tooltip ───────────────────────────────────────────────── */}
      {hoveredNode && !selectedNode && (
        <div className="fixed z-50 bg-[#161b22]/95 backdrop-blur border border-zinc-700 rounded-lg p-2.5 shadow-2xl pointer-events-none text-xs max-w-xs"
          style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}>
          <div className="flex items-center gap-1.5 font-semibold text-white text-[11px]">
            <span>{hoveredNode.node.icon}</span> {hoveredNode.node.name}
          </div>
          <div className="text-[9px] mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
            <span className="text-zinc-400">{hoveredNode.node.category}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">{hoveredNode.node.label}</span>
          </div>
          <div className="text-[9px] text-zinc-500 mt-1 italic">Double-click to expand neighborhood</div>
        </div>
      )}

      {/* ─── Selected Node Inspector Card (Bottom Right) ─────────────────── */}
      {selectedNode && backlinks && (
        <div className="absolute bottom-4 right-4 z-30 w-72 bg-[#161b22]/95 backdrop-blur-sm border border-zinc-700/80 rounded-lg shadow-2xl overflow-hidden text-xs pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
          <div className="px-3 py-2 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] || '#10b981' }} />
              <span className="font-semibold text-white text-[11px] truncate max-w-[180px]">
                {selectedNode.icon} {selectedNode.name}
              </span>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white text-sm leading-none">✕</button>
          </div>

          <div className="px-3 py-2 max-h-48 overflow-y-auto space-y-2">
            <div className="flex gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono bg-zinc-800 text-zinc-300">{selectedNode.category}</span>
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono bg-zinc-800 text-zinc-300">{selectedNode.label}</span>
              {selectedNode.scientificName && (
                <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono bg-zinc-800 text-zinc-400 italic">{selectedNode.scientificName}</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">{selectedNode.description}</p>

            {(backlinks.incoming.length > 0 || backlinks.outgoing.length > 0) && (
              <div className="space-y-1 pt-1 border-t border-zinc-800/40">
                <div className="text-[9px] text-zinc-500 font-medium">
                  {backlinks.incoming.length} in · {backlinks.outgoing.length} out
                </div>
                {backlinks.incoming.slice(0, 4).map(({ edge, node }) => (
                  <button key={edge.id} onClick={() => setSelectedNode(node)}
                    className="block w-full text-left text-[10px] text-zinc-400 hover:text-emerald-300 truncate transition">
                    ← <span className="text-zinc-500">{edge.type}</span> {node.name}
                  </button>
                ))}
                {backlinks.outgoing.slice(0, 4).map(({ edge, node }) => (
                  <button key={edge.id} onClick={() => setSelectedNode(node)}
                    className="block w-full text-left text-[10px] text-zinc-400 hover:text-emerald-300 truncate transition">
                    → <span className="text-zinc-500">{edge.type}</span> {node.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onExpandNeighborhood && (
            <div className="px-3 py-2 border-t border-zinc-800/40">
              <button onClick={() => onExpandNeighborhood(selectedNode.id)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium transition">
                Expand 2-Hop Neighborhood
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Stats Badge Bottom Left ────────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 z-20 text-[9px] text-zinc-500 font-mono pointer-events-none">
        {graphData.nodes.length} nodes · {graphData.edges.length} edges · {Math.round(cameraRef.current.zoom * 100)}%
      </div>
    </div>
  );
};
