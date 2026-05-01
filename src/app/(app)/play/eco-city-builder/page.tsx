'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wind, Sun, Trees, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/eco_city_builder.json';
import { useGameSessionTracker } from '@/hooks/useGameSessionTracker';
import { GameBriefingShell } from '@/components/game-briefing-shell';

type Building = typeof gameData.buildings[0];
type GameEvent = typeof gameData.events[0];

export default function EcoCityBuilderPage() {
  const [gameState, setGameState] = useState<'home' | 'rules' | 'playing'>('home');
  const [population, setPopulation] = useState(gameData.presets.starter_city.population);
  const [budget, setBudget] = useState(gameData.presets.starter_city.budget);
  const [greenEnergy, setGreenEnergy] = useState(20);
  const [happiness, setHappiness] = useState(40);
  const [co2, setCo2] = useState(80); // Higher is worse
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  const estimatedScore = Math.max(0, population + happiness * 8 + greenEnergy * 10 + (100 - co2) * 6);

  useGameSessionTracker({
    gameSlug: 'eco-city-builder',
    isPlaying: gameState === 'playing',
    score: estimatedScore,
    metadata: { population, budget, happiness, greenEnergy, co2 },
  });

  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        const randomEvent = gameData.events.find(e => Math.random() < e.probability);
        if (randomEvent) {
          setCurrentEvent(randomEvent);
          if (randomEvent.effects.budget) setBudget(prev => prev + randomEvent.effects.budget!);
          if (randomEvent.effects.happiness) setHappiness(prev => prev + randomEvent.effects.happiness!);
        } else {
          setCurrentEvent(null);
        }
      }, 8000); // Event check every 8 seconds
      return () => clearInterval(gameLoop);
    }
  }, [gameState]);


  const handleAction = (building: Building) => {
    if (budget >= building.cost) {
      setBudget(prev => prev - building.cost);
      if (building.effects.greenEnergy) setGreenEnergy((prev) => Math.min(100, prev + building.effects.greenEnergy!));
      if (building.effects.co2) setCo2((prev) => Math.max(0, prev + building.effects.co2!));
      if (building.effects.happiness) setHappiness((prev) => Math.min(100, prev + building.effects.happiness!));
      if (building.effects.population) setPopulation(prev => prev + building.effects.population!);

    }
  };

  if (gameState === 'home' || gameState === 'rules') {
    return (
      <Desktop>
        <GameBriefingShell
          phase={gameState}
          title="Eco City Builder"
          subtitle="Sustainable Urban Planning"
          videoSrc="/videos/eco-city-builder.mp4"
          rulesTitle="City Planner's Handbook"
          rules={[
            'Keep an eye on your population, budget, happiness, and CO2 levels.',
            'Choose from a variety of buildings. Each has a cost and affects your city\'s stats.',
            'Random events like heatwaves or economic booms will challenge your planning.',
            'A happy city will grow, creating new demands. Keep balancing to succeed!',
          ]}
          openLabel="Become Mayor"
          startLabel="Start Building"
          onOpenRules={() => setGameState('rules')}
          onStart={() => setGameState('playing')}
        />
      </Desktop>
    );
  }

  const content = () => {
    const earlyBuildings = gameData.buildings.filter(b => b.tier === 'early').slice(0, 3);

    return (
      <div className="flex flex-col h-full w-full font-code text-white bg-black/80 relative overflow-hidden">
        <div className="z-20 p-4 flex flex-col flex-1 gap-4">
          {/* Header */}
          <header className="grid grid-cols-3 gap-4 bg-black/50 p-2 border-2 border-primary/50 rounded-md">
            <div className="text-left">
              <p className="text-2xl font-bold text-accent">
                {population.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Population</p>
            </div>
            <div className='text-center'>
              <h1 className="text-lg font-headline text-primary">
                Eco City Builder
              </h1>
              <p className="text-2xl font-bold text-accent">${budget}M</p>
              <p className="text-xs text-muted-foreground">Budget</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">{happiness}%</p>
              <p className="text-xs text-muted-foreground">Happiness</p>
            </div>
          </header>

          {/* Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center bg-gray-700/30 p-4 border-2 border-primary/50 rounded-md">
            {currentEvent && (
                <div className="w-full text-center p-2 bg-red-900/50 border border-red-500 rounded-md mb-4 flex items-center justify-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-300" />
                    <p className="font-bold">EVENT: {currentEvent.name}</p>
                </div>
            )}
            <p className="text-xl text-center mb-4">
              Enact a policy to improve your city!
            </p>
            <div className="grid grid-cols-3 gap-4 w-full">
              {earlyBuildings.map(building => (
                 <Button
                    key={building.id}
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => handleAction(building)}
                    disabled={budget < building.cost}
                  >
                    {building.id.includes('solar') ? <Sun size={32}/> : building.id.includes('wind') ? <Wind size={32} /> : <Trees size={32} />}
                    <span>
                      {building.name}
                      <br />
                      (Cost: {building.cost})
                    </span>
                  </Button>
              ))}
            </div>
          </main>

          {/* Meters */}
          <footer className="bg-black/50 p-3 border-2 border-primary/50 rounded-md grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Green Energy</p>
              <Progress
                value={greenEnergy}
                className="h-3 border border-secondary"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Clean Air (Lower CO₂ is better)</p>
              <Progress
                value={100 - co2}
                className="h-3 border border-secondary"
                indicatorClassName={co2 > 50 ? 'bg-error' : 'bg-success'}
              />
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
