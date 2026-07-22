'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { EcoNode, GraphData } from '@/lib/ecograph/types';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  ChevronRight,
  X,
  Sparkles,
  GitBranch,
} from 'lucide-react';

export const NEON_PALETTE = [
  '#10b981', // Emerald Green (Biodiversity)
  '#38bdf8', // Sky Blue (Spatial)
  '#f43f5e', // Rose/Red (Pollution)
  '#f97316', // Amber/Orange (Climate)
  '#a855f7', // Purple (Policy)
  '#ec4899', // Pink (User)
  '#06b6d4', // Cyan (Quest)
];

export const CATEGORY_COLORS: Record<string, string> = {
  Biodiversity: '#10b981',
  Spatial: '#38bdf8',
  Pollution: '#f43f5e',
  Climate: '#f97316',
  Policy: '#a855f7',
  User: '#ec4899',
  Quest: '#06b6d4',
};

interface PhysicsNode {
  id: string;
  node: EcoNode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX?: number;
  targetY?: number;
  radius: number;
  color: string;
  glow: string;
}

interface ObsidianGraphCanvasProps {
  graphData: GraphData;
  activeNodeId?: string;
  viewMode?: 'overview' | 'focus' | 'paths' | 'timeline';
  selectedCategory?: string | null;
  highlightedPathNodeIds?: string[];
  zoomSignal?: { type: 'in' | 'out' | 'reset' | 'fit'; timestamp: number } | null;
  showLabels?: boolean;
  onToggleLabels?: () => void;
  onSelectNode?: (node: EcoNode) => void;
  onExpandNeighborhood?: (nodeId: string) => void;
}

export const ObsidianGraphCanvas: React.FC<ObsidianGraphCanvasProps> = ({
  graphData,
  viewMode = 'overview',
  selectedCategory = null,
  highlightedPathNodeIds = [],
  zoomSignal = null,
  showLabels: externalShowLabels = false,
  onToggleLabels,
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

  const [internalShowLabels, setInternalShowLabels] = useState(false);
  const showLabels = externalShowLabels || internalShowLabels;

  // ─── Dynamic Global Physics & Display Settings ───────────────────────────
  const [repulsion, setRepulsion] = useState(1100);
  const [linkDist, setLinkDist] = useState(85);
  const [centerForce, setCenterForce] = useState(0.005);
  const [friction, setFriction] = useState(0.85);
  const [nodeSize, setNodeSize] = useState(1.2);
  const [lineOpacity, setLineOpacity] = useState(0.18);
  const [groupColors, setGroupColors] = useState<Record<string, string>>({ ...CATEGORY_COLORS });

  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ─── Stable Props Ref for High-Performance Canvas Loop ───────────────────
  const propsRef = useRef({
    graphData,
    selectedNode,
    hoveredNode,
    highlightedPathNodeIds,
    selectedCategory,
    viewMode,
    showLabels,
    repulsion,
    linkDist,
    centerForce,
    friction,
    nodeSize,
    lineOpacity,
    groupColors,
  });

  useEffect(() => {
    propsRef.current = {
      graphData,
      selectedNode,
      hoveredNode,
      highlightedPathNodeIds,
      selectedCategory,
      viewMode,
      showLabels,
      repulsion,
      linkDist,
      centerForce,
      friction,
      nodeSize,
      lineOpacity,
      groupColors,
    };
  });

  // Fetch live global presets from backend
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

  const wakePhysics = () => {
    frameCountRef.current = 0;
    physicsRef.current.forEach((n) => {
      n.vx = (Math.random() - 0.5) * 1.0;
      n.vy = (Math.random() - 0.5) * 1.0;
    });
  };

  useEffect(() => {
    wakePhysics();
  }, [repulsion, linkDist, centerForce, friction, nodeSize]);

  // ─── Interaction State ────────────────────────────────────────────────────
  const dragRef = useRef<{
    mode: 'none' | 'pan' | 'node';
    nodeId: string | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({ mode: 'none', nodeId: null, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  // ─── Initialize Physics Nodes with Outer Ring & Sub-Clusters ──────────────
  useEffect(() => {
    const W = 1800;
    const H = 1200;
    const cx = W / 2;
    const cy = H / 2;

    const categories = Object.keys(CATEGORY_COLORS);
    const catCenters: Record<string, { x: number; y: number }> = {};
    categories.forEach((cat, idx) => {
      const angle = (idx / categories.length) * Math.PI * 2;
      const radius = 280;
      catCenters[cat] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });

    const degreeMap = new Map<string, number>();
    graphData.edges.forEach((e) => {
      degreeMap.set(e.sourceId, (degreeMap.get(e.sourceId) || 0) + 1);
      degreeMap.set(e.targetId, (degreeMap.get(e.targetId) || 0) + 1);
    });

    // Save existing node positions to prevent resetting/scattering on data updates
    const existingPosMap = new Map<string, { x: number; y: number }>();
    physicsRef.current.forEach((n) => existingPosMap.set(n.id, { x: n.x, y: n.y }));

    const isInitialLoad = physicsRef.current.length === 0;
    if (isInitialLoad) {
      frameCountRef.current = 0;
    }

    physicsRef.current = graphData.nodes.map((node, idx) => {
      const existing = existingPosMap.get(node.id);
      let x: number, y: number;

      if (existing) {
        x = existing.x;
        y = existing.y;
      } else {
        const degree = degreeMap.get(node.id) || 0;
        const isPeripheral = degree <= 1;

        if (isPeripheral) {
          const ringAngle = (idx / graphData.nodes.length) * Math.PI * 2;
          const ringRadius = 500 + (Math.random() - 0.5) * 40;
          x = cx + Math.cos(ringAngle) * ringRadius;
          y = cy + Math.sin(ringAngle) * ringRadius;
        } else {
          const cc = catCenters[node.category] || { x: cx, y: cy };
          const angle = Math.random() * Math.PI * 2;
          const spread = 30 + Math.random() * 120;
          x = cc.x + Math.cos(angle) * spread;
          y = cc.y + Math.sin(angle) * spread;
        }
      }

      const baseColor = groupColors[node.category] || CATEGORY_COLORS[node.category] || NEON_PALETTE[idx % NEON_PALETTE.length];

      let r = 2.5;
      if (node.label === 'Species' || node.label === 'Policy') r = 4.5;
      if (node.label === 'Habitat') r = 5.5;
      if (node.id.startsWith('obsidian-node')) r = 1.8 + Math.random() * 1.5;

      return {
        id: node.id,
        node,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: r * nodeSize,
        color: baseColor,
        glow: baseColor + '50',
      };
    });

    const map = new Map<string, PhysicsNode>();
    physicsRef.current.forEach((n) => map.set(n.id, n));
    edgeMapRef.current = map;
  }, [graphData, groupColors, nodeSize]);

  // Transform Helpers
  const screenToWorld = useCallback((sx: number, sy: number) => {
    const cam = cameraRef.current;
    return {
      x: (sx - cam.panX) / cam.zoom,
      y: (sy - cam.panY) / cam.zoom,
    };
  }, []);

  // Canvas Resize
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

  // Cursor-Centered Wheel Zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      const cam = cameraRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      const newZoom = Math.max(0.15, Math.min(3.5, cam.zoom * zoomFactor));

      cam.panX = sx - (sx - cam.panX) * (newZoom / cam.zoom);
      cam.panY = sy - (sy - cam.panY) * (newZoom / cam.zoom);
      cam.zoom = newZoom;

      forceRender((n) => n + 1);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (!zoomSignal) return;
    if (zoomSignal.type === 'in') handleZoom(1.25);
    if (zoomSignal.type === 'out') handleZoom(0.75);
    if (zoomSignal.type === 'reset' || zoomSignal.type === 'fit') handleResetCamera();
  }, [zoomSignal]);

  const handleZoom = (factor: number) => {
    cameraRef.current.zoom = Math.max(0.15, Math.min(3.0, cameraRef.current.zoom * factor));
    forceRender((n) => n + 1);
  };

  const handleResetCamera = () => {
    cameraRef.current = { zoom: 0.6, panX: 0, panY: 0 };
    setSelectedNode(null);
    forceRender((n) => n + 1);
  };

  // ─── Main Render & Physics Loop (STABLE UNBROKEN DEPENDENCY ARRAY) ─────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      const p = propsRef.current;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width;
      const H = canvas.height;
      const nodes = physicsRef.current;
      const cam = cameraRef.current;
      const worldCx = (W / dpr / 2 - cam.panX) / cam.zoom;
      const worldCy = (H / dpr / 2 - cam.panY) / cam.zoom;

      const dragging = dragRef.current;

      // ── 1. Timeline Mode Layout Interpolation ──
      if (p.viewMode === 'timeline') {
        const total = nodes.length;
        const totalWidth = 1400;
        const startX = worldCx - totalWidth / 2;

        nodes.forEach((n, idx) => {
          if (dragging.mode === 'node' && dragging.nodeId === n.id) return;
          const targetX = startX + (idx / total) * totalWidth;
          const targetY = worldCy + Math.sin(idx * 0.4) * 140;
          n.x += (targetX - n.x) * 0.12;
          n.y += (targetY - n.y) * 0.12;
        });
      } else {
        // ── 2. Physics Settlement (Run for 35 frames then FREEZE completely) ──
        frameCountRef.current++;
        const frame = frameCountRef.current;
        const isSettling = frame < 35;

        if (isSettling) {
          const coolFriction = Math.max(0.2, p.friction - frame * 0.02);

          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const a = nodes[i], b = nodes[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx * dx + dy * dy + 1;
              if (distSq > 140000) continue;
              const dist = Math.sqrt(distSq);

              const sameCategory = a.node.category === b.node.category;
              const repMult = sameCategory ? 0.6 : 1.0;
              const f = (p.repulsion * repMult) / distSq;
              const fx = (dx / dist) * f;
              const fy = (dy / dist) * f;
              a.vx -= fx; a.vy -= fy;
              b.vx += fx; b.vy += fy;
            }
          }

          const map = edgeMapRef.current;
          p.graphData.edges.forEach((edge) => {
            const src = map.get(edge.sourceId);
            const tgt = map.get(edge.targetId);
            if (!src || !tgt) return;
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const f = (dist - p.linkDist) * 0.018;
            const fx = (dx / dist) * f;
            const fy = (dy / dist) * f;
            src.vx += fx; src.vy += fy;
            tgt.vx -= fx; tgt.vy -= fy;
          });

          nodes.forEach((n) => {
            if (dragging.mode === 'node' && dragging.nodeId === n.id) return;

            n.vx += (worldCx - n.x) * p.centerForce;
            n.vy += (worldCy - n.y) * p.centerForce;

            n.vx *= coolFriction;
            n.vy *= coolFriction;

            if (Math.abs(n.vx) < 0.02) n.vx = 0;
            if (Math.abs(n.vy) < 0.02) n.vy = 0;

            n.x += n.vx;
            n.y += n.vy;
          });
        } else {
          // FREEZE velocity completely when settled
          nodes.forEach((n) => {
            if (dragging.mode !== 'node' || dragging.nodeId !== n.id) {
              n.vx = 0;
              n.vy = 0;
            }
          });
        }
      }

      // ── 3. Render Step ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W / dpr, H / dpr);

      // Deep Obsidian background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      const grad = ctx.createRadialGradient(W / dpr / 2, H / dpr / 2, 100, W / dpr / 2, H / dpr / 2, (W / dpr) * 0.7);
      grad.addColorStop(0, 'rgba(20, 25, 40, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      ctx.save();
      ctx.translate(cam.panX, cam.panY);
      ctx.scale(cam.zoom, cam.zoom);

      // Connected Nodes Set for Focus & Paths Mode
      const connectedNodeIds = new Set<string>();
      if (p.selectedNode) {
        connectedNodeIds.add(p.selectedNode.id);
        p.graphData.edges.forEach((e) => {
          if (e.sourceId === p.selectedNode!.id) connectedNodeIds.add(e.targetId);
          if (e.targetId === p.selectedNode!.id) connectedNodeIds.add(e.sourceId);
        });
      }

      const time = Date.now();

      // ── Draw Edges & Traveling Pulse Particles ──
      const map = edgeMapRef.current;
      p.graphData.edges.forEach((edge, idx) => {
        const src = map.get(edge.sourceId);
        const tgt = map.get(edge.targetId);
        if (!src || !tgt) return;

        if (p.selectedCategory && src.node.category !== p.selectedCategory && tgt.node.category !== p.selectedCategory) {
          return;
        }

        const isConnectedToSelected =
          p.selectedNode && (edge.sourceId === p.selectedNode.id || edge.targetId === p.selectedNode.id);
        const isHighlighted =
          (p.highlightedPathNodeIds || []).includes(edge.sourceId) && (p.highlightedPathNodeIds || []).includes(edge.targetId);

        if (p.viewMode === 'focus' && p.selectedNode && !isConnectedToSelected) {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (p.viewMode === 'paths' && (isConnectedToSelected || isHighlighted || idx % 2 === 0)) {
          ctx.strokeStyle = `rgba(16, 185, 129, 0.9)`;
          ctx.lineWidth = 2.2 / cam.zoom;
        } else if (isHighlighted) {
          ctx.strokeStyle = `rgba(16, 185, 129, 0.85)`;
          ctx.lineWidth = 2.0 / cam.zoom;
        } else if (isConnectedToSelected) {
          ctx.strokeStyle = src.color + 'dd';
          ctx.lineWidth = 1.4 / cam.zoom;
        } else {
          ctx.strokeStyle = `rgba(140, 50, 45, ${Math.min(p.lineOpacity, 0.18)})`;
          ctx.lineWidth = 0.35 / cam.zoom;
        }
        ctx.stroke();

        // Traveling pulse particle animation along edges
        if (cam.zoom > 0.45 && (p.viewMode === 'paths' || idx % 3 === 0 || isConnectedToSelected || isHighlighted)) {
          const pT = ((time * 0.0008 + idx * 0.2) % 1);
          const px = src.x + (tgt.x - src.x) * pT;
          const py = src.y + (tgt.y - src.y) * pT;

          ctx.beginPath();
          ctx.arc(px, py, (p.viewMode === 'paths' || isConnectedToSelected ? 2.5 : 1.5) / cam.zoom, 0, Math.PI * 2);
          ctx.fillStyle = isConnectedToSelected || p.viewMode === 'paths' ? '#ffffff' : src.color;
          ctx.fill();
        }
      });

      // ── Draw Nodes ──
      nodes.forEach((n) => {
        if (p.selectedCategory && n.node.category !== p.selectedCategory) return;

        const isSelected = p.selectedNode?.id === n.id;
        const isHovered = p.hoveredNode?.id === n.id;
        const isHighlighted = (p.highlightedPathNodeIds || []).includes(n.id);
        const isFocusConnected = p.viewMode !== 'focus' || !p.selectedNode || connectedNodeIds.has(n.id);

        const alpha = isFocusConnected ? 1.0 : 0.08;
        const r = n.radius * p.nodeSize;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isSelected || isHighlighted || isHovered || (p.viewMode === 'paths' && connectedNodeIds.has(n.id))) {
          const glowR = r + (isSelected ? 14 : 7);
          const glowGrad = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, glowR);
          glowGrad.addColorStop(0, n.color + '90');
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

        if (p.showLabels || isSelected || isHovered || isHighlighted) {
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
  }, []); // Guaranteed constant dependency array size across all renders and HMR updates

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy);

    const hit = physicsRef.current.find((n) => {
      const dx = n.x - world.x;
      const dy = n.y - world.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeSize + 6;
    });

    if (hit) {
      dragRef.current = {
        mode: 'node',
        nodeId: hit.id,
        startX: sx,
        startY: sy,
        startPanX: cameraRef.current.panX,
        startPanY: cameraRef.current.panY,
      };
      setSelectedNode(hit.node);
      if (onSelectNode) onSelectNode(hit.node);
      wakePhysics();
    } else {
      dragRef.current = {
        mode: 'pan',
        nodeId: null,
        startX: sx,
        startY: sy,
        startPanX: cameraRef.current.panX,
        startPanY: cameraRef.current.panY,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setMousePos({ x: sx, y: sy });
    const world = screenToWorld(sx, sy);

    const drag = dragRef.current;

    if (drag.mode === 'pan') {
      cameraRef.current.panX = drag.startPanX + (sx - drag.startX);
      cameraRef.current.panY = drag.startPanY + (sy - drag.startY);
      forceRender((n) => n + 1);
    } else if (drag.mode === 'node' && drag.nodeId) {
      const targetNode = physicsRef.current.find((n) => n.id === drag.nodeId);
      if (targetNode) {
        targetNode.x = world.x;
        targetNode.y = world.y;
        targetNode.vx = 0;
        targetNode.vy = 0;
        wakePhysics();
      }
    } else {
      const hit = physicsRef.current.find((n) => {
        const dx = n.x - world.x;
        const dy = n.y - world.y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeSize + 6;
      });
      setHoveredNode(hit || null);
    }
  };

  const handleMouseUp = () => {
    dragRef.current.mode = 'none';
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy);

    const hit = physicsRef.current.find((n) => {
      const dx = n.x - world.x;
      const dy = n.y - world.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * nodeSize + 6;
    });

    if (hit && onExpandNeighborhood) {
      onExpandNeighborhood(hit.id);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#0d1117] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Hover Tooltip Card */}
      {hoveredNode && !selectedNode && (
        <div
          className="absolute z-30 pointer-events-none bg-[#161b22]/95 backdrop-blur-md border border-zinc-800 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 text-zinc-200 animate-in fade-in"
          style={{ left: Math.min(window.innerWidth - 200, mousePos.x + 15), top: Math.min(window.innerHeight - 100, mousePos.y + 15) }}
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
            <span>{hoveredNode.node.name}</span>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 block">{hoveredNode.node.category}</span>
          <p className="text-[10px] text-zinc-400 line-clamp-2">{hoveredNode.node.description}</p>
        </div>
      )}

      {/* Floating Toolbar Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-[#161b22]/90 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-xl text-xs text-zinc-300">
        <button
          onClick={() => {
            if (onToggleLabels) {
              onToggleLabels();
            } else {
              setInternalShowLabels(!internalShowLabels);
            }
          }}
          className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 font-medium ${
            showLabels ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'hover:bg-zinc-800 text-zinc-300'
          }`}
          title="Toggle Node Labels"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Labels</span>
        </button>

        <div className="w-px h-4 bg-zinc-800 my-auto" />

        <button
          onClick={() => handleZoom(1.2)}
          className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg transition"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
