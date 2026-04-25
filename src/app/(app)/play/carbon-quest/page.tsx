'use client';

import { useEffect, useMemo, useState } from 'react';
import { Desktop } from '@/components/desktop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { Clock3, Leaf, Factory, Trophy, BookOpen } from 'lucide-react';

type Phase = 'home' | 'rules' | 'playing' | 'result';

type Choice = {
  label: string;
  carbonCost: number;
  reason: string;
};

type Round = {
  title: string;
  prompt: string;
  choices: Choice[];
};

const TIME_PER_ROUND = 15;
const TOTAL_ROUNDS = 8;

const rounds: Round[] = [
  {
    title: 'Daily Commute',
    prompt: 'You need to travel 8 km to school. What do you choose?',
    choices: [
      { label: 'Drive alone', carbonCost: 9, reason: 'Highest per-person emissions for short trips.' },
      { label: 'Take a public bus', carbonCost: 4, reason: 'Shared transport spreads emissions per rider.' },
      { label: 'Cycle', carbonCost: 1, reason: 'Near-zero direct emissions and health benefits.' },
    ],
  },
  {
    title: 'Lunch Plan',
    prompt: 'Pick lunch for your team meeting.',
    choices: [
      { label: 'Beef burgers', carbonCost: 10, reason: 'Beef has one of the highest food footprints.' },
      { label: 'Chicken wraps', carbonCost: 6, reason: 'Lower than beef but still significant.' },
      { label: 'Bean bowls', carbonCost: 2, reason: 'Plant proteins usually emit far less.' },
    ],
  },
  {
    title: 'Home Power',
    prompt: 'Your block can fund one upgrade this year.',
    choices: [
      { label: 'Coal backup plant', carbonCost: 10, reason: 'Coal is among the most carbon-intensive sources.' },
      { label: 'Grid efficiency retrofits', carbonCost: 4, reason: 'Efficiency lowers demand quickly.' },
      { label: 'Solar microgrid', carbonCost: 2, reason: 'Low lifecycle emissions and local resilience.' },
    ],
  },
  {
    title: 'Shopping',
    prompt: 'You need a jacket for winter.',
    choices: [
      { label: 'Fast-fashion new', carbonCost: 8, reason: 'Short lifecycle and production impact are high.' },
      { label: 'Durable local brand', carbonCost: 5, reason: 'Better quality reduces replacement frequency.' },
      { label: 'Second-hand', carbonCost: 2, reason: 'Reusing products avoids new production emissions.' },
    ],
  },
  {
    title: 'Weekend Trip',
    prompt: 'You are planning a 400 km trip.',
    choices: [
      { label: 'Short-haul flight', carbonCost: 10, reason: 'Flights are high-emission per passenger-km.' },
      { label: 'Electric carpool', carbonCost: 4, reason: 'Shared EV travel cuts per-person impact.' },
      { label: 'Train', carbonCost: 2, reason: 'Rail is often one of the lowest-carbon options.' },
    ],
  },
  {
    title: 'Heating',
    prompt: 'A cold week is coming. Best plan?',
    choices: [
      { label: 'Crank thermostat to 26C', carbonCost: 9, reason: 'Heating demand rises sharply with high setpoints.' },
      { label: 'Keep 20C + insulation', carbonCost: 3, reason: 'Efficiency and insulation reduce energy waste.' },
      { label: 'Heat one room only', carbonCost: 4, reason: 'Targeted heating helps but comfort is limited.' },
    ],
  },
  {
    title: 'Delivery Choices',
    prompt: 'Your household orders essentials online.',
    choices: [
      { label: 'Same-day separate orders', carbonCost: 8, reason: 'Fragmented logistics increase delivery emissions.' },
      { label: 'Weekly bundled order', carbonCost: 3, reason: 'Consolidation improves route efficiency.' },
      { label: 'Pickup while commuting', carbonCost: 2, reason: 'Combining errands avoids extra trips.' },
    ],
  },
  {
    title: 'Appliance Upgrade',
    prompt: 'Your old fridge broke. Which replacement?',
    choices: [
      { label: 'Cheapest basic model', carbonCost: 7, reason: 'Low efficiency raises long-term emissions.' },
      { label: 'Energy-star efficient model', carbonCost: 2, reason: 'Efficient devices reduce lifetime power use.' },
      { label: 'Refurbished older unit', carbonCost: 5, reason: 'Re-use helps, but old units can be energy-heavy.' },
    ],
  },
];

export default function CarbonQuestPage() {
  const [phase, setPhase] = useState<Phase>('home');
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [score, setScore] = useState(0);
  const [carbonLevel, setCarbonLevel] = useState(55);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState('Choose the lowest-carbon option before time expires.');

  const currentRound = rounds[roundIndex];
  const progress = Math.round((roundIndex / TOTAL_ROUNDS) * 100);

  useGameSessionTracker({
    gameSlug: 'carbon-quest',
    isPlaying: phase === 'playing',
    isFinished: phase === 'result',
    score,
    metadata: { carbonLevel, roundsCleared: roundIndex },
  });

  useEffect(() => {
    if (phase !== 'playing' || locked) {
      return;
    }

    if (timeLeft <= 0) {
      setLocked(true);
      setCarbonLevel((prev) => Math.min(100, prev + 10));
      setFeedback('Time expired. Carbon levels rose in the district.');
      const timeout = setTimeout(nextRound, 1200);
      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, locked]);

  const finalMessage = useMemo(() => {
    if (score >= 900) return 'City atmosphere stabilized. You are an EcoQuest climate strategist.';
    if (score >= 600) return 'Good mitigation choices. The city is improving, but still vulnerable.';
    return 'High emissions remained. Re-run the simulation to test cleaner strategies.';
  }, [score]);

  function startGame() {
    setRoundIndex(0);
    setTimeLeft(TIME_PER_ROUND);
    setScore(0);
    setCarbonLevel(55);
    setFeedback('Choose the lowest-carbon option before time expires.');
    setLocked(false);
    setPhase('playing');
  }

  function nextRound() {
    setLocked(false);
    setTimeLeft(TIME_PER_ROUND);
    setFeedback('Choose the lowest-carbon option before time expires.');
    setRoundIndex((prev) => {
      const next = prev + 1;
      if (next >= TOTAL_ROUNDS) {
        setPhase('result');
        return prev;
      }
      return next;
    });
  }

  function choose(choice: Choice) {
    if (locked || phase !== 'playing') {
      return;
    }

    setLocked(true);
    const roundChoices = rounds[roundIndex].choices;
    const bestCost = Math.min(...roundChoices.map((item) => item.carbonCost));
    const delta = choice.carbonCost - bestCost;
    const gained = Math.max(30, timeLeft * 12 - delta * 28);

    setScore((prev) => prev + gained);
    setCarbonLevel((prev) => Math.min(100, Math.max(0, prev + choice.carbonCost - 5)));
    setFeedback(choice.reason);

    setTimeout(nextRound, 1200);
  }

  return (
    <Desktop>
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-6 pb-24 md:p-8 md:pb-28">
        {phase === 'home' && (
          <Card className="border-primary/30 bg-gradient-to-br from-card to-secondary/10">
            <CardHeader>
              <CardTitle className="text-4xl font-headline uppercase tracking-widest text-primary md:text-5xl">Carbon Quest</CardTitle>
              <CardDescription className="max-w-2xl text-base md:text-lg">
                Simulate urban lifestyle decisions, reduce emissions, and keep your district breathable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-background/40 p-4 text-base text-muted-foreground md:text-lg">
                8 rapid rounds. 15 seconds each. Lower carbon cost means stronger city resilience and higher score.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setPhase('rules')} size="lg" className="font-headline text-base uppercase tracking-wide">
                  <BookOpen className="mr-2 h-4 w-4" /> Mission Brief
                </Button>
                <Button variant="outline" onClick={startGame} size="lg" className="font-headline text-base uppercase tracking-wide">
                  Begin Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'rules' && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="font-headline text-2xl uppercase tracking-wide md:text-3xl">How Carbon Quest Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base text-muted-foreground md:text-lg">
              <p>1. Read each scenario and choose one action before the timer runs out.</p>
              <p>2. Lower-carbon options improve city air quality and score multipliers.</p>
              <p>3. High-carbon choices increase emissions, making recovery harder.</p>
              <p>4. Final score converts directly to Eco Points through session tracking.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={startGame} size="lg" className="font-headline text-base uppercase tracking-wide">Launch</Button>
                <Button variant="ghost" onClick={() => setPhase('home')} size="lg" className="text-base">Back</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === 'playing' && currentRound && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-primary">{score}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-muted-foreground">Round</p>
                  <p className="text-2xl font-bold">{roundIndex + 1}/{TOTAL_ROUNDS}</p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-muted-foreground">Timer</p>
                  <p className="flex items-center gap-2 text-2xl font-bold text-amber-500">
                    <Clock3 className="h-5 w-5" /> {timeLeft}s
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <p className="text-xs uppercase text-muted-foreground">Carbon Level</p>
                  <p className="flex items-center gap-2 text-2xl font-bold text-rose-500">
                    <Factory className="h-5 w-5" /> {carbonLevel}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="font-headline text-2xl uppercase tracking-wide">{currentRound.title}</CardTitle>
                <CardDescription className="text-base md:text-lg">{currentRound.prompt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={100 - carbonLevel} indicatorClassName={carbonLevel > 70 ? 'bg-red-500' : 'bg-emerald-500'} />
                <p className="text-base text-muted-foreground md:text-lg">{feedback}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {currentRound.choices.map((choice) => (
                    <Button
                      key={choice.label}
                      variant="outline"
                      className="h-auto min-h-20 whitespace-normal p-4 text-left text-base md:min-h-24 md:text-lg"
                      onClick={() => choose(choice)}
                      disabled={locked}
                    >
                      {choice.label}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Mission Progress</p>
                <Progress value={progress} indicatorClassName="bg-primary" />
              </CardContent>
            </Card>
          </>
        )}

        {phase === 'result' && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl font-headline uppercase tracking-wide text-primary">
                <Trophy className="h-7 w-7" /> Mission Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-6xl font-black text-primary">{score}</p>
              <p className="text-sm text-muted-foreground">{finalMessage}</p>
              <p className="flex items-center gap-2 text-sm text-emerald-500">
                <Leaf className="h-4 w-4" /> High-efficiency choices are the fastest path to cleaner cities.
              </p>
              <div className="flex gap-3">
                <Button onClick={startGame} className="font-headline uppercase tracking-wide">Replay</Button>
                <Button variant="outline" onClick={() => setPhase('home')}>Back to Briefing</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Desktop>
  );
}
