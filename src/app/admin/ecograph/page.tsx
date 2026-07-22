'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  FileCheck,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Database,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ecograph/nodes');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" /> Knowledge Studio Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time data health analytics, orphan node audits, and pending draft pipelines.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Nodes */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Nodes</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {metrics?.totalNodes ?? '---'}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Active Knowledge Entities</span>
        </div>

        {/* Total Edges */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Relationships</span>
            <GitBranch className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {metrics?.totalEdges ?? '---'}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Typed Property Edges</span>
        </div>

        {/* Health Score */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Data Health Score</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            {metrics?.healthScore ?? '---'} / 100
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Calculated Audit Quality</span>
        </div>

        {/* Pending Drafts */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Pending Drafts</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {metrics?.pendingDraftCount ?? '0'}
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block">Awaiting Publication</span>
        </div>
      </div>

      {/* Data Health & Warnings */}
      <div className="bg-[#11131c] border border-zinc-800/80 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Data Quality Audit & Orphan Warnings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orphan Nodes Alert */}
          <div className="bg-zinc-950 p-4 rounded-lg border border-amber-500/30 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-400 block mb-1">
                Orphan Nodes Detected ({metrics?.orphanNodeCount ?? 0})
              </span>
              <p className="text-xs text-zinc-400">
                Nodes with 0 edges disconnected from the main graph. Use the Relationship Builder to connect them.
              </p>
            </div>
            <Link
              href="/admin/ecograph/editor"
              className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded text-xs font-medium transition"
            >
              Fix Links
            </Link>
          </div>

          {/* Missing Citations Alert */}
          <div className="bg-zinc-950 p-4 rounded-lg border border-sky-500/30 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-sky-400 block mb-1">
                Provenance Audit ({metrics?.missingCitationCount ?? 0})
              </span>
              <p className="text-xs text-zinc-400">
                Entities missing GBIF / IUCN provenance citations. Ensure all facts contain verifiable source metadata.
              </p>
            </div>
            <Link
              href="/admin/ecograph/editor"
              className="px-3 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 rounded text-xs font-medium transition"
            >
              Inspect
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/ecograph/editor"
          className="bg-[#11131c] hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-xl transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Visual Graph Editor
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Create nodes & drag-and-drop relationship links visually without writing Cypher queries.
          </p>
        </Link>

        <Link
          href="/admin/ecograph/ai-ingest"
          className="bg-[#11131c] hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-xl transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Web Ingestion Studio
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Paste environmental URLs or PDFs to extract structured entities and proposed graph relationships automatically.
          </p>
        </Link>

        <Link
          href="/admin/ecograph/drafts"
          className="bg-[#11131c] hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-xl transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Drafts & Version Control
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Review pending edits, publish live snapshots (`v1.1`), and execute 1-click version rollbacks.
          </p>
        </Link>
      </div>
    </div>
  );
}
