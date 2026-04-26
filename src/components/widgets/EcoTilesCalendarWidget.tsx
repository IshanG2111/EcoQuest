'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Sparkles, TreePine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EcoTilesCalendarWidgetProps {
  onClose?: () => void;
}

interface DayTile {
  id: string;
  dateLabel: string;
  dayNumber: number;
  actions: string[];
  xp: number;
  carbonSavedKg: number;
  predicted?: boolean;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatTileId(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function makeHistoryTile(date: Date, offset: number): DayTile {
  const base = Math.max(0, 4 - (offset % 5));
  const xp = offset % 6 === 0 ? 0 : base * 12 + (offset % 3) * 4;
  const carbon = offset % 6 === 0 ? 0 : Number((base * 0.28 + (offset % 4) * 0.12).toFixed(2));

  const actions: string[] = [];
  if (xp > 0) actions.push('Daily Eco Quest');
  if (carbon >= 0.6) actions.push('Transit Swap');
  if (xp >= 30) actions.push('Waste Sort Mission');

  return {
    id: formatTileId(date),
    dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dayNumber: date.getDate(),
    actions,
    xp,
    carbonSavedKg: carbon,
  };
}

function makePredictedTile(date: Date, forecastImpact: number): DayTile {
  const xp = Math.max(8, Math.round(forecastImpact * 16));
  const carbon = Number(Math.max(0.25, forecastImpact * 0.18).toFixed(2));
  return {
    id: formatTileId(date),
    dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dayNumber: date.getDate(),
    actions: ['Predicted Quest Outcome'],
    xp,
    carbonSavedKg: carbon,
    predicted: true,
  };
}

function tileIntensity(tile: DayTile): number {
  const weighted = tile.xp * 0.03 + tile.carbonSavedKg * 2.2;
  return Math.min(4, Math.max(0, Math.round(weighted)));
}

function intensityClass(level: number): string {
  switch (level) {
    case 0:
      return 'bg-zinc-900/80 border-zinc-700/60 text-zinc-500';
    case 1:
      return 'bg-emerald-950/70 border-emerald-700/40 text-emerald-300';
    case 2:
      return 'bg-emerald-900/80 border-emerald-500/50 text-emerald-200';
    case 3:
      return 'bg-teal-800/80 border-teal-400/60 text-teal-100';
    default:
      return 'bg-lime-600/85 border-lime-300/80 text-zinc-950';
  }
}

export function EcoTilesCalendarWidget({ onClose }: EcoTilesCalendarWidgetProps) {
  const initialTiles = useMemo(() => {
    const today = new Date();
    const history: DayTile[] = [];

    for (let i = 34; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      history.push(makeHistoryTile(date, i));
    }

    const activeHistory = history.filter((tile) => tile.xp > 0 || tile.carbonSavedKg > 0);
    const avgImpact = activeHistory.length > 0
      ? activeHistory.reduce((sum, tile) => sum + tile.carbonSavedKg, 0) / activeHistory.length
      : 0.4;

    const forecast: DayTile[] = [];
    for (let i = 1; i <= 7; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      forecast.push(makePredictedTile(date, avgImpact + i * 0.05));
    }

    return [...history, ...forecast];
  }, []);

  const [tiles, setTiles] = useState<DayTile[]>(initialTiles);
  const [selectedId, setSelectedId] = useState(initialTiles[34]?.id ?? initialTiles[0]?.id ?? '');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [isPlayback, setIsPlayback] = useState(false);

  const selectedTile = tiles.find((tile) => tile.id === selectedId) ?? tiles[0];
  const hoveredTile = tiles.find((tile) => tile.id === hoveredId) ?? null;

  const streakIds = useMemo(() => {
    const ids: string[] = [];
    for (let i = 34; i >= 0; i -= 1) {
      const tile = tiles[i];
      if (!tile || tile.predicted) {
        continue;
      }
      if (tile.xp > 0 || tile.carbonSavedKg > 0) {
        ids.push(tile.id);
      } else {
        break;
      }
    }
    return new Set(ids);
  }, [tiles]);

  const totalXp = useMemo(() => tiles.reduce((sum, tile) => sum + tile.xp, 0), [tiles]);
  const totalCarbon = useMemo(
    () => Number(tiles.reduce((sum, tile) => sum + tile.carbonSavedKg, 0).toFixed(2)),
    [tiles]
  );

  useEffect(() => {
    if (!isPlayback) {
      return;
    }

    const interval = setInterval(() => {
      setPlaybackIndex((prev) => {
        const next = prev + 1;
        if (next >= tiles.length) {
          setIsPlayback(false);
          return 0;
        }
        return next;
      });
    }, 260);

    return () => clearInterval(interval);
  }, [isPlayback, tiles.length]);

  function quickAdd(actionName: string, xpDelta: number, carbonDelta: number) {
    if (!selectedTile || selectedTile.predicted) {
      return;
    }

    setTiles((prev) =>
      prev.map((tile) => {
        if (tile.id !== selectedTile.id) {
          return tile;
        }

        return {
          ...tile,
          actions: [actionName, ...tile.actions],
          xp: tile.xp + xpDelta,
          carbonSavedKg: Number((tile.carbonSavedKg + carbonDelta).toFixed(2)),
        };
      })
    );
  }

  return (
    <div className="w-[300px] rounded-lg border-2 border-primary/35 bg-card/95 shadow-xl shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between border-b border-primary/20 bg-black/35 px-2.5 py-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="font-headline text-[10px] uppercase tracking-[0.14em] text-primary">Eco Tiles Calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[9px] font-headline uppercase tracking-[0.1em]"
            onClick={() => setIsPlayback((prev) => !prev)}
          >
            {isPlayback ? 'Pause' : 'Playback'}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Close Eco Tiles Calendar"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-h-[460px] space-y-3 overflow-y-auto p-2.5">
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-md border border-primary/20 bg-black/25 p-2">
            <p className="font-mono uppercase text-muted-foreground">Total XP</p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-code text-lg leading-none text-primary">
              {totalXp}
            </p>
          </div>
          <div className="rounded-md border border-primary/20 bg-black/25 p-2">
            <p className="font-mono uppercase text-muted-foreground">Carbon Saved</p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-code text-lg leading-none text-emerald-300">
              {totalCarbon}kg
            </p>
          </div>
          <div className="col-span-2 rounded-md border border-primary/20 bg-black/25 p-2">
            <p className="font-mono uppercase text-muted-foreground">Streak Path</p>
            <p className="overflow-hidden text-ellipsis whitespace-nowrap font-code text-lg leading-none text-amber-300">
              {streakIds.size}d
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-7 gap-1">
            {tiles.map((tile, index) => {
              const level = tileIntensity(tile);
              const isSelected = selectedTile?.id === tile.id;
              const inStreak = streakIds.has(tile.id);
              const isPlaybackTile = isPlayback && playbackIndex === index;

              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => setSelectedId(tile.id)}
                  onMouseEnter={() => setHoveredId(tile.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={`${tile.dateLabel} | XP ${tile.xp} | Carbon ${tile.carbonSavedKg}kg`}
                  className={[
                    'group relative h-9 rounded-md border text-[9px] font-bold transition',
                    intensityClass(level),
                    isSelected ? 'ring-2 ring-primary' : 'ring-0',
                    inStreak ? 'shadow-[inset_0_-3px_0_rgba(245,158,11,0.9)]' : '',
                    tile.predicted ? 'border-dashed opacity-80' : '',
                    isPlaybackTile ? 'scale-105 ring-2 ring-emerald-300' : '',
                  ].join(' ')}
                >
                  <span className="absolute left-1 top-1 font-mono">{tile.dayNumber}</span>
                  {tile.predicted ? (
                    <Sparkles className="absolute bottom-1 right-1 h-2.5 w-2.5" />
                  ) : (
                    <TreePine className="absolute bottom-1 right-1 h-2.5 w-2.5 opacity-70" />
                  )}
                </button>
              );
            })}
          </div>

          {hoveredTile && (
            <div className="pointer-events-none absolute -top-9 left-0 rounded-md border border-primary/35 bg-background/95 px-2 py-1 text-[9px] font-mono text-primary shadow-lg">
              {hoveredTile.dateLabel}: {hoveredTile.xp} XP, {hoveredTile.carbonSavedKg}kg CO2
            </div>
          )}
        </div>

        {selectedTile && (
          <div className="rounded-md border border-primary/20 bg-black/20 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-headline text-[10px] uppercase tracking-[0.12em] text-primary">{selectedTile.dateLabel}</p>
              {selectedTile.predicted && (
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-300">Predicted Tile</p>
              )}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-[11px]">
              <p className="rounded border border-primary/15 bg-black/25 px-2 py-1">XP: {selectedTile.xp}</p>
              <p className="rounded border border-primary/15 bg-black/25 px-2 py-1">Carbon: {selectedTile.carbonSavedKg}kg</p>
            </div>

            <div className="mb-3 space-y-1 text-[11px]">
              <p className="font-mono uppercase text-muted-foreground">Actions</p>
              {selectedTile.actions.length === 0 ? (
                <p className="text-muted-foreground">No activity logged.</p>
              ) : (
                <ul className="space-y-1">
                  {selectedTile.actions.slice(0, 3).map((action, idx) => (
                    <li key={`${action}-${idx}`} className="rounded border border-primary/15 bg-black/25 px-2 py-1">
                      {action}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                className="h-8 text-[9px] font-headline uppercase tracking-[0.06em]"
                disabled={selectedTile.predicted}
                onClick={() => quickAdd('Bike Commute', 12, 0.7)}
              >
                <Plus className="mr-1 h-3 w-3" /> Ride
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-[9px] font-headline uppercase tracking-[0.06em]"
                disabled={selectedTile.predicted}
                onClick={() => quickAdd('Recycling Combo', 10, 0.45)}
              >
                <Plus className="mr-1 h-3 w-3" /> Recycle
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-[9px] font-headline uppercase tracking-[0.06em]"
                disabled={selectedTile.predicted}
                onClick={() => quickAdd('Energy Saver Quest', 15, 0.9)}
              >
                <Plus className="mr-1 h-3 w-3" /> Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}