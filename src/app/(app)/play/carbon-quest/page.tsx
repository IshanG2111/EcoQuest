'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, AlertTriangle } from 'lucide-react';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/carbon_quest.json';


type Policy = typeof gameData.policies[0];
type GameEvent = typeof gameData.events[0];


function shuffle(array: any[]) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}


export default function CarbonQuestPage() {
  const [gameState, setGameState] = useState<'home' | 'rules' | 'playing' | 'end'>(
    'home'
  );
  const [year, setYear] = useState(gameData.presets.steady_start.year);
  const [co2, setCo2] = useState(gameData.presets.steady_start.co2);
  const [approval, setApproval] = useState(gameData.presets.steady_start.approval);
  const [budget, setBudget] = useState(gameData.presets.steady_start.budget);
  const [policyChoices, setPolicyChoices] = useState<Policy[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [log, setLog] = useState('A new year begins. Choose a policy.');

  useEffect(() => {
    if (gameState === 'playing') {
      setPolicyChoices(shuffle([...gameData.policies]).slice(0, 4));

      // Trigger a random event
      const randomEvent = gameData.events.find(e => Math.random() < e.probability);
      if (randomEvent) {
          setCurrentEvent(randomEvent);
          setLog(`Event: ${randomEvent.name}!`);
          if (randomEvent.effects.co2) setCo2(prev => prev + randomEvent.effects.co2!);
          if (randomEvent.effects.approval) setApproval(prev => prev + randomEvent.effects.approval!);
          if (randomEvent.effects.budget) setBudget(prev => prev + randomEvent.effects.budget!);
      } else {
          setCurrentEvent(null);
      }
    }
  }, [year, gameState]);

  useEffect(() => {
    if (co2 > 500 || approval <= 0 || budget < -100) {
      setGameState('end');
    }
  }, [co2, approval, budget])

  const handlePolicyChoice = (policy: Policy) => {
    if (budget >= policy.cost) {
      setBudget((prev) => prev - policy.cost + 50); // economic growth
      setCo2((prev) => prev + policy.co2);
      setApproval((prev) => Math.min(100, Math.max(0, prev + policy.approval)));
      setYear((prev) => prev + 1);
      setLog(`Year ${year + 1}: ${policy.title} enacted.`);
    } else {
      setLog('Not enough budget for that policy!');
    }
  };
  
  const startGame = () => {
      setGameState('playing');
      setYear(gameData.presets.steady_start.year);
      setCo2(gameData.presets.steady_start.co2);
      setApproval(gameData.presets.steady_start.approval);
      setBudget(gameData.presets.steady_start.budget);
      setLog('A new year begins. Choose a policy.');
  }

  const getCo2Color = () => {
    if (co2 > 500) return 'text-error animate-pulse';
    if (co2 > 450) return 'text-error';
    if (co2 < 350) return 'text-success';
    return 'text-yellow-400';
  };

  const content = () => {
    if (gameState === 'home') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-indigo-900/80 items-center justify-center text-center p-8 relative overflow-hidden">
          <video
            src="/videos/carbon-quest.mp4"
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="z-20 animate-fade-in-up">
            <h1 className="text-6xl font-headline text-primary mb-4 animate-zoom-in">
              Carbon Quest
            </h1>
            <p className="text-xl mb-8">The Climate Challenge</p>
            <Button
              size="lg"
              onClick={() => setGameState('rules')}
              className="font-bold text-lg"
            >
              Start Mission
            </Button>
          </div>
        </div>
      );
    }

    if (gameState === 'rules') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-indigo-900/80 items-center justify-center text-center p-8">
          <Card className="bg-background/80 text-foreground max-w-2xl animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <BookOpen /> Mission Briefing
              </CardTitle>
              <CardDescription>
                Your goal is to balance the budget, public approval, and CO₂
                levels to prevent climate catastrophe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <p>
                <span className="font-bold text-primary">1. Analyze Data:</span>{' '}
                Each turn represents one year. Review global CO₂, public
                approval, and your budget.
              </p>
              <p>
                <span className="font-bold text-primary">2. Choose Policy:</span>{' '}
                Select one policy card per year from a random selection. Each card has trade-offs.
              </p>
              <p>
                <span className="font-bold text-primary">3. Handle Events:</span> Random global events can help or hinder your progress. Adapt your strategy!
              </p>
              <p>
                <span className="font-bold text-primary">4. Survive:</span> Keep CO₂ levels from rising too high, and don't let approval or budget fall too low, or it's game over.
              </p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                className="w-full font-bold"
                onClick={startGame}
              >
                Begin Quest
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (gameState === 'end') {
        return (
             <div className="flex flex-col h-full w-full font-code text-white bg-indigo-900/80 items-center justify-center text-center p-8">
              <Card className="bg-background/80 text-foreground max-w-lg animate-fade-in-up">
                  <CardHeader>
                      <CardTitle className="text-4xl text-primary">Game Over</CardTitle>
                      <CardDescription>
                          {co2 > 500 && "Catastrophic climate change has occurred."}
                          {approval <= 0 && "You've been voted out of office."}
                          {budget < -100 && "The economy has collapsed."}
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-2xl">You made it to the year <span className="font-bold text-accent">{year}</span>.</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                      <Button className="w-full font-bold" onClick={startGame}>Try Again</Button>
                  </div>
              </Card>
            </div>
        )
    }

    return (
      <div className="flex flex-col h-full w-full font-code text-white bg-black/80 relative overflow-hidden">
        <div className="z-20 p-4 flex flex-col flex-1 gap-4">
          {/* Header */}
          <header className="grid grid-cols-3 gap-4 items-center bg-black/50 p-2 border-2 border-primary/50 rounded-md">
            <div className="text-left">
              <p className="text-2xl font-bold text-accent">${budget}B</p>
              <p className="text-xs text-muted-foreground">Budget</p>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-headline text-primary">
                Carbon Quest
              </h1>
              <p className="text-lg font-bold">{year}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Public Approval</p>
              <Progress value={approval} className="h-3 border border-secondary" />
            </div>
          </header>

          {/* Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center bg-indigo-800/30 p-4 border-2 border-primary/50 rounded-md">
            <div className={`w-full text-center p-2 bg-black/50 border rounded-md mb-4 ${currentEvent ? 'border-red-500' : 'border-gray-500'}`}>
              <p className="font-bold">{log}</p>
            </div>
            <p className="text-xl text-center mb-4">
              Choose a policy for the year:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {policyChoices.map((card) => (
                <Card
                  key={card.id}
                  className="bg-background/80 border-2 text-foreground text-center"
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm p-3">
                    <p
                      className={
                        card.co2 > 0 ? 'text-error' : 'text-success'
                      }
                    >
                      CO₂: {card.co2 > 0 ? '+' : ''}
                      {card.co2}ppm
                    </p>
                    <p
                      className={
                        card.approval >= 0 ? 'text-success' : 'text-error'
                      }
                    >
                      Approval: {card.approval >= 0 ? '+' : ''}
                      {card.approval}%
                    </p>
                    <p>Cost: ${card.cost}B</p>
                    <Button
                      className="w-full mt-2"
                      onClick={() => handlePolicyChoice(card)}
                      disabled={budget < card.cost}
                    >
                      Enact
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>

          {/* Meters */}
          <footer className="bg-black/50 p-3 border-2 border-primary/50 rounded-md">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Global CO₂:</p>
              <p className={`font-bold text-lg ${getCo2Color()}`}>{co2} ppm</p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
