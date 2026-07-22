'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, FileText, Check, ArrowRight, Layers, ShieldCheck, Cpu, AlertTriangle, Database } from 'lucide-react';

export default function AIIngestionStudioPage() {
  const [urlInput, setUrlInput] = useState('');
  const [rawTextInput, setRawTextInput] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExtract = async () => {
    if (!urlInput && !rawTextInput) return;
    try {
      setExtracting(true);
      setErrorMsg('');
      setImported(false);
      const res = await fetch('/api/admin/ecograph/ai-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, rawText: rawTextInput }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract knowledge from provided source.');
      }
      setExtractedData(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error extracting knowledge.');
      console.error('Failed to extract content:', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleImportToKnowledgeGraph = async () => {
    if (!extractedData?.extractedEntities?.length) return;
    try {
      setImporting(true);
      const entities = extractedData.extractedEntities;
      const edges = extractedData.proposedEdges || [];

      // 1. Import all extracted entities as Nodes
      for (const entity of entities) {
        await fetch('/api/admin/ecograph/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: entity.name,
            category: entity.category,
            label: entity.label,
            scientificName: entity.scientificName,
            description: entity.description,
            tags: entity.tags,
            icon: entity.icon || '📌',
          }),
        });
      }

      // 2. Import proposed graph relationships as Edges
      for (const edge of edges) {
        if (edge.sourceId && edge.targetId) {
          await fetch('/api/admin/ecograph/edges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceId: edge.sourceId,
              targetId: edge.targetId,
              type: edge.type || 'affects',
              label: edge.label || 'connected concept',
            }),
          });
        }
      }

      setImported(true);
    } catch (err: any) {
      setErrorMsg('Failed to import entities into MongoDB graph: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" /> AI Web & Document Knowledge Extraction Studio
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Scrape WWF, IUCN, or CPCB environmental article URLs or text snippets. Multi-model AI (Gemini + Local NLP Auto-Linker) extracts species, habitats, pollutants, policies, and graph relationships.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option A: Web URL Ingestion */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" /> Web Article / URL Scraper
          </h2>
          <p className="text-xs text-zinc-400">
            Paste any public environmental report URL (e.g. WWF, IUCN, UNEP).
          </p>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.worldwildlife.org/species/bengal-tiger"
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        {/* Option B: Raw Text Snippet */}
        <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> Document Text Stream
          </h2>
          <p className="text-xs text-zinc-400">
            Paste unstructured gazette text, abstracts, or raw observation notes.
          </p>
          <textarea
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            rows={2}
            placeholder="Paste environmental bulletin paragraph here..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono"
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
        {extracting ? 'AI Fetching Web Content & Discovering Typed Graph Links...' : 'Execute AI Knowledge Extraction'}
      </button>

      {/* AI Extraction Preview Card */}
      {extractedData && (
        <div className="bg-[#11131c] border border-emerald-500/40 p-5 rounded-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Extraction Results & Auto-Linker Output</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Confidence: {Math.round((extractedData.confidenceScore || 0.9) * 100)}%
              </span>
              {extractedData.engine && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> {extractedData.engine}
                </span>
              )}
            </div>
            {imported && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Committed to MongoDB Graph
              </span>
            )}
          </div>

          {/* Extracted Entities List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Extracted Knowledge Entities ({extractedData.extractedEntities?.length || 0})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extractedData.extractedEntities?.map((entity: any, idx: number) => (
                <div key={idx} className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">{entity.icon || '📌'}</span> {entity.name}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 text-emerald-400 font-mono">
                      {entity.category}
                    </span>
                  </div>
                  {entity.scientificName && (
                    <div className="text-[11px] text-zinc-500 italic font-mono">{entity.scientificName}</div>
                  )}
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{entity.description}</p>
                  {entity.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entity.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Relationships */}
          {extractedData.proposedEdges?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> Discovered Graph Relationships ({extractedData.proposedEdges.length})
              </span>
              <div className="space-y-1.5">
                {extractedData.proposedEdges.map((rel: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-zinc-950 p-2.5 rounded border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between font-mono"
                  >
                    <span>
                      [{rel.sourceName || 'New Entity'}] ➔ <em className="text-emerald-400">{rel.type}</em> ➔ [{rel.targetName || rel.targetId}]
                    </span>
                    <span className="text-[10px] text-zinc-500">{rel.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          {!imported && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleImportToKnowledgeGraph}
                disabled={importing}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-lg"
              >
                <ArrowRight className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
                {importing ? 'Commiting Entities & Edges to Database...' : '1-Click Ingest Entities & Edges to MongoDB'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
