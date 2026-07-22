'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, Sparkles, Orbit, Maximize2, Minimize2 } from 'lucide-react';

interface PresetConfig {
  id: 'galaxy' | 'constellation' | 'nebula';
  name: string;
  subtitle: string;
  description: string;
  icon: any;
  params: {
    repulsion: number;
    linkDist: number;
    centerForce: number;
    friction: number;
    nodeSize: number;
    lineOpacity: number;
  };
}

const PRESET_OPTIONS: PresetConfig[] = [
  {
    id: 'galaxy',
    name: 'Organic Galaxy',
    subtitle: 'Balanced Default',
    description: 'Optimal balanced layout with organic cluster force attraction and crisp stabilization.',
    icon: Orbit,
    params: {
      repulsion: 1400,
      linkDist: 80,
      centerForce: 0.008,
      friction: 0.92,
      nodeSize: 1.2,
      lineOpacity: 0.35,
    },
  },
  {
    id: 'constellation',
    name: 'Tight Constellation',
    subtitle: 'High Density / Compact',
    description: 'Compact grouping bringing connected species & policies close together for high-density overview.',
    icon: Minimize2,
    params: {
      repulsion: 750,
      linkDist: 50,
      centerForce: 0.015,
      friction: 0.88,
      nodeSize: 1.0,
      lineOpacity: 0.45,
    },
  },
  {
    id: 'nebula',
    name: 'Expanded Nebula',
    subtitle: 'Wide Spacing / Deep Dive',
    description: 'Generous node spacing allowing clear label readability across vast knowledge networks.',
    icon: Maximize2,
    params: {
      repulsion: 2500,
      linkDist: 140,
      centerForce: 0.004,
      friction: 0.95,
      nodeSize: 1.5,
      lineOpacity: 0.3,
    },
  },
];

export default function GlobalSettingsPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<'galaxy' | 'constellation' | 'nebula'>('galaxy');
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({
    Biodiversity: '#10b981',
    Spatial: '#38bdf8',
    Pollution: '#f43f5e',
    Climate: '#f97316',
    Policy: '#a855f7',
    User: '#ec4899',
    Quest: '#06b6d4',
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
        const p = json.presets;
        if (p.repulsion <= 900) setSelectedPresetId('constellation');
        else if (p.repulsion >= 2000) setSelectedPresetId('nebula');
        else setSelectedPresetId('galaxy');

        if (p.categoryColors) {
          setCategoryColors((prev) => ({ ...prev, ...p.categoryColors }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin presets:', err);
    }
  };

  const handleSelectPreset = (preset: PresetConfig) => {
    setSelectedPresetId(preset.id);
  };

  const handleSavePresets = async () => {
    try {
      const activeConfig = PRESET_OPTIONS.find((p) => p.id === selectedPresetId) || PRESET_OPTIONS[0];
      const payload = {
        ...activeConfig.params,
        categoryColors,
      };

      const res = await fetch('/api/admin/ecograph/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_presets', newPresets: payload }),
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
          <Sliders className="w-5 h-5 text-emerald-400" /> Graph Physics Presets
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Select one of 3 curated global graph layout modes for the public SaaS app.
        </p>
      </div>

      {/* 3 Presets Selection Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-zinc-300 tracking-wide uppercase">Select Active Graph Preset Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_OPTIONS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-xl ring-1 ring-emerald-500'
                    : 'bg-[#11131c] border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-500 text-black">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{preset.name}</h3>
                    <span className="text-[10px] text-emerald-400 font-mono block">{preset.subtitle}</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{preset.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Repulsion: {preset.params.repulsion}</span>
                  <span>Link: {preset.params.linkDist}px</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Colors */}
      <div className="bg-[#11131c] border border-zinc-800/80 p-5 rounded-xl space-y-4">
        <h2 className="text-xs font-bold text-white border-b border-zinc-800 pb-3 uppercase tracking-wide">
          Global Category Colors
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div key={cat} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300 font-medium">{cat}</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setCategoryColors((prev) => ({ ...prev, [cat]: e.target.value }))}
                className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSavePresets}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-xl"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Global Preset Applied!' : 'Apply Selected Preset'}
        </button>
      </div>
    </div>
  );
}
