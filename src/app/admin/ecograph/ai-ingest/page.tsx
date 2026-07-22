'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, FileText, Check, ArrowRight, Layers, ShieldCheck } from 'lucide-react';

export default function AIIngestionStudioPage() {
  const [urlInput, setUrlInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [imported, setImported] = useState(false);

  const handleExtract = async () => {
    if (!urlInput && !rawTextInput) return;
    try {
      setExtracting(true);
      setImported(false);
      const res = await fetch('/api/admin/ecograph/ai-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, rawText: rawTextInput }),
      });
      const json = await res.json();
      if (json.success) {
        setExtractedData(json);
      }
    } catch (err) {
      console.error('Failed to extract content:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleImportToDrafts = async () => {
    if (!extractedData?.extractedEntity) return;
    try {
      const nodePayload = extractedData.extractedEntity;
      const res = await fetch('/api/admin/ecograph/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nodePayload.name,
          category: nodePayload.category,
          label: nodePayload.label,
          scientificName: nodePayload.scientificName,
          description: nodePayload.description,
          tags: nodePayload.tags,
          icon: '🌐',
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Also import proposed relationships
        if (nodePayload.proposedRelationships) {
          for (const rel of nodePayload.proposedRelationships) {
            await fetch('/api/admin/ecograph/edges', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sourceId: json.node.id,
                targetId: rel.targetId,
                type: rel.type,
                label: rel.label,
              }),
            });
          }
        }
        setImported(true);
      }
    } catch (err) {
      console.error('Failed to import extracted data:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" /> AI Web & Document Ingestion Studio
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Paste any WWF, IUCN, IPCC report link or text snippet. AI automatically parses titles, scientific attributes, and proposes typed graph relationships.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option A: Web URL Ingestion */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" /> Extract via Web URL
          </h2>
          <p className="text-xs text-zinc-400">
            Paste a public URL (e.g. World Wildlife Fund, IUCN Redlist page).
          </p>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.worldwildlife.org/species/bengal-tiger"
            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Option B: Raw Text Snippet */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> Extract via Document Text
          </h2>
          <p className="text-xs text-zinc-400">
            Paste unstructured bulletin text or report abstracts.
          </p>
          <textarea
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            rows={2}
            placeholder="Paste environmental report paragraph here..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleExtract}
        disabled={extracting || (!urlInput && !rawTextInput)}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-xl"
      >
        <Sparkles className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
        {extracting ? 'AI Analyzing Web Document & Inferring Graph Edges...' : 'Run AI Knowledge Extraction'}
      </button>

      {/* AI Extraction Preview Card */}
      {extractedData && (
        <div className="bg-[#11131c] border border-emerald-500/40 p-5 rounded-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">AI Extraction Preview</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Confidence: {Math.round(extractedData.confidenceScore * 100)}%
              </span>
            </div>
            {imported && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Imported to Drafts
              </span>
            )}
          </div>

          <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <span className="text-base">🌐</span>
              <span>{extractedData.extractedEntity.name}</span>
              <span className="text-zinc-500 italic">({extractedData.extractedEntity.scientificName})</span>
            </div>
            <p className="text-zinc-400 text-xs">{extractedData.extractedEntity.description}</p>
          </div>

          {/* Proposed Relationships */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Inferred Graph Edges ({extractedData.extractedEntity.proposedRelationships.length})
            </span>
            <div className="space-y-1.5">
              {extractedData.extractedEntity.proposedRelationships.map((rel: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between font-mono"
                >
                  <span>
                    [{extractedData.extractedEntity.name}] ➔ <em className="text-emerald-400">{rel.type}</em> ➔ [{rel.targetId}]
                  </span>
                  <span className="text-[10px] text-zinc-500">{rel.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          {!imported && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleImportToDrafts}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow"
              >
                <ArrowRight className="w-4 h-4" /> Import Proposed Entity & Edges to Drafts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
