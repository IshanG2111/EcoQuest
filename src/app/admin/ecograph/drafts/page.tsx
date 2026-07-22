'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, History, RotateCcw, Send, FileText, Clock, AlertCircle } from 'lucide-react';

export default function DraftsAndVersionsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commitMessage, setCommitMessage] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchPublishData();
  }, []);

  const fetchPublishData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ecograph/publish');
      const json = await res.json();
      if (json.success) {
        setDrafts(json.drafts || []);
        setHistory(json.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch publish data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const res = await fetch('/api/admin/ecograph/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', commitMessage }),
      });
      const json = await res.json();
      if (json.success) {
        setCommitMessage('');
        fetchPublishData();
      }
    } catch (err) {
      console.error('Failed to publish changes:', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (version: string) => {
    if (!confirm(`Are you sure you want to rollback to ${version}? Current uncommitted drafts will be reset.`)) return;
    try {
      const res = await fetch('/api/admin/ecograph/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', rollbackVersion: version }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPublishData();
      }
    } catch (err) {
      console.error('Failed to rollback version:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Draft Staging & Version Control
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review staged node/edge edits, publish live snapshots to the public SaaS application, and manage 1-click version rollbacks.
        </p>
      </div>

      {/* Publish Staging Section */}
      <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" /> Pending Staged Edits ({drafts.length})
          </h2>
          {drafts.length > 0 && (
            <span className="text-xs text-amber-400 font-mono font-bold animate-pulse">
              ● Ready to Publish
            </span>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800/80 text-center space-y-1">
            <span className="text-xs text-zinc-400">All edits are published and up to date!</span>
            <p className="text-[10px] text-zinc-500">Public graph view matches current live knowledge graph baseline.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {drafts.map((d) => (
                <div
                  key={d.id}
                  className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-xs flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-amber-400 uppercase font-bold">
                      {d.type}
                    </span>
                    <span className="text-zinc-300">Target: {d.entityId}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{new Date(d.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>

            {/* Commit Message & Publish Trigger */}
            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message (e.g. Added Project Elephant & Kaziranga migration links)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handlePublish}
                disabled={publishing || drafts.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded text-xs flex items-center gap-1.5 transition shadow"
              >
                <Send className="w-3.5 h-3.5" /> Publish to Public SaaS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Version History Table */}
      <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
          <History className="w-4 h-4 text-sky-400" /> Version Snapshot History ({history.length})
        </h2>

        <div className="divide-y divide-zinc-800/60">
          {history.map((ver) => (
            <div key={ver.version} className="py-3 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">{ver.version}</span>
                  <span className="text-[10px] text-zinc-500">
                    ({ver.nodeCount} nodes · {ver.edgeCount} edges)
                  </span>
                </div>
                <p className="text-zinc-400 font-sans text-xs">{ver.description}</p>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(ver.timestamp).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleRollback(ver.version)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-xs flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" /> Rollback to {ver.version}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
