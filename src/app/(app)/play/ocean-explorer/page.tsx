'use client';

import { useEffect, useMemo, useState } from 'react';
import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { Fish, ShieldCheck, Thermometer, Waves } from 'lucide-react';

type Phase = 'home' | 'rules' | 'playing' | 'result';
type CoralState = 'healthy' | 'bleached' | 'dead';

interface CoralCell {
  id: number;
  state: CoralState;
}

const GRID_SIZE = 12;
const GAME_SECONDS = 65;

const toolConfig = {
  antidote: { cost: 12, heal: 12, label: 'Antidote' },
  cool: { cost: 20, heal: 20, label: 'Cool Water' },
  restore: { cost: 35, heal: 35, label: 'Restore Coral' },
} as const;

type Tool = keyof typeof toolConfig;

function createReef(): CoralCell[] {
  return Array.from({ length: GRID_SIZE }).map((_, index) => {
    const roll = Math.random();
    const state: CoralState = roll > 0.55 ? 'healthy' : roll > 0.25 ? 'bleached' : 'dead';
    return { id: index, state };
  });
}

export default function OceanExplorerPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [cells, setCells] = useState<CoralCell[]>(createReef);
  const [score, setScore] = useState(0);
  const [coralPoints, setCoralPoints] = useState(45);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [tool, setTool] = useState<Tool>('antidote');
  const [message, setMessage] = useState('Neutralize reef stress and restore bleached coral zones.');

  const healthy = useMemo(() => cells.filter((cell) => cell.state === 'healthy').length, [cells]);
  const reefHealth = Math.round((healthy / GRID_SIZE) * 100);

  useGameSessionTracker({
    gameSlug: 'ocean-explorer',
    isPlaying: phase === 'playing',
    isFinished: phase === 'result',
    score,
    metadata: { reefHealth, healthyCorals: healthy, coralPoints },
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
      setCoralPoints((prev) => Math.min(250, prev + 4));
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const stressTicker = setInterval(() => {
      setCells((prev) => {
        const next = [...prev];
        const healthyIndices = next
          .map((cell, index) => (cell.state === 'healthy' ? index : -1))
          .filter((index) => index >= 0);

        if (healthyIndices.length === 0) {
          return next;
        }

        const target = healthyIndices[Math.floor(Math.random() * healthyIndices.length)];
        next[target] = { ...next[target], state: 'bleached' };
        return next;
      });
      setMessage('Thermal spike detected. One healthy coral bleached.');
    }, 3600);

    const collapseTicker = setInterval(() => {
      setCells((prev) =>
        prev.map((cell) => {
          if (cell.state === 'bleached' && Math.random() < 0.22) {
            return { ...cell, state: 'dead' };
          }
          return cell;
        })
      );
    }, 2200);

    return () => {
      clearInterval(stressTicker);
      clearInterval(collapseTicker);
    };
  }, [phase]);

  function startGame() {
    setCells(createReef());
    setScore(0);
    setCoralPoints(45);
    setTimeLeft(GAME_SECONDS);
    setTool('antidote');
    setMessage('Neutralize reef stress and restore bleached coral zones.');
    setPhase('playing');
  }

  function healCell(target: CoralCell) {
    if (phase !== 'playing' || target.state === 'healthy') {
      return;
    }

    if (target.state === 'dead' && tool !== 'restore') {
      setMessage('Dead coral requires Restore Coral tool.');
      return;
    }

    const currentTool = toolConfig[tool];
    if (coralPoints < currentTool.cost) {
      setMessage('Not enough coral points for this intervention.');
      return;
    }

    setCoralPoints((prev) => prev - currentTool.cost);
    setCells((prev) => prev.map((cell) => (cell.id === target.id ? { ...cell, state: 'healthy' } : cell)));
    setScore((prev) => prev + currentTool.heal * 6);
    setMessage(`${currentTool.label} deployed successfully.`);
  }

  const summary = useMemo(() => {
    if (reefHealth >= 75) return 'Reef resilience restored. Marine biodiversity can rebound.';
    if (reefHealth >= 45) return 'Reef stabilized but vulnerable. Continue targeted restoration.';
    return 'Reef remains in critical condition. Prioritize faster interventions next run.';
  }, [reefHealth]);

  return (
    <Desktop>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-6">
        {phase === 'home' && (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-cyan-950/20">
            <CardHeader>
              <CardTitle className="text-4xl font-headline uppercase tracking-widest text-primary">Reef Rescue</CardTitle>
              <CardDescription>Rebuild coral health while managing heat stress and collapse risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="rounded-lg border border-primary/20 bg-background/40 p-4 text-sm text-muted-foreground">
                Restore bleached coral, spend points wisely, and prevent reef collapse before time runs out.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setPhase('rules')}>Mission Rules</Button>
                <Button variant="outline" onClick={startGame}>Dive In</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'rules' && (
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="font-headline uppercase tracking-wide">Reef Operations</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Heat stress continuously bleaches healthy coral.</p>
              <p>2. Bleached coral can become dead if untreated.</p>
              <p>3. Use tools based on severity and point cost.</p>
              <p>4. Health and score improve by restoring cells to healthy state.</p>
              <div className="flex gap-3 pt-2">
                <Button onClick={startGame}>Start Dive</Button>
                <Button variant="ghost" onClick={() => setPhase('home')}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'playing' && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Score</p><p className="text-2xl font-bold text-primary">{score}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Coral Points</p><p className="text-2xl font-bold text-amber-500">{coralPoints}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Time</p><p className="text-2xl font-bold">{timeLeft}s</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Healthy Coral</p><p className="text-2xl font-bold text-emerald-500">{healthy}/{GRID_SIZE}</p></CardContent></Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline uppercase tracking-wide">
                  <Waves className="h-5 w-5 text-primary" /> Reef Grid
                </CardTitle>
                <CardDescription>{message}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={reefHealth} indicatorClassName={reefHealth > 50 ? 'bg-emerald-500' : 'bg-rose-500'} />
                <div className="grid grid-cols-4 gap-2">
                  {cells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => healCell(cell)}
                      type="button"
                      className={[
                        'flex h-[15vh] max-h-[120px] aspect-square items-center justify-center rounded-md border text-xl transition bg-zinc-900/50 hover:bg-zinc-800',
                        cell.state === 'healthy' && 'border-emerald-500/30 bg-emerald-500/15',
                        cell.state === 'bleached' && 'border-amber-500/40 bg-amber-500/15',
                        cell.state === 'dead' && 'border-zinc-700 bg-zinc-900/60',
                      ].join(' ')}
                    >
                      {cell.state === 'healthy' ? '🪸' : cell.state === 'bleached' ? '⚪' : '☠️'}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button variant={tool === 'antidote' ? 'default' : 'outline'} onClick={() => setTool('antidote')}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Antidote (12)
                  </Button>
                  <Button variant={tool === 'cool' ? 'default' : 'outline'} onClick={() => setTool('cool')}>
                    <Thermometer className="mr-2 h-4 w-4" /> Cool Water (20)
                  </Button>
                  <Button variant={tool === 'restore' ? 'default' : 'outline'} onClick={() => setTool('restore')}>
                    <Fish className="mr-2 h-4 w-4" /> Restore (35)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'result' && (
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="text-3xl font-headline uppercase tracking-wide text-primary">Mission Complete</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-6xl font-black text-primary">{score}</p>
              <p className="text-sm text-muted-foreground">Final reef health: {reefHealth}%.</p>
              <p className="text-sm text-muted-foreground">{summary}</p>
              <div className="flex gap-3">
                <Button onClick={startGame}>Dive Again</Button>
                <Button variant="outline" onClick={() => setPhase('home')}>Back to Briefing</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Desktop>
  );
}
