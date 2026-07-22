'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, RotateCcw } from 'lucide-react';

export default function GlobalSettingsPage() {
  const [presets, setPresets] = useState({
    repulsion: 1400,
    linkDist: 80,
    centerForce: 0.008,
    friction: 0.92,
    nodeSize: 1.2,
    lineOpacity: 0.35,
    categoryColors: {
      Biodiversity: '#10b981',
      Spatial: '#38bdf8',
      Pollution: '#f43f5e',
      Climate: '#f97316',
      Policy: '#a855f7',
      User: '#ec4899',
      Quest: '#06b6d4',
    },
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/admin/ecograph/publish');
      const json = await res.json();
      if (json.success && json.presets) {
        setPresets(json.presets);
      }
    } catch (err) {
      console.error('Failed to fetch admin presets:', err);
    }
  };

  const handleSavePresets = async () => {
    try {
      const res = await fetch('/api/admin/ecograph/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_presets', newPresets: presets }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save admin presets:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" /> Global Physics & Display Presets
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure default physics forces, friction damping, node sizes, and category colors that govern the public SaaS Explorer view globally.
        </p>
      </div>

      {/* Physics Sliders */}
      <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
          Physics Simulation Defaults
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono">
              <span>Repulsion Force</span>
              <span className="text-emerald-400">{presets.repulsion}</span>
            </div>
            <input
              type="range"
              min="400"
              max="3000"
              step="100"
              value={presets.repulsion}
              onChange={(e) => setPresets((p) => ({ ...p, repulsion: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono">
              <span>Link Distance</span>
              <span className="text-emerald-400">{presets.linkDist}px</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={presets.linkDist}
              onChange={(e) => setPresets((p) => ({ ...p, linkDist: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono">
              <span>Friction Damping</span>
              <span className="text-emerald-400">{presets.friction}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.98"
              step="0.01"
              value={presets.friction}
              onChange={(e) => setPresets((p) => ({ ...p, friction: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-zinc-400 mb-1 font-mono">
              <span>Center Gravity Force</span>
              <span className="text-emerald-400">{presets.centerForce}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.02"
              step="0.001"
              value={presets.centerForce}
              onChange={(e) => setPresets((p) => ({ ...p, centerForce: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Category Colors */}
      <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-3">
          Global Category Color Themes
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {Object.entries(presets.categoryColors).map(([cat, color]) => (
            <div key={cat} className="bg-zinc-950 p-2.5 rounded border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300 font-medium">{cat}</span>
              <input
                type="color"
                value={color}
                onChange={(e) =>
                  setPresets((p) => ({
                    ...p,
                    categoryColors: { ...p.categoryColors, [cat]: e.target.value },
                  }))
                }
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() =>
            setPresets({
              repulsion: 1400,
              linkDist: 80,
              centerForce: 0.008,
              friction: 0.92,
              nodeSize: 1.2,
              lineOpacity: 0.35,
              categoryColors: {
                Biodiversity: '#10b981',
                Spatial: '#38bdf8',
                Pollution: '#f43f5e',
                Climate: '#f97316',
                Policy: '#a855f7',
                User: '#ec4899',
                Quest: '#06b6d4',
              },
            })
          }
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
        </button>

        <button
          onClick={handleSavePresets}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition shadow-lg"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Global Presets Saved!' : 'Save Global Presets'}
        </button>
      </div>
    </div>
  );
}
