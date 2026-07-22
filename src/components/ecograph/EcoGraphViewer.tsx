'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EcoNode, EcoEdge, GraphData, NodeCategory } from '@/lib/ecograph/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  MapPin,
  Tag,
} from 'lucide-react';

interface EcoGraphViewerProps {
  graphData: GraphData;
  activeNodeId?: string;
  highlightedPathNodeIds?: string[];
  onSelectNode?: (node: EcoNode) => void;
  onExpandNeighborhood?: (nodeId: string) => void;
}

const CATEGORY_COLORS: Record<NodeCategory, { bg: string; stroke: string; label: string }> = {
  Biodiversity: { bg: '#10b981', stroke: '#047857', label: 'Biodiversity' },
  Spatial: { bg: '#3b82f6', stroke: '#1d4ed8', label: 'Habitat / Location' },
  Pollution: { bg: '#ef4444', stroke: '#b91c1c', label: 'Pollutant / Stressor' },
  Climate: { bg: '#f59e0b', stroke: '#b45309', label: 'Climate Trend' },
  Policy: { bg: '#8b5cf6', stroke: '#6d28d9', label: 'Policy & Scheme' },
  User: { bg: '#ec4899', stroke: '#be185d', label: 'User Node' },
  Quest: { bg: '#06b6d4', stroke: '#0e7490', label: 'Quest Mission' },
};

export const EcoGraphViewer: React.FC<EcoGraphViewerProps> = ({
  graphData,
  activeNodeId,
  highlightedPathNodeIds = [],
  onSelectNode,
  onExpandNeighborhood,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<EcoNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Compute circular / force-like initial layout positions for nodes
  useEffect(() => {
    const width = 800;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const positions: Record<string, { x: number; y: number }> = {};
    const count = graphData.nodes.length;

    graphData.nodes.forEach((node, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      // Slight jitter based on category
      const catOffset = (Object.keys(CATEGORY_COLORS).indexOf(node.category) || 0) * 15;
      const x = centerX + (radius + catOffset) * Math.cos(angle);
      const y = centerY + (radius + catOffset) * Math.sin(angle);
      positions[node.id] = { x, y };
    });

    setNodePositions(positions);
  }, [graphData]);

  useEffect(() => {
    if (activeNodeId) {
      const found = graphData.nodes.find((n) => n.id === activeNodeId);
      if (found) setSelectedNode(found);
    }
  }, [activeNodeId, graphData]);

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - offset.x) / zoom;
        const mouseY = (e.clientY - rect.top - offset.y) / zoom;
        setNodePositions((prev) => ({
          ...prev,
          [draggingNodeId]: { x: mouseX, y: mouseY },
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleNodeClick = (node: EcoNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[520px] bg-zinc-950 text-zinc-100 rounded-lg overflow-hidden border border-zinc-800 font-mono select-none">
      {/* Top Control Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-1.5 rounded-md text-xs shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
          className="p-1 hover:bg-zinc-800 rounded transition text-zinc-300 hover:text-white"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
          className="p-1 hover:bg-zinc-800 rounded transition text-zinc-300 hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="p-1 hover:bg-zinc-800 rounded transition text-zinc-300 hover:text-white"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="h-4 w-[1px] bg-zinc-800 my-auto" />
        <span className="text-[10px] text-zinc-400 font-semibold px-1">
          {graphData.nodes.length} NODES | {graphData.edges.length} EDGES
        </span>
      </div>

      {/* Category Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex flex-wrap gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 p-2 rounded-md text-[10px]">
        {Object.entries(CATEGORY_COLORS).map(([cat, cfg]) => (
          <div key={cat} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: cfg.bg }}
            />
            <span className="text-zinc-300">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
            </marker>
          </defs>

          <g transform={`translate(${offset.x}, ${offset.y}) scale(${zoom})`}>
            {/* Render Edges */}
            {graphData.edges.map((edge) => {
              const src = nodePositions[edge.sourceId];
              const tgt = nodePositions[edge.targetId];
              if (!src || !tgt) return null;

              const isHighlighted =
                highlightedPathNodeIds.includes(edge.sourceId) &&
                highlightedPathNodeIds.includes(edge.targetId);

              const strokeColor = isHighlighted ? '#10b981' : '#3f3f46';
              const strokeWidth = isHighlighted ? 2.5 : 1.2;

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isHighlighted ? '4 2' : 'none'}
                    markerEnd={isHighlighted ? 'url(#arrow-active)' : 'url(#arrow)'}
                    className="transition-all duration-300"
                  />
                  <text
                    x={midX}
                    y={midY - 4}
                    fill="#a1a1aa"
                    fontSize="8"
                    textAnchor="middle"
                    className="pointer-events-none select-none font-sans opacity-70"
                  >
                    {edge.type}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphData.nodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 400, y: 250 };
              const cfg = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Biodiversity;
              const isSelected = selectedNode?.id === node.id;
              const isHighlighted = highlightedPathNodeIds.includes(node.id);

              const radius = isSelected ? 22 : 18;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={() => setDraggingNodeId(node.id)}
                  onClick={(e) => handleNodeClick(node, e)}
                  className="cursor-pointer group"
                >
                  {/* Glowing ring if selected or highlighted */}
                  {(isSelected || isHighlighted) && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke={isSelected ? '#38bdf8' : '#10b981'}
                      strokeWidth="2"
                      strokeDasharray="3 2"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Base Circle */}
                  <circle
                    r={radius}
                    fill={cfg.bg}
                    stroke={isSelected ? '#ffffff' : cfg.stroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200 hover:scale-110 shadow-lg"
                  />

                  {/* Icon */}
                  <text
                    x="0"
                    y="4"
                    fontSize="13"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {node.icon || '🌐'}
                  </text>

                  {/* Label below node */}
                  <text
                    x="0"
                    y={radius + 14}
                    fill={isSelected ? '#38bdf8' : '#e4e4e7'}
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="pointer-events-none font-sans drop-shadow-md"
                  >
                    {node.name.length > 18 ? `${node.name.substring(0, 16)}...` : node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute top-3 right-3 bottom-3 w-80 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-lg p-4 z-20 flex flex-col justify-between overflow-y-auto text-xs font-sans shadow-2xl animate-in slide-in-from-right-4 duration-200">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3 border-b border-zinc-800 pb-2">
              <div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider text-white"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[selectedNode.category]?.bg || '#10b981',
                  }}
                >
                  {selectedNode.category} • {selectedNode.label}
                </span>
                <h3 className="text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <span>{selectedNode.icon}</span> {selectedNode.name}
                </h3>
                {selectedNode.scientificName && (
                  <p className="text-[11px] italic text-emerald-400">
                    {selectedNode.scientificName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-zinc-300 leading-relaxed mb-3 text-xs">
              {selectedNode.description}
            </p>

            {/* Spatial Location */}
            {selectedNode.spatial?.region && (
              <div className="flex items-center gap-1.5 text-zinc-400 mb-3 bg-zinc-950/60 p-2 rounded border border-zinc-800/60">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  {selectedNode.spatial.region},{' '}
                  <strong className="text-zinc-200">
                    {selectedNode.spatial.country || 'Global'}
                  </strong>
                </span>
              </div>
            )}

            {/* Attributes Key-Value */}
            <div className="mb-3">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block mb-1.5">
                Node Properties
              </span>
              <div className="space-y-1 font-mono text-[11px] bg-zinc-950 p-2 rounded border border-zinc-800/80">
                {Object.entries(selectedNode.attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-zinc-900 pb-0.5">
                    <span className="text-zinc-400">{k}:</span>
                    <span className="text-emerald-400 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {selectedNode.tags.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[9px] font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Provenance Audit */}
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800/80 text-[10px] font-mono mb-3 space-y-1">
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Provenance Audit
              </div>
              <div className="text-zinc-400">Source: {selectedNode.provenance.source}</div>
              <div className="text-zinc-400">License: {selectedNode.provenance.license}</div>
              <div className="text-zinc-400">
                Confidence: {Math.round(selectedNode.provenance.confidenceScore * 100)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            {onExpandNeighborhood && (
              <button
                onClick={() => onExpandNeighborhood(selectedNode.id)}
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-mono font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" /> Expand 1-Hop Neighborhood
              </button>
            )}
            {selectedNode.provenance.externalUri && (
              <a
                href={selectedNode.provenance.externalUri}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-mono text-xs flex items-center justify-center gap-1.5 transition border border-zinc-700"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Source Registry
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
