'use client';

import { useEffect, useMemo, useState } from 'react';
import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { AlertTriangle, Droplets, Flame, Shield, Sprout, Trees } from 'lucide-react';
import { GameBriefingShell } from '@/components/game-briefing-shell';

type Phase = 'home' | 'rules' | 'playing' | 'result';
type Tool = 'defend' | 'plant' | 'water' | 'extinguish';
type ThreatType = 'log' | 'fire' | 'pest' | 'storm' | 'dev';
type CellState = 'healthy' | 'threatened' | 'fire' | 'felled';

interface Cell {
  id: number;
  tree: string;
  state: CellState;
  threatType: ThreatType | null;
  decayAt: number | null;
}

interface Threat {
  name: string;
  description: string;
  type: ThreatType;
  durationMs: number;
}

const TREE_TYPES = ['🌲', '🌳', '🎋', '🌴', '🌿', '🍃'];
const THREATS: Threat[] = [
  {
    name: 'Loggers Incoming',
    description: 'Defend threatened trees before they are cut down.',
    type: 'log',
    durationMs: 5000,
  },
  {
    name: 'Wildfire Spreading',
    description: 'Use Extinguish on burning trees immediately.',
    type: 'fire',
    durationMs: 4000,
  },
  {
    name: 'Invasive Pest Bloom',
    description: 'Water stressed trees to clear pest pressure.',
    type: 'pest',
    durationMs: 5000,
  },
  {
    name: 'Storm Cell Overhead',
    description: 'Defend vulnerable trees before structural damage occurs.',
    type: 'storm',
    durationMs: 5000,
  },
  {
    name: 'Development Encroachment',
    description: 'Stabilize the border by defending threatened canopy cells.',
    type: 'dev',
    durationMs: 5000,
  },
];

const GRID_SIZE = 24;
const GRID_COLUMNS = 8;
const GAME_SECONDS = 90;
const STARTING_SEEDS = 20;
const THREAT_INTERVAL_MS = 6000;
const SEED_GAIN_INTERVAL_MS = 4000;

function createInitialForest(): Cell[] {
  return Array.from({ length: GRID_SIZE }).map((_, index) => ({
    id: index,
    tree: TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)],
    state: Math.random() < 0.2 ? 'felled' : 'healthy',
    threatType: null,
    decayAt: null,
  }));
}

export default function ForestGuardianPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [cells, setCells] = useState<Cell[]>(createInitialForest);
  const [score, setScore] = useState(0);
  const [seeds, setSeeds] = useState(STARTING_SEEDS);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [activeTool, setActiveTool] = useState<Tool>('defend');
  const [eventText, setEventText] = useState('Watch for threats. Defend trees and restore felled zones.');

  const healthyCount = useMemo(() => cells.filter((cell) => cell.state === 'healthy').length, [cells]);
  const standingCount = useMemo(() => cells.filter((cell) => cell.state !== 'felled').length, [cells]);
  const forestHealth = Math.round((healthyCount / GRID_SIZE) * 100);

  useGameSessionTracker({
    gameSlug: 'forest-guardian',
    isPlaying: phase === 'playing',
    isFinished: phase === 'result',
    score,
    metadata: { healthyCount, standingCount, forestHealth, seeds },
  });

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    if (timeLeft <= 0) {
      setPhase('result');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
      setScore((prev) => prev + healthyCount);

      const now = Date.now();
      let collapsed = 0;
      setCells((prev) =>
        prev.map((cell) => {
          if (
            (cell.state === 'threatened' || cell.state === 'fire') &&
            cell.decayAt !== null &&
            now >= cell.decayAt
          ) {
            collapsed += 1;
            return {
              ...cell,
              state: 'felled',
              threatType: null,
              decayAt: null,
            };
          }
          return cell;
        })
      );

      if (collapsed > 0) {
        setEventText(`${collapsed} tree${collapsed > 1 ? 's were' : ' was'} lost. Stabilize threats faster.`);
        setScore((prev) => Math.max(0, prev - collapsed * 20));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft, healthyCount]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const threatTicker = setInterval(() => {
      const threat = THREATS[Math.floor(Math.random() * THREATS.length)];
      const now = Date.now();

      setCells((prev) => {
        const next = [...prev];
        const healthyIndexes = next
          .map((cell, idx) => (cell.state === 'healthy' ? idx : -1))
          .filter((idx) => idx >= 0);

        if (healthyIndexes.length === 0) {
          return next;
        }

        const affected = Math.min(4, healthyIndexes.length);
        for (let i = 0; i < affected; i += 1) {
          const pick = healthyIndexes[Math.floor(Math.random() * healthyIndexes.length)];
          next[pick] = {
            ...next[pick],
            state: threat.type === 'fire' ? 'fire' : 'threatened',
            threatType: threat.type,
            decayAt: now + threat.durationMs,
          };
        }

        return next;
      });
      setEventText(`${threat.name}: ${threat.description}`);
    }, THREAT_INTERVAL_MS);

    const seedTicker = setInterval(() => {
      setSeeds((prev) => Math.min(50, prev + 1));
    }, SEED_GAIN_INTERVAL_MS);

    return () => {
      clearInterval(threatTicker);
      clearInterval(seedTicker);
    };
  }, [phase]);

  function startGame() {
    setCells(createInitialForest());
    setScore(0);
    setSeeds(STARTING_SEEDS);
    setTimeLeft(GAME_SECONDS);
    setActiveTool('defend');
    setEventText('The forest is calm. Watch for threats and protect biodiversity.');
    setPhase('playing');
  }

  function actOnCell(cell: Cell) {
    if (phase !== 'playing') {
      return;
    }

    if (activeTool === 'defend') {
      if (cell.state === 'threatened') {
        setCells((prev) =>
          prev.map((item) =>
            item.id === cell.id
              ? { ...item, state: 'healthy', threatType: null, decayAt: null }
              : item
          )
        );
        setScore((prev) => prev + 80);
        setEventText('Threat neutralized with rapid defense.');
      }
      return;
    }

    if (activeTool === 'plant') {
      if (cell.state === 'felled' && seeds >= 3) {
        setSeeds((prev) => prev - 3);
        setCells((prev) =>
          prev.map((item) =>
            item.id === cell.id
              ? {
                  ...item,
                  tree: TREE_TYPES[Math.floor(Math.random() * TREE_TYPES.length)],
                  state: 'healthy',
                  threatType: null,
                  decayAt: null,
                }
              : item
          )
        );
        setScore((prev) => prev + 50);
        setEventText('Sapling planted. Canopy recovery in progress.');
      } else if (cell.state === 'felled' && seeds < 3) {
        setEventText('Not enough seeds for planting. Wait for seed regeneration.');
      }
      return;
    }

    if (activeTool === 'water') {
      if (cell.state === 'threatened') {
        if (seeds < 2) {
          setEventText('Need 2 seeds to deploy water treatment.');
          return;
        }

        setSeeds((prev) => prev - 2);
        setCells((prev) =>
          prev.map((item) =>
            item.id === cell.id
              ? { ...item, state: 'healthy', threatType: null, decayAt: null }
              : item
          )
        );
        setScore((prev) => prev + 60);
        setEventText('Water intervention successful. Stress reduced.');
      }
      return;
    }

    if (activeTool === 'extinguish') {
      if (cell.state === 'fire') {
        if (seeds < 5) {
          setEventText('Need 5 seeds to activate fire suppression.');
          return;
        }

        setSeeds((prev) => prev - 5);
        setCells((prev) =>
          prev.map((item) =>
            item.id === cell.id
              ? { ...item, state: 'healthy', threatType: null, decayAt: null }
              : item
          )
        );
        setScore((prev) => prev + 120);
        setEventText('Fire suppressed. Immediate canopy damage prevented.');
      }
    }
  }

  const summary = useMemo(() => {
    if (forestHealth >= 75) return 'Forest recovered. Habitat corridors are functioning.';
    if (forestHealth >= 45) return 'Partial recovery achieved. More intervention required.';
    return 'Canopy collapse risk remains high. Try a faster defense cycle.';
  }, [forestHealth]);

  if (phase === 'home' || phase === 'rules') {
    return (
      <Desktop>
        <GameBriefingShell
          phase={phase}
          title="Forest Defender"
          subtitle="Protect a living biome under pressure from logging, wildfire, invasive pests, and development."
          videoSrc="/videos/games/forest-guardian.mp4"
          rulesTitle="Mission Rules"
          rules={[
            'A new threat wave appears every few seconds and marks multiple healthy trees.',
            'Threatened and burning trees collapse into felled land if you do not act before the timer expires.',
            'Use Defend for general threats, Water for stressed trees, Extinguish for fire, and Plant to restore felled plots.',
            'Tools consume seeds except Defend. Seeds regenerate over time, so budget them carefully.',
          ]}
          openLabel="Read Rules"
          startLabel="Start Mission"
          onOpenRules={() => setPhase('rules')}
          onStart={startGame}
        />
      </Desktop>
    );
  }

  return (
    <Desktop>
      <div className="mx-auto flex h-full w-full max-6xl flex-col gap-6 p-5 pb-24 md:p-8 md:pb-28">
        {phase === 'playing' && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <Card className="border-primary/20"><CardContent className="p-4 md:p-5"><p className="text-xs uppercase text-muted-foreground md:text-sm">Score</p><p className="text-3xl font-bold text-primary">{score}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4 md:p-5"><p className="text-xs uppercase text-muted-foreground md:text-sm">Seeds</p><p className="text-3xl font-bold text-amber-500">{seeds}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4 md:p-5"><p className="text-xs uppercase text-muted-foreground md:text-sm">Time</p><p className="text-3xl font-bold">{timeLeft}s</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4 md:p-5"><p className="text-xs uppercase text-muted-foreground md:text-sm">Standing Trees</p><p className="text-3xl font-bold text-emerald-500">{standingCount}</p></CardContent></Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-center gap-2 text-xl font-headline uppercase tracking-wide md:text-2xl">
                  <Trees className="h-6 w-6 text-primary" /> Canopy Status
                </CardTitle>
                <CardDescription className="text-base md:text-lg">{eventText}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <Progress value={forestHealth} indicatorClassName={forestHealth > 50 ? 'bg-emerald-500' : 'bg-rose-500'} />
                <div className={`grid gap-2 md:gap-3`} style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}>
                  {cells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => actOnCell(cell)}
                      className={[
                        'flex aspect-square items-center justify-center rounded-lg border text-2xl transition md:text-3xl',
                        cell.state === 'healthy' && 'border-emerald-500/35 bg-emerald-500/15',
                        cell.state === 'threatened' && 'animate-pulse border-amber-500/55 bg-amber-500/20',
                        cell.state === 'fire' && 'animate-pulse border-red-500/70 bg-red-500/20',
                        cell.state === 'felled' && 'border-zinc-700 bg-zinc-900/60',
                      ].join(' ')}
                      type="button"
                    >
                      {cell.state === 'healthy' && cell.tree}
                      {cell.state === 'threatened' && '⚠️'}
                      {cell.state === 'fire' && '🔥'}
                      {cell.state === 'felled' && '🪵'}
                    </button>
                  ))}
                </div>

                <div className="rounded-lg border border-primary/20 bg-background/40 p-4">
                  <p className="text-base text-muted-foreground md:text-lg">
                    Forest Health: <span className="font-semibold text-foreground">{forestHealth}%</span> | Healthy Cells: <span className="font-semibold text-foreground">{healthyCount}</span>
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <Button
                    variant={activeTool === 'defend' ? 'default' : 'outline'}
                    onClick={() => setActiveTool('defend')}
                    className="h-14 text-base"
                  >
                    <Shield className="mr-2 h-5 w-5" /> Defend
                  </Button>
                  <Button
                    variant={activeTool === 'plant' ? 'default' : 'outline'}
                    onClick={() => setActiveTool('plant')}
                    className="h-14 text-base"
                  >
                    <Sprout className="mr-2 h-5 w-5" /> Plant (3)
                  </Button>
                  <Button
                    variant={activeTool === 'water' ? 'default' : 'outline'}
                    onClick={() => setActiveTool('water')}
                    className="h-14 text-base"
                  >
                    <Droplets className="mr-2 h-5 w-5" /> Water (2)
                  </Button>
                  <Button
                    variant={activeTool === 'extinguish' ? 'default' : 'outline'}
                    onClick={() => setActiveTool('extinguish')}
                    className="h-14 text-base"
                  >
                    <Flame className="mr-2 h-5 w-5" /> Extinguish (5)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'result' && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl font-headline uppercase tracking-wide text-primary">
                <AlertTriangle className="h-7 w-7" /> Guardian Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-6xl font-black text-primary">{score}</p>
              <p className="text-base text-muted-foreground md:text-lg">Forest health ended at {forestHealth}% with {standingCount} standing trees.</p>
              <p className="text-base text-muted-foreground md:text-lg">{summary}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={startGame} size="lg" className="text-base">Defend Again</Button>
                <Button variant="outline" onClick={() => setPhase('home')} size="lg" className="text-base">Back to Briefing</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Desktop>
  );
}
