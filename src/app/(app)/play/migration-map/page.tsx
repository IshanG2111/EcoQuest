'use client';

import { useEffect, useMemo, useState } from 'react';
import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { Compass, MapPinned, Timer, Trophy } from 'lucide-react';
import { GameBriefingShell } from '@/components/game-briefing-shell';

type Phase = 'home' | 'rules' | 'playing' | 'result';

type Question = {
  animal: string;
  cue: string;
  prompt: string;
  options: string[];
  answer: string;
  insight: string;
};

const TOTAL_ROUNDS = 8;
const ROUND_TIME = 14;

const questions: Question[] = [
  {
    animal: 'Monarch Butterfly',
    cue: 'North American pollinator with long-distance seasonal movement.',
    prompt: 'Primary overwintering destination?',
    options: ['Alaska', 'Central Mexico', 'Iceland', 'Madagascar'],
    answer: 'Central Mexico',
    insight: 'Monarch clusters rely on specific mountain forests that are climate-sensitive.',
  },
  {
    animal: 'Arctic Tern',
    cue: 'Performs one of the longest annual migrations on Earth.',
    prompt: 'Main wintering region?',
    options: ['Mediterranean Sea', 'Antarctic waters', 'Amazon basin', 'North Pacific'],
    answer: 'Antarctic waters',
    insight: 'Arctic terns track polar summers by moving between hemispheres each year.',
  },
  {
    animal: 'Caribou',
    cue: 'Large herds move with vegetation and calving seasons.',
    prompt: 'Typical calving grounds?',
    options: ['Arctic tundra', 'Sahara fringes', 'Balkan wetlands', 'Andes plateau'],
    answer: 'Arctic tundra',
    insight: 'Calving zones are threatened by warming and infrastructure fragmentation.',
  },
  {
    animal: 'Humpback Whale',
    cue: 'Migrates between cold feeding waters and warm breeding grounds.',
    prompt: 'Where are breeding grounds commonly located?',
    options: ['Tropical waters', 'Arctic pack ice', 'Inland rivers', 'Southern deserts'],
    answer: 'Tropical waters',
    insight: 'Whales time breeding in warm waters and feeding near nutrient-rich poles.',
  },
  {
    animal: 'Atlantic Salmon',
    cue: 'Born in rivers, matures at sea, then returns upstream to spawn.',
    prompt: 'Where does it mature?',
    options: ['Open Atlantic Ocean', 'Urban reservoirs', 'Coral lagoons', 'Desert springs'],
    answer: 'Open Atlantic Ocean',
    insight: 'Ocean warming and changing currents affect feeding and survival rates.',
  },
  {
    animal: 'Golden Eagle',
    cue: 'Uses thermal updrafts during migration.',
    prompt: 'What atmospheric factor most helps migration?',
    options: ['Thermal air columns', 'Acid rain systems', 'Dust inversions', 'Night fog banks'],
    answer: 'Thermal air columns',
    insight: 'Thermals reduce energy use in long flights, but changing weather alters routes.',
  },
  {
    animal: 'Sea Turtle',
    cue: 'Navigates huge distances using geomagnetic cues.',
    prompt: 'What do many adults return to?',
    options: ['Their birth beach', 'Nearest reef only', 'Deep trenches', 'Random coastlines'],
    answer: 'Their birth beach',
    insight: 'Beach temperature changes influence hatchling sex ratios and survival.',
  },
  {
    animal: 'Elephant Herd',
    cue: 'Follows rainfall and vegetation corridors.',
    prompt: 'Primary migration driver?',
    options: ['Rainfall patterns', 'Moon phase', 'Salt storms', 'Tidal cycle'],
    answer: 'Rainfall patterns',
    insight: 'Rain variability and fencing can break multi-generational migration paths.',
  },
];

export default function MigrationMapPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('Select the best destination or migration factor.');

  const question = questions[roundIndex];

  useGameSessionTracker({
    gameSlug: 'migration-map',
    isPlaying: phase === 'playing',
    isFinished: phase === 'result',
    score,
    metadata: { correct, roundsCompleted: roundIndex },
  });

  useEffect(() => {
    if (phase !== 'playing' || locked) {
      return;
    }

    if (timeLeft <= 0) {
      setLocked(true);
      setFeedback('Timeout. Route confidence dropped.');
      const timeout = setTimeout(nextRound, 1200);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, locked, timeLeft]);

  function startGame() {
    setRoundIndex(0);
    setScore(0);
    setCorrect(0);
    setTimeLeft(ROUND_TIME);
    setLocked(false);
    setFeedback('Select the best destination or migration factor.');
    setPhase('playing');
  }

  function nextRound() {
    setLocked(false);
    setTimeLeft(ROUND_TIME);
    setFeedback('Select the best destination or migration factor.');
    setRoundIndex((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_ROUNDS) {
        setPhase('result');
        return prev;
      }
      return next;
    });
  }

  function choose(option: string) {
    if (phase !== 'playing' || locked) {
      return;
    }

    setLocked(true);
    const isRight = option === question.answer;
    if (isRight) {
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + Math.max(80, timeLeft * 16));
      setFeedback(`Correct. ${question.insight}`);
    } else {
      setFeedback(`Not quite. ${question.insight}`);
    }

    setTimeout(nextRound, 1400);
  }

  const completion = Math.round((roundIndex / TOTAL_ROUNDS) * 100);

  const outcome = useMemo(() => {
    if (correct >= 7) return 'Outstanding expedition log. You mapped migration dynamics with precision.';
    if (correct >= 4) return 'Solid map literacy. Keep refining ecological route awareness.';
    return 'Expedition incomplete. Review species cues and route logic for a stronger run.';
  }, [correct]);

  if (phase === 'home' || phase === 'rules') {
    return (
      <Desktop>
        <GameBriefingShell
          phase={phase}
          title="Migration Map"
          subtitle="Trace climate-sensitive wildlife routes across global habitats."
          videoSrc="/videos/games/migration.mp4"
          rulesTitle="Field Protocol"
          rules={[
            'Each round shows an animal profile and migration cue.',
            'Choose the most accurate destination or migration driver.',
            'Faster correct answers yield higher score.',
            'Final report summarizes route accuracy and eco-impact literacy.',
          ]}
          openLabel="Read Field Notes"
          startLabel="Deploy"
          onOpenRules={() => setPhase('rules')}
          onStart={startGame}
        />
      </Desktop>
    );
  }

  return (
    <Desktop>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-6">
        {phase === 'home' && (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-orange-950/20">
            <CardHeader>
              <CardTitle className="text-4xl font-headline uppercase tracking-widest text-primary">Migration Map</CardTitle>
              <CardDescription>Trace climate-sensitive wildlife routes across global habitats.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="rounded-lg border border-primary/20 bg-background/40 p-4 text-sm text-muted-foreground">
                Answer 8 field questions using species cues. Speed and accuracy determine expedition score.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => setPhase('rules')}>Read Field Notes</Button>
                <Button variant="outline" onClick={startGame}>Begin Expedition</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'rules' && (
          <Card className="border-primary/30">
            <CardHeader><CardTitle className="font-headline uppercase tracking-wide">Field Protocol</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Each round shows an animal profile and migration cue.</p>
              <p>2. Choose the most accurate destination or migration driver.</p>
              <p>3. Faster correct answers yield higher score.</p>
              <p>4. Final report summarizes route accuracy and eco-impact literacy.</p>
              <div className="flex gap-3 pt-2">
                <Button onClick={startGame}>Deploy</Button>
                <Button variant="ghost" onClick={() => setPhase('home')}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'playing' && question && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Score</p><p className="text-2xl font-bold text-primary">{score}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Round</p><p className="text-2xl font-bold">{roundIndex + 1}/{TOTAL_ROUNDS}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Correct</p><p className="text-2xl font-bold text-emerald-500">{correct}</p></CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-4"><p className="text-xs uppercase text-muted-foreground">Timer</p><p className="flex items-center gap-2 text-2xl font-bold text-amber-500"><Timer className="h-5 w-5" />{timeLeft}s</p></CardContent></Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline uppercase tracking-wide">
                  <Compass className="h-5 w-5 text-primary" /> {question.animal}
                </CardTitle>
                <CardDescription>{question.cue}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base font-medium">{question.prompt}</p>
                <p className="text-sm text-muted-foreground">{feedback}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      className="h-auto min-h-16 whitespace-normal justify-start p-4 text-left"
                      onClick={() => choose(option)}
                      disabled={locked}
                    >
                      <MapPinned className="mr-2 h-4 w-4" /> {option}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Expedition Completion</p>
                <Progress value={completion} />
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'result' && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl font-headline uppercase tracking-wide text-primary">
                <Trophy className="h-7 w-7" /> Expedition Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-6xl font-black text-primary">{score}</p>
              <p className="text-sm text-muted-foreground">Accuracy: {correct}/{TOTAL_ROUNDS}</p>
              <p className="text-sm text-muted-foreground">{outcome}</p>
              <div className="flex gap-3">
                <Button onClick={startGame}>Run New Expedition</Button>
                <Button variant="outline" onClick={() => setPhase('home')}>Back to Briefing</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Desktop>
  );
}
