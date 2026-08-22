'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Sliders,
  X,
  Check,
  Palette,
  Shield,
  Award,
} from 'lucide-react';
import { soundFX } from '@/lib/audio-fx';
import { playShutterSound } from '@/components/ui/admit-one-ticket';

export interface PassportConfig {
  name: string;
  rank: string;
  themeId: string;
  watermark: string;
  dates: string;
  stubText: string;
}

export const PASSPORT_THEMES: Record<string, {
  name: string;
  colorBack: string;
  colorFront: string;
  colorHighlight: string;
  inkColor: string;
  watermarkColor: string;
  badgeBg: string;
}> = {
  emerald: {
    name: 'Verdant Grove',
    colorBack: '#064e3b',
    colorFront: '#34d399',
    colorHighlight: '#fde047',
    inkColor: '#022c22',
    watermarkColor: '#6ee7b7',
    badgeBg: 'from-emerald-500/20 to-teal-500/20',
  },
  ocean: {
    name: 'Abyssal Tide',
    colorBack: '#083344',
    colorFront: '#38bdf8',
    colorHighlight: '#a5f3fc',
    inkColor: '#031a24',
    watermarkColor: '#7dd3fc',
    badgeBg: 'from-sky-500/20 to-cyan-500/20',
  },
  solar: {
    name: 'Ember Hearth',
    colorBack: '#7c2d12',
    colorFront: '#fb923c',
    colorHighlight: '#fef08a',
    inkColor: '#270a04',
    watermarkColor: '#fdba74',
    badgeBg: 'from-amber-500/20 to-orange-500/20',
  },
  cosmic: {
    name: 'Cosmic Amethyst',
    colorBack: '#4c1d95',
    colorFront: '#c084fc',
    colorHighlight: '#f472b6',
    inkColor: '#1e053a',
    watermarkColor: '#d8b4fe',
    badgeBg: 'from-purple-500/20 to-pink-500/20',
  },
  cyber: {
    name: 'Cyber Neon',
    colorBack: '#09090b',
    colorFront: '#4ade80',
    colorHighlight: '#facc15',
    inkColor: '#05200f',
    watermarkColor: '#86efac',
    badgeBg: 'from-green-500/20 to-yellow-500/20',
  },
};

export const RANKS = [
  'PLANETARY ACCESS PASS',
  'FOREST GUARDIAN',
  'OCEAN PROTECTOR',
  'CARBON HERO',
  'GAIA EXPLORER',
  'BIOME SCOUT',
];

const STORAGE_KEY = 'ecoquest_passport_customization';

export function loadSavedPassportConfig(defaultName = 'EXPLORER'): PassportConfig {
  if (typeof window === 'undefined') {
    return {
      name: defaultName,
      rank: 'PLANETARY ACCESS PASS',
      themeId: 'emerald',
      watermark: '2026',
      dates: '2026 ACTIVE',
      stubText: 'ADMIT ONE // LEVEL 01',
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        name: parsed.name || defaultName,
      };
    }
  } catch {}

  return {
    name: defaultName,
    rank: 'PLANETARY ACCESS PASS',
    themeId: 'emerald',
    watermark: '2026',
    dates: '2026 ACTIVE',
    stubText: 'ADMIT ONE // LEVEL 01',
  };
}

export function savePassportConfig(config: PassportConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export interface PassportCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PassportConfig;
  onChange: (updated: PassportConfig) => void;
  onDownload: () => void;
  onPrint: () => void;
}

export function PassportCustomizerModal({
  isOpen,
  onClose,
  config,
  onChange,
  onDownload,
  onPrint,
}: PassportCustomizerModalProps) {
  if (!isOpen) return null;

  const handleFieldChange = (key: keyof PassportConfig, value: string) => {
    const next = { ...config, [key]: value };
    onChange(next);
    savePassportConfig(next);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0c1017]/98 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden font-sans text-xs text-zinc-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Customize Planetary Passport
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Explorer Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Explorer Codename / Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleFieldChange('name', e.target.value.toUpperCase())}
              placeholder="e.g. CAPTAIN GAIA"
              maxLength={22}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500/60 uppercase"
            />
          </div>

          {/* Explorer Rank */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Conservation Rank / Title
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {RANKS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    handleFieldChange('rank', r);
                  }}
                  className={`px-2.5 py-2 rounded-xl border text-[11px] font-medium text-left truncate transition cursor-pointer ${
                    config.rank === r
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold'
                      : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Color Aura Theme */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Passport Hologram Aura
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PASSPORT_THEMES).map(([id, t]) => {
                const isSelected = config.themeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      handleFieldChange('themeId', id);
                    }}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
                      style={{ backgroundColor: t.colorFront }}
                    />
                    <span className="text-[11px] truncate font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Watermark Code */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Passport Year / Watermark
            </label>
            <div className="flex gap-2">
              {['2026', 'GAIA', 'ECO-01', 'HERO'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    handleFieldChange('watermark', w);
                  }}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-mono transition cursor-pointer ${
                    config.watermark === w
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Download PNG & Print */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playShutterSound();
              onDownload();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              onPrint();
            }}
            className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Utility to generate high-resolution PNG export of the Passport */
export async function downloadPassportPng(config: PassportConfig) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = PASSPORT_THEMES[config.themeId] || PASSPORT_THEMES.emerald;

  // 1. Background Ticket Shape
  ctx.fillStyle = theme.colorBack;
  ctx.fillRect(0, 0, 1200, 600);

  // 2. High-Tech Dither Pattern Overlay
  const grad = ctx.createLinearGradient(0, 0, 1200, 600);
  grad.addColorStop(0, theme.colorFront + '33');
  grad.addColorStop(0.5, theme.colorHighlight + '22');
  grad.addColorStop(1, theme.colorFront + '44');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 600);

  // 3. Perforated Stub Divider
  ctx.strokeStyle = '#ffffff33';
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(960, 0);
  ctx.lineTo(960, 600);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Large Watermark
  ctx.font = 'bold 180px -apple-system, sans-serif';
  ctx.fillStyle = theme.watermarkColor + '18';
  ctx.textAlign = 'center';
  ctx.fillText(config.watermark || '2026', 480, 360);

  // 5. Header / Presenter
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = theme.colorFront;
  ctx.textAlign = 'left';
  ctx.fillText('ECOQUEST // GAIA PROTOCOL', 70, 75);

  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(config.rank, 70, 120);

  // 6. Explorer Name (Hero)
  ctx.font = '900 78px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText((config.name || 'EXPLORER').toUpperCase(), 70, 310);

  // 7. Footer Provenance
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = theme.colorFront;
  ctx.fillText(`GAIA KNOWLEDGE ARCHIVE · ${config.dates}`, 70, 530);

  // 8. Stub Vertical Text
  ctx.save();
  ctx.translate(1080, 300);
  ctx.rotate(Math.PI / 2);
  ctx.font = '900 48px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(config.stubText || 'ADMIT ONE // LEVEL 01', 0, 0);
  ctx.restore();

  // 9. Trigger instant PNG Download
  const link = document.createElement('a');
  link.download = `ecoquest_passport_${config.name.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'explorer'}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
