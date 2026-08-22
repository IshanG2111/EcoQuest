'use client';

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { EcoNode, GraphData } from '@/lib/ecograph/types';
import { soundFX } from '@/lib/audio-fx';

export const CATEGORY_COLORS: Record<string, string> = {
  Climate: '#f59e0b',       // Warm Amber / Gold (Central Core)
  Biodiversity: '#10b981',  // Emerald / Mint Green (Secondary Cluster)
  Spatial: '#38bdf8',       // Cyan / Sky Blue
  Pollution: '#f43f5e',     // Rose / Coral
  Policy: '#a855f7',        // Violet / Purple
  User: '#ec4899',          // Soft Magenta / Pink
  Quest: '#06b6d4',         // Electric Cyan
};

export const NEON_PALETTE = [
  '#f59e0b', '#10b981', '#38bdf8', '#f43f5e', '#a855f7', '#06b6d4', '#ec4899',
];

interface PhysicsNode {
  id: string;
  node: EcoNode;
  base2dX: number;
  base2dY: number;
  renderX: number;
  renderY: number;
  z?: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
  isHub?: boolean;
  degree: number;
  clusterIndex: number;
  phase: number;
  shimmerOffset: number;
}

export interface ObsidianGraphCanvasRef {
  focusNode: (nodeId: string, zoomLevel?: number) => void;
  focusCluster: (category: string) => void;
  focusPath: (nodeIds: string[]) => void;
  resetCamera: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  pan: (dx: number, dy: number) => void;
}

interface ObsidianGraphCanvasProps {
  graphData: GraphData;
  activeNodeId?: string;
  viewMode?: 'overview' | 'focus' | 'paths' | 'timeline';
  projectionMode?: '2d' | 'globe';
  selectedCategory?: string | null;
  highlightedPathNodeIds?: string[];
  timelineYear?: number;
  zoomSignal?: { type: 'in' | 'out' | 'reset' | 'fit'; timestamp: number } | null;
  showLabels?: boolean;
  onSelectNode?: (node: EcoNode | null) => void;
  onExpandNeighborhood?: (nodeId: string) => void;
}

export const ObsidianGraphCanvas = forwardRef<ObsidianGraphCanvasRef, ObsidianGraphCanvasProps>(({
  graphData,
  activeNodeId,
  viewMode = 'overview',
  projectionMode = '2d',
  selectedCategory = null,
  highlightedPathNodeIds = [],
  timelineYear,
  zoomSignal = null,
  showLabels = false,
  onSelectNode,
  onExpandNeighborhood,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<PhysicsNode[]>([]);
  const animIdRef = useRef<number>(0);
  const edgeMapRef = useRef<Map<string, PhysicsNode>>(new Map());
  const frameCountRef = useRef(0);

  // ─── Camera State with Strict Center Origin ──────────────────────────────
  const cameraRef = useRef({
    zoom: 0.65,
    panX: 0,
    panY: 0,
    targetZoom: 0.65,
    targetPanX: 0,
    targetPanY: 0,
    isFollowing: false,
    followNodeId: null as string | null,
  });
  const [, forceRender] = useState(0);

  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // ─── Smooth 2D <-> 3D Morph Factor ───────────────────────────────────────
  const morphProgressRef = useRef(projectionMode === 'globe' ? 1.0 : 0.0);
  const globeRotYRef = useRef(0);
  const globeRotXRef = useRef(0.18);

  // Wake physics whenever projection mode changes
  useEffect(() => {
    frameCountRef.current = 0;
  }, [projectionMode]);

  // ─── Props Ref for 60fps Loop ─────────────────────────────────────────────
  const propsRef = useRef({
    graphData,
    activeNodeId,
    hoveredNode,
    highlightedPathNodeIds,
    selectedCategory,
    viewMode,
    projectionMode,
    showLabels,
    timelineYear,
    onSelectNode,
  });

  useEffect(() => {
    propsRef.current = {
      graphData,
      activeNodeId,
      hoveredNode,
      highlightedPathNodeIds,
      selectedCategory,
      viewMode,
      projectionMode,
      showLabels,
      timelineYear,
      onSelectNode,
    };
  });

  // ─── Anchored Cluster Offsets (Relative to Origin 0,0) ───────────────────
  const catCenterOffsets: Record<string, { dx: number; dy: number; radius: number }> = {
    Climate: { dx: 0, dy: 0, radius: 180 },            // Central Amber Dense Core
    Biodiversity: { dx: 220, dy: 180, radius: 130 },   // Emerald Green Cluster
    Spatial: { dx: -100, dy: 240, radius: 115 },       // Sky Blue Cluster
    Pollution: { dx: -250, dy: -140, radius: 120 },    // Rose / Coral Cluster
    Policy: { dx: 240, dy: -140, radius: 115 },        // Violet Cluster
    User: { dx: -260, dy: 60, radius: 95 },            // Soft Pink Cluster
    Quest: { dx: 260, dy: 60, radius: 95 },            // Cyan Cluster
  };

  // ─── Interaction State ────────────────────────────────────────────────────
  const dragRef = useRef<{
    mode: 'none' | 'pan' | 'node';
    nodeId: string | null;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({ mode: 'none', nodeId: null, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  // ─── Initialize Physics Nodes with Strict Centered Coordinates ───────────
  useEffect(() => {
    const degreeMap = new Map<string, number>();
    graphData.edges.forEach((e) => {
      degreeMap.set(e.sourceId, (degreeMap.get(e.sourceId) || 0) + 1);
      degreeMap.set(e.targetId, (degreeMap.get(e.targetId) || 0) + 1);
    });

    const existingPosMap = new Map<string, { x: number; y: number }>();
    physicsRef.current.forEach((n) => existingPosMap.set(n.id, { x: n.base2dX, y: n.base2dY }));

    const categories = Object.keys(catCenterOffsets);

    physicsRef.current = graphData.nodes.map((node, idx) => {
      const existing = existingPosMap.get(node.id);
      let x: number, y: number;
      const catConfig = catCenterOffsets[node.category] || { dx: 0, dy: 0, radius: 100 };
      const clusterIndex = categories.indexOf(node.category);

      if (existing) {
        x = existing.x;
        y = existing.y;
      } else {
        const isOuterBoundaryRing = idx % 8 === 0;
        const angle = Math.random() * Math.PI * 2;
        const spread = isOuterBoundaryRing
          ? 380 + Math.random() * 80
          : 6 + Math.random() * catConfig.radius;

        x = catConfig.dx + Math.cos(angle) * spread;
        y = catConfig.dy + Math.sin(angle) * spread;
      }

      const degree = degreeMap.get(node.id) || 1;
      const isHub = degree >= 6 || idx % 22 === 0;
      const radius = Math.min(8.5, Math.max(2.2, Math.sqrt(degree) * 1.75));
      const baseColor = CATEGORY_COLORS[node.category] || NEON_PALETTE[idx % NEON_PALETTE.length];

      return {
        id: node.id,
        node,
        base2dX: x,
        base2dY: y,
        renderX: x,
        renderY: y,
        vx: 0,
        vy: 0,
        radius,
        color: baseColor,
        glow: baseColor,
        isHub,
        degree,
        clusterIndex,
        phase: Math.random() * Math.PI * 2,
        shimmerOffset: Math.random() * 100,
      };
    });

    const newEdgeMap = new Map<string, PhysicsNode>();
    physicsRef.current.forEach((n) => newEdgeMap.set(n.id, n));
    edgeMapRef.current = newEdgeMap;

    frameCountRef.current = 0;
  }, [graphData]);

  // ─── Always-Centered Camera: fires whenever canvas gets real dimensions ────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerCamera = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W <= 0 || H <= 0) return;

      // Only center if we haven't been manually panned (pan stays at 0,0 until user touches it)
      const cam = cameraRef.current;
      const needsInit = cam.panX === 0 && cam.panY === 0;
      if (needsInit || cam.panX === W / 2) {
        cam.panX = W / 2;
        cam.panY = H / 2;
        cam.targetPanX = W / 2;
        cam.targetPanY = H / 2;
        cam.zoom = 0.65;
        cam.targetZoom = 0.65;
        forceRender((n) => n + 1);
      }
    };

    // Fire immediately (in case canvas already has size)
    centerCamera();

    // Fire again whenever canvas is resized (covers: drawer open, window resize, first mount)
    const ro = new ResizeObserver(() => {
      // Reset to centered view on every open/resize
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      if (W > 0 && H > 0) {
        cameraRef.current.panX = W / 2;
        cameraRef.current.panY = H / 2;
        cameraRef.current.targetPanX = W / 2;
        cameraRef.current.targetPanY = H / 2;
        cameraRef.current.zoom = 0.65;
        cameraRef.current.targetZoom = 0.65;
        cameraRef.current.followNodeId = null;
        forceRender((n) => n + 1);
      }
    });
    ro.observe(canvas);

    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Screen to World Transform
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const cam = cameraRef.current;
    return {
      x: (screenX - cam.panX) / cam.zoom,
      y: (screenY - cam.panY) / cam.zoom,
    };
  }, []);

  // ─── Smooth Parabolic Fly-To Camera Navigation ───────────────────────────
  const flyTo = useCallback((targetX: number, targetY: number, targetZoom = 1.45, followId: string | null = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    const targetPanX = W / 2 - targetX * targetZoom;
    const targetPanY = H / 2 - targetY * targetZoom;

    cameraRef.current.targetPanX = targetPanX;
    cameraRef.current.targetPanY = targetPanY;
    cameraRef.current.targetZoom = targetZoom;
    cameraRef.current.followNodeId = followId;

    const startZoom = cameraRef.current.zoom;
    const startPanX = cameraRef.current.panX;
    const startPanY = cameraRef.current.panY;
    const dipZoom = Math.min(startZoom, targetZoom) * 0.88;

    let step = 0;
    const maxSteps = 30;

    const smoothFly = () => {
      step++;
      const t = step / maxSteps;
      const ease = t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

      const zoomProgress = Math.sin(t * Math.PI);
      const currentZoom = (1 - t) * startZoom + t * targetZoom - zoomProgress * (Math.abs(startZoom - dipZoom) * 0.35);

      cameraRef.current.zoom = Math.max(0.18, currentZoom);
      cameraRef.current.panX = startPanX + (targetPanX - startPanX) * ease;
      cameraRef.current.panY = startPanY + (targetPanY - startPanY) * ease;

      forceRender((n) => n + 1);

      if (step < maxSteps) {
        requestAnimationFrame(smoothFly);
      }
    };
    requestAnimationFrame(smoothFly);
  }, []);

  const focusNode = useCallback((nodeId: string, zoomLevel = 1.45) => {
    const target = physicsRef.current.find((n) => n.id === nodeId);
    if (!target) return;

    if (propsRef.current.onSelectNode) {
      propsRef.current.onSelectNode(target.node);
    }

    flyTo(target.renderX, target.renderY, zoomLevel, nodeId);
  }, [flyTo]);

  // Sync external activeNodeId
  useEffect(() => {
    if (activeNodeId) {
      const target = physicsRef.current.find((n) => n.id === activeNodeId);
      if (target) {
        flyTo(target.renderX, target.renderY, 1.45, activeNodeId);
      }
    }
  }, [activeNodeId, flyTo]);

  const focusCluster = useCallback((category: string) => {
    const offset = catCenterOffsets[category] || { dx: 0, dy: 0 };
    flyTo(offset.dx, offset.dy, 1.15);
  }, [flyTo]);

  const focusPath = useCallback((nodeIds: string[]) => {
    if (nodeIds.length === 0) return;
    const first = physicsRef.current.find((n) => n.id === nodeIds[0]);
    if (first) {
      focusNode(first.id, 1.4);
    }
  }, [focusNode]);

  const resetCamera = useCallback(() => {
    if (propsRef.current.onSelectNode) {
      propsRef.current.onSelectNode(null);
    }
    flyTo(0, 0, 0.65, null);
  }, [flyTo]);

  const handlePanDelta = useCallback((dx: number, dy: number) => {
    cameraRef.current.panX += dx;
    cameraRef.current.panY += dy;
    cameraRef.current.followNodeId = null;
    forceRender((n) => n + 1);
  }, []);

  // ─── Instant Node Jump in Direction (Arrow Keys) ─────────────────────────
  const jumpToNodeInDirection = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    const nodes = physicsRef.current;
    if (nodes.length === 0) return;

    const current = propsRef.current.activeNodeId
      ? nodes.find((n) => n.id === propsRef.current.activeNodeId)
      : null;
    const currentX = current ? current.renderX : 0;
    const currentY = current ? current.renderY : 0;

    const connectedIds = new Set<string>();
    if (current) {
      propsRef.current.graphData.edges.forEach((e) => {
        if (e.sourceId === current.id) connectedIds.add(e.targetId);
        if (e.targetId === current.id) connectedIds.add(e.sourceId);
      });
    }

    // When a node is selected, ONLY navigate among its directly connected neighbors
    const candidateNodes = (current && connectedIds.size > 0)
      ? nodes.filter((n) => connectedIds.has(n.id))
      : nodes;

    let bestNode: PhysicsNode | null = null;
    let bestScore = Infinity;

    for (const n of candidateNodes) {
      if (current && n.id === current.id) continue;
      if (propsRef.current.selectedCategory && n.node.category !== propsRef.current.selectedCategory) continue;

      const dx = n.renderX - currentX;
      const dy = n.renderY - currentY;
      const dist = Math.hypot(dx, dy);

      let inDirection = false;
      let angularPenalty = 0;

      if (dir === 'right' && dx > 8) {
        inDirection = true;
        angularPenalty = Math.abs(dy) / (dx + 1);
      } else if (dir === 'left' && dx < -8) {
        inDirection = true;
        angularPenalty = Math.abs(dy) / (-dx + 1);
      } else if (dir === 'down' && dy > 8) {
        inDirection = true;
        angularPenalty = Math.abs(dx) / (dy + 1);
      } else if (dir === 'up' && dy < -8) {
        inDirection = true;
        angularPenalty = Math.abs(dx) / (-dy + 1);
      }

      if (inDirection) {
        const score = dist * (1 + angularPenalty * 1.5);
        if (score < bestScore) {
          bestScore = score;
          bestNode = n;
        }
      }
    }

    // Fallback if no neighbor was in that exact directional sector: cycle to closest neighbor
    if (!bestNode && current && candidateNodes.length > 0) {
      let closestDist = Infinity;
      for (const n of candidateNodes) {
        if (n.id === current.id) continue;
        const d = Math.hypot(n.renderX - currentX, n.renderY - currentY);
        if (d < closestDist) {
          closestDist = d;
          bestNode = n;
        }
      }
    }

    if (bestNode) {
      focusNode(bestNode.id, 1.45);
      if (propsRef.current.onSelectNode) {
        propsRef.current.onSelectNode(bestNode.node);
      }
    }
  }, [focusNode]);

  // ─── Game-like Keyboard Navigation (Arrows = Node Jump, WASD = Pan) ──────
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', '+', '-', '=', '_', 'r'].includes(key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp') {
        jumpToNodeInDirection('up');
        return;
      }
      if (e.key === 'ArrowDown') {
        jumpToNodeInDirection('down');
        return;
      }
      if (e.key === 'ArrowLeft') {
        jumpToNodeInDirection('left');
        return;
      }
      if (e.key === 'ArrowRight') {
        jumpToNodeInDirection('right');
        return;
      }

      keysPressed[key] = true;

      if (key === 'r' || key === ' ') {
        resetCamera();
      }
      if (key === '+' || key === '=') {
        cameraRef.current.zoom = Math.min(3.8, cameraRef.current.zoom * 1.15);
        forceRender((n) => n + 1);
      }
      if (key === '-' || key === '_') {
        cameraRef.current.zoom = Math.max(0.18, cameraRef.current.zoom * 0.85);
        forceRender((n) => n + 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
    };

    let keyLoopId: number;
    const keyLoop = () => {
      const speed = 14;
      let moved = false;

      if (keysPressed['w']) {
        cameraRef.current.panY += speed;
        cameraRef.current.followNodeId = null;
        moved = true;
      }
      if (keysPressed['s']) {
        cameraRef.current.panY -= speed;
        cameraRef.current.followNodeId = null;
        moved = true;
      }
      if (keysPressed['a']) {
        cameraRef.current.panX += speed;
        cameraRef.current.followNodeId = null;
        moved = true;
      }
      if (keysPressed['d']) {
        cameraRef.current.panX -= speed;
        cameraRef.current.followNodeId = null;
        moved = true;
      }

      if (moved) {
        forceRender((n) => n + 1);
      }

      keyLoopId = requestAnimationFrame(keyLoop);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    keyLoopId = requestAnimationFrame(keyLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(keyLoopId);
    };
  }, [resetCamera, jumpToNodeInDirection]);

  // Imperative Handle
  useImperativeHandle(ref, () => ({
    focusNode,
    focusCluster,
    focusPath,
    resetCamera,
    zoomIn: () => {
      cameraRef.current.zoom = Math.min(3.8, cameraRef.current.zoom * 1.25);
      forceRender((n) => n + 1);
    },
    zoomOut: () => {
      cameraRef.current.zoom = Math.max(0.18, cameraRef.current.zoom * 0.8);
      forceRender((n) => n + 1);
    },
    pan: handlePanDelta,
  }));

  // Handle Canvas Resizing
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (cameraRef.current.panX === 0 && cameraRef.current.panY === 0) {
        cameraRef.current.panX = rect.width / 2;
        cameraRef.current.panY = rect.height / 2;
      }

      forceRender((n) => n + 1);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
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
      const newZoom = Math.max(0.18, Math.min(3.8, cam.zoom * zoomFactor));

      cam.panX = sx - (sx - cam.panX) * (newZoom / cam.zoom);
      cam.panY = sy - (sy - cam.panY) * (newZoom / cam.zoom);
      cam.zoom = newZoom;
      cam.followNodeId = null;

      forceRender((n) => n + 1);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    if (!zoomSignal) return;
    if (zoomSignal.type === 'in') {
      cameraRef.current.zoom = Math.min(3.8, cameraRef.current.zoom * 1.25);
      forceRender((n) => n + 1);
    }
    if (zoomSignal.type === 'out') {
      cameraRef.current.zoom = Math.max(0.18, cameraRef.current.zoom * 0.8);
      forceRender((n) => n + 1);
    }
    if (zoomSignal.type === 'reset' || zoomSignal.type === 'fit') resetCamera();
  }, [zoomSignal, resetCamera]);

  // ─── Main Render & Physics Loop with Smooth Morph ─────────────────────────
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

      const dragging = dragRef.current;
      const time = Date.now();

      // ── Smooth 2D <-> 3D Morph Interpolation ──
      const targetMorph = p.projectionMode === 'globe' ? 1.0 : 0.0;
      morphProgressRef.current += (targetMorph - morphProgressRef.current) * 0.08;
      const morph = morphProgressRef.current;

      // 3D Spherical Coordinates calculations
      globeRotYRef.current += 0.003;
      const rotY = globeRotYRef.current;
      const rotX = globeRotXRef.current;
      const total = nodes.length || 1;
      const sphereRadius = 300;

      // 2D Physics Settlement
      frameCountRef.current++;
      const frame = frameCountRef.current;
      const isSettling = frame < 45;

      if (isSettling && morph < 0.99) {
        const coolFriction = Math.max(0.2, 0.85 - frame * 0.015);

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = b.base2dX - a.base2dX;
            const dy = b.base2dY - a.base2dY;
            const distSq = dx * dx + dy * dy + 1;
            if (distSq > 160000) continue;
            const dist = Math.sqrt(distSq);

            const sameCategory = a.node.category === b.node.category;
            const repMult = sameCategory ? 0.65 : 1.15;
            const f = (1200 * repMult) / distSq;
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
          const dx = tgt.base2dX - src.base2dX;
          const dy = tgt.base2dY - src.base2dY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = (dist - 80) * 0.018;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          src.vx += fx; src.vy += fy;
          tgt.vx -= fx; tgt.vy -= fy;
        });

        nodes.forEach((n) => {
          if (dragging.mode === 'node' && dragging.nodeId === n.id) return;

          const offset = catCenterOffsets[n.node.category] || { dx: 0, dy: 0 };
          n.vx += (offset.dx - n.base2dX) * 0.009;
          n.vy += (offset.dy - n.base2dY) * 0.009;

          n.vx *= coolFriction;
          n.vy *= coolFriction;

          if (Math.abs(n.vx) < 0.02) n.vx = 0;
          if (Math.abs(n.vy) < 0.02) n.vy = 0;

          n.base2dX += n.vx;
          n.base2dY += n.vy;
        });
      }

      // ── Calculate Projected renderX / renderY with Live Ambient Currents ──
      nodes.forEach((n, idx) => {
        if (dragging.mode === 'node' && dragging.nodeId === n.id) {
          n.renderX = n.base2dX;
          n.renderY = n.base2dY;
          return;
        }

        // Live harmonic organic breathing
        const driftX = Math.sin(time * 0.0009 + n.phase) * 0.5;
        const driftY = Math.cos(time * 0.0009 + n.phase) * 0.5;
        const base2dWithDriftX = n.base2dX + driftX;
        const base2dWithDriftY = n.base2dY + driftY;

        if (morph > 0.001) {
          const lat = Math.asin(-1 + (2 * idx) / total);
          const lon = idx * 2.3999632297286533;

          const x0 = sphereRadius * Math.cos(lat) * Math.cos(lon);
          const y0 = sphereRadius * Math.sin(lat);
          const z0 = sphereRadius * Math.cos(lat) * Math.sin(lon);

          const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
          const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

          const x1 = x0 * cosY + z0 * sinY;
          const z1 = -x0 * sinY + z0 * cosY;
          const y1 = y0 * cosX - z1 * sinX;
          const z2 = y0 * sinX + z1 * cosX;

          const perspectiveScale = 520 / (520 - z2);
          const globeX = x1 * perspectiveScale;
          const globeY = y1 * perspectiveScale;

          n.renderX = (1 - morph) * base2dWithDriftX + morph * globeX;
          n.renderY = (1 - morph) * base2dWithDriftY + morph * globeY;
          n.z = z2;
        } else {
          n.renderX = base2dWithDriftX;
          n.renderY = base2dWithDriftY;
          n.z = 0;
        }
      });

      // ── Render Step ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W / dpr, H / dpr);

      // Deep Obsidian Background
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      const grad = ctx.createRadialGradient(W / dpr / 2, H / dpr / 2, 70, W / dpr / 2, H / dpr / 2, (W / dpr) * 0.85);
      grad.addColorStop(0, 'rgba(14, 18, 28, 0.55)');
      grad.addColorStop(0.6, 'rgba(8, 11, 17, 0.9)');
      grad.addColorStop(1, 'rgba(7, 9, 14, 1.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W / dpr, H / dpr);

      ctx.save();
      ctx.translate(cam.panX, cam.panY);
      ctx.scale(cam.zoom, cam.zoom);

      // Outer Constellation Boundary Ring
      if (morph < 0.6) {
        const clusterR = 540;
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.08 * (1 - morph)})`;
        ctx.lineWidth = 0.8 / cam.zoom;
        ctx.setLineDash([3, 8]);
        ctx.beginPath();
        ctx.arc(0, 0, clusterR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Atmospheric Glowing Cluster Nebulae
      if (morph < 0.8) {
        Object.entries(catCenterOffsets).forEach(([cat, config]) => {
          const color = CATEGORY_COLORS[cat] || '#10b981';
          const isHoveredCluster = p.selectedCategory === cat;
          const nebulaR = isHoveredCluster ? 240 : 180;
          const haloGrad = ctx.createRadialGradient(config.dx, config.dy, 10, config.dx, config.dy, nebulaR);
          haloGrad.addColorStop(0, color + (isHoveredCluster ? '30' : '15'));
          haloGrad.addColorStop(0.6, color + (isHoveredCluster ? '12' : '05'));
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(config.dx, config.dy, nebulaR, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Connected Nodes Set
      const connectedNodeIds = new Set<string>();
      if (p.activeNodeId) {
        connectedNodeIds.add(p.activeNodeId);
        p.graphData.edges.forEach((e) => {
          if (e.sourceId === p.activeNodeId) connectedNodeIds.add(e.targetId);
          if (e.targetId === p.activeNodeId) connectedNodeIds.add(e.sourceId);
        });
      }

      const pathNodeIdsSet = new Set(p.highlightedPathNodeIds || []);

      // ── Draw Edges (Cosmic Threads & Bioluminescent Flowing Photons) ──
      const map = edgeMapRef.current;
      p.graphData.edges.forEach((edge, idx) => {
        const src = map.get(edge.sourceId);
        const tgt = map.get(edge.targetId);
        if (!src || !tgt) return;

        if (p.selectedCategory && src.node.category !== p.selectedCategory && tgt.node.category !== p.selectedCategory) {
          return;
        }

        const isConnectedToSelected =
          p.activeNodeId && (edge.sourceId === p.activeNodeId || edge.targetId === p.activeNodeId);
        const isPathEdge =
          pathNodeIdsSet.has(edge.sourceId) && pathNodeIdsSet.has(edge.targetId);

        if (p.viewMode === 'focus' && p.activeNodeId && !isConnectedToSelected) {
          return;
        }

        ctx.beginPath();
        ctx.moveTo(src.renderX, src.renderY);
        ctx.lineTo(tgt.renderX, tgt.renderY);

        if (isPathEdge) {
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.4 / cam.zoom;
        } else if (isConnectedToSelected) {
          ctx.strokeStyle = src.color + 'dd';
          ctx.lineWidth = 1.4 / cam.zoom;
        } else {
          ctx.strokeStyle = 'rgba(160, 75, 65, 0.16)';
          ctx.lineWidth = 0.38 / cam.zoom;
        }
        ctx.stroke();

        // Real-time Bioluminescent Photons traveling along edges
        if (isPathEdge || isConnectedToSelected || (idx % 12 === 0 && cam.zoom > 0.4)) {
          const speedFactor = isPathEdge ? 0.0012 : 0.0006;
          const pT = ((time * speedFactor + idx * 0.18) % 1);
          const px = src.renderX + (tgt.renderX - src.renderX) * pT;
          const py = src.renderY + (tgt.renderY - src.renderY) * pT;

          ctx.beginPath();
          ctx.arc(px, py, (isPathEdge ? 2.5 : 1.8) / cam.zoom, 0, Math.PI * 2);
          ctx.fillStyle = isPathEdge ? '#34d399' : '#ffffff';
          ctx.fill();
        }
      });

      // ── Draw Nodes (Celestial Multi-Tier Star Particles) ──
      nodes.forEach((n) => {
        if (p.selectedCategory && n.node.category !== p.selectedCategory) return;

        const isSelected = p.activeNodeId === n.id;
        const isHovered = p.hoveredNode?.id === n.id;
        const isPathNode = pathNodeIdsSet.has(n.id);
        const isFocusConnected = p.viewMode !== 'focus' || !p.activeNodeId || connectedNodeIds.has(n.id);

        const alpha = isFocusConnected ? (pathNodeIdsSet.size > 0 && !isPathNode && !isSelected ? 0.2 : 1.0) : 0.08;
        const r = n.radius * 1.15;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Expanding active pulse ring for selected node
        if (isSelected) {
          const pulseT = (time * 0.003) % 1;
          const pulseR = r + pulseT * 18;
          ctx.beginPath();
          ctx.arc(n.renderX, n.renderY, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = (1.5 * (1 - pulseT)) / cam.zoom;
          ctx.stroke();
        }

        // Controlled subtle glow on hovered, selected, or path node
        if (isSelected || isPathNode || isHovered) {
          const glowR = r + (isSelected ? 16 : 8);
          const glowGrad = ctx.createRadialGradient(n.renderX, n.renderY, r * 0.2, n.renderX, n.renderY, glowR);
          glowGrad.addColorStop(0, n.color + 'bb');
          glowGrad.addColorStop(1, n.color + '00');
          ctx.beginPath();
          ctx.arc(n.renderX, n.renderY, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Node Inner Core
        ctx.beginPath();
        ctx.arc(n.renderX, n.renderY, r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        // Node Center Specular Star Point
        if (r > 3.0) {
          ctx.beginPath();
          ctx.arc(n.renderX, n.renderY, r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.fill();
        }

        // Clean Selective Labels
        const shouldShowLabel = isSelected || isHovered || isPathNode;

        if (shouldShowLabel) {
          const fontSize = Math.max(10, Math.min(13, 11 / cam.zoom));
          ctx.font = `${isSelected || isPathNode ? 'bold ' : ''}${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = isSelected ? '#ffffff' : isPathNode ? '#34d399' : '#f1f5f9';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const label = n.node.name.length > 24 ? n.node.name.substring(0, 22) + '…' : n.node.name;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 6;
          ctx.fillText(label, n.renderX, n.renderY + r + 3);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      ctx.restore();
      animIdRef.current = requestAnimationFrame(tick);
    };

    animIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animIdRef.current);
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = screenToWorld(sx, sy);

    const hit = physicsRef.current.find((n) => {
      const dx = n.renderX - world.x;
      const dy = n.renderY - world.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * 1.15 + 7;
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
      soundFX.playNodeSelect();
      focusNode(hit.id, 1.45);
      if (propsRef.current.onSelectNode) {
        propsRef.current.onSelectNode(hit.node);
      }
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
    const world = screenToWorld(sx, sy);

    const drag = dragRef.current;

    if (drag.mode === 'pan') {
      cameraRef.current.panX = drag.startPanX + (sx - drag.startX);
      cameraRef.current.panY = drag.startPanY + (sy - drag.startY);
      cameraRef.current.followNodeId = null;
      forceRender((n) => n + 1);
    } else if (drag.mode === 'node' && drag.nodeId) {
      const targetNode = physicsRef.current.find((n) => n.id === drag.nodeId);
      if (targetNode) {
        targetNode.base2dX = world.x;
        targetNode.base2dY = world.y;
        targetNode.renderX = world.x;
        targetNode.renderY = world.y;
        targetNode.vx = 0;
        targetNode.vy = 0;
        frameCountRef.current = 0;
      }
    } else {
      const hit = physicsRef.current.find((n) => {
        const dx = n.renderX - world.x;
        const dy = n.renderY - world.y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius * 1.15 + 7;
      });
      setHoveredNode(hit || null);
      if (hit) {
        setTooltipPos({ x: sx, y: sy });
      } else {
        setTooltipPos(null);
      }
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
      const dx = n.renderX - world.x;
      const dy = n.renderY - world.y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius * 1.15 + 7;
    });

    if (hit) {
      focusNode(hit.id);
      if (onExpandNeighborhood) onExpandNeighborhood(hit.id);
    } else {
      resetCamera();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#07090e] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setTooltipPos(null);
        }}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Lightweight 1-line hover tooltip */}
      {hoveredNode && tooltipPos && !activeNodeId && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-2.5 py-1 rounded-md bg-[#0e121a]/95 backdrop-blur-md border border-zinc-700/80 text-white text-[11px] font-sans flex items-center gap-2 shadow-xl animate-in fade-in duration-75"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 8 }}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
          <span className="font-semibold">{hoveredNode.node.name}</span>
          <span className="text-[10px] text-zinc-400 font-mono">· {hoveredNode.node.category}</span>
        </div>
      )}

      {/* Game-like Minimal Navigation Overlay (Bottom-Left) */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c1017]/85 backdrop-blur-md border border-zinc-800/80 shadow-xl font-mono text-[10px] text-zinc-400">
        <span className="px-1.5 py-0.5 text-zinc-500 font-sans">Jump:</span>
        <button
          onClick={() => jumpToNodeInDirection('up')}
          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
          title="Jump Up (↑)"
        >
          ↑
        </button>
        <button
          onClick={() => jumpToNodeInDirection('down')}
          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
          title="Jump Down (↓)"
        >
          ↓
        </button>
        <button
          onClick={() => jumpToNodeInDirection('left')}
          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
          title="Jump Left (←)"
        >
          ←
        </button>
        <button
          onClick={() => jumpToNodeInDirection('right')}
          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer"
          title="Jump Right (→)"
        >
          →
        </button>
        <button
          onClick={resetCamera}
          className="px-2 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 flex items-center justify-center cursor-pointer ml-1"
          title="Recenter Graph (Space/R)"
        >
          Center
        </button>
      </div>
    </div>
  );
});

ObsidianGraphCanvas.displayName = 'ObsidianGraphCanvas';
