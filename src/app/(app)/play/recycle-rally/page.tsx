'use client';

import { useEffect, useMemo, useState } from 'react';
import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { Recycle, Timer, Trash2, Trophy } from 'lucide-react';
import { GameBriefingShell } from '@/components/game-briefing-shell';

type Phase = 'home' | 'rules' | 'playing' | 'result';
type Bin = 'recycle' | 'compost' | 'landfill' | 'hazard';

type FallingItem = {
  emoji: string;
  name: string;
  bin: Bin;
};

const ITEMS: FallingItem[] = [
  { emoji: '📰', name: 'Newspaper', bin: 'recycle' },
  { emoji: '🍶', name: 'Glass Bottle', bin: 'recycle' },
  { emoji: '🍌', name: 'Banana Peel', bin: 'compost' },
  { emoji: '☕', name: 'Coffee Grounds', bin: 'compost' },
  { emoji: '🧻', name: 'Used Tissue', bin: 'landfill' },
  { emoji: '🧸', name: 'Broken Toy', bin: 'landfill' },
  { emoji: '🔋', name: 'Battery', bin: 'hazard' },
  { emoji: '💡', name: 'CFL Bulb', bin: 'hazard' },
];

const ROUND_TIME = 65;

export default function RecycleRallyPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [lives, setLives] = useState(3);
  const [sorted, setSorted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [speed, setSpeed] = useState(3000);
  const [item, setItem] = useState<FallingItem | null>(null);
  const [feedback, setFeedback] = useState('Sort the incoming waste item into the correct bin.');

  const accuracy = useMemo(() => {
    if (sorted === 0) return 0;
    return Math.round((correct / sorted) * 100);
  }, [correct, sorted]);

  useGameSessionTracker({
    gameSlug: 'recycle-rally',
    isPlaying: phase === 'playing',
    isFinished: phase === 'result',
    score,
    metadata: { sorted, accuracy, lives },
  });

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    if (timeLeft <= 0 || lives <= 0) {
      setPhase('result');
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, lives]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }

    const spawn = setInterval(() => {
      setItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    }, speed);

    return () => clearInterval(spawn);
  }, [phase, speed]);

  useEffect(() => {
    if (phase !== 'playing' || !item) {
      return;
    }

    const timeout = setTimeout(() => {
      setLives((prev) => prev - 1);
      setSorted((prev) => prev + 1);
      setFeedback('Missed item. Contamination risk increased.');
      setItem(null);
    }, Math.max(900, speed - 400));

    return () => clearTimeout(timeout);
  }, [phase, item, speed]);

  function startGame() {
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setLives(3);
    setSorted(0);
    setCorrect(0);
    setSpeed(3000);
    setItem(null);
    setFeedback('Sort the incoming waste item into the correct bin.');
    setPhase('playing');
  }

  function choose(bin: Bin) {
    if (phase !== 'playing' || !item) {
      return;
    }

    setSorted((prev) => prev + 1);
    if (item.bin === bin) {
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 100 + Math.max(0, 3200 - speed) / 20);
      setFeedback(`Correct sort: ${item.name}.`);
      if ((sorted + 1) % 5 === 0) {
        setSpeed((prev) => Math.max(1400, prev - 250));
      }
    } else {
      setLives((prev) => prev - 1);
      setFeedback(`Wrong bin. ${item.name} belongs in ${item.bin}.`);
    }
    setItem(null);
  }

  const outcome = useMemo(() => {
    if (accuracy >= 85) return 'Excellent sorting discipline. Material recovery remained high.';
    if (accuracy >= 60) return 'Good baseline sorting. Improve contamination control for better outcomes.';
    return 'Sorting errors were costly. Re-run the drill and improve bin decisions.';
  }, [accuracy]);

  if (phase === 'home' || phase === 'rules') {
    return (
      <Desktop>
        <GameBriefingShell
          phase={phase}
          title="Waste Wizard"
          subtitle="Fast recycling triage under rising processing pressure."
          videoSrc="/videos/games/recycle-rally.mp4"
          rulesTitle="Sorting Protocol"
          rules={[
            'One waste item appears at a time in the sorter lane.',
            'Select a bin before item timeout to avoid a life penalty.',
            'Wrong bin choices also cost one life.',
            'Every 5 sorted items increases processing speed.',
          ]}
          openLabel="Rules"
          startLabel="Begin Shift"
          onOpenRules={() => setPhase('rules')}
          onStart={startGame}
        />
      </Desktop>
    );
  }

  return (
    <Desktop>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-6">
        {phase === 'playing' && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Score</p><p className="text-2xl font-bold text-primary">{Math.round(score)}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Lives</p><p className="text-2xl font-bold text-rose-500">{'❤️'.repeat(Math.max(0, lives)) || '0'}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Time</p><p className="flex items-center gap-2 text-2xl font-bold text-amber-500"><Timer className="h-5 w-5" />{timeLeft}s</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Accuracy</p><p className="text-2xl font-bold text-emerald-500">{accuracy}%</p></CardContent></Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline uppercase tracking-wide"><Recycle className="h-5 w-5 text-primary" /> Sorting Lane</CardTitle>
                <CardDescription>{feedback}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex min-h-32 items-center justify-center rounded-lg border border-primary/20 bg-background/40 text-center">
                  {item ? (
                    <div>
                      <p className="text-6xl">{item.emoji}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Waiting for next waste item...</p>
                  )}
                </div>
                <Progress value={(timeLeft / ROUND_TIME) * 100} indicatorClassName="bg-primary" />
                <div className="grid gap-3 md:grid-cols-4">
                  <Button variant="outline" onClick={() => choose('recycle')}><Recycle className="mr-2 h-4 w-4" /> Recycle</Button>
                  <Button variant="outline" onClick={() => choose('compost')}>🌱 Compost</Button>
                  <Button variant="outline" onClick={() => choose('landfill')}><Trash2 className="mr-2 h-4 w-4" /> Landfill</Button>
                  <Button variant="outline" onClick={() => choose('hazard')}>☢️ Hazard</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'result' && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl font-headline uppercase tracking-wide text-primary">
                <Trophy className="h-7 w-7" /> Shift Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-6xl font-black text-primary">{Math.round(score)}</p>
              <p className="text-sm text-muted-foreground">Sorted: {sorted} items | Accuracy: {accuracy}%</p>
              <p className="text-sm text-muted-foreground">{outcome}</p>
              <div className="flex gap-3">
                <Button onClick={startGame}>Play Again</Button>
                <Button variant="outline" onClick={() => setPhase('home')}>Back to Briefing</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Desktop>
  );
}
