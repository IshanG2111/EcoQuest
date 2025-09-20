'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wind, Sun, Trees, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/eco_city_builder.json';

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

  const content = () => {
    if (gameState === 'home') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-gray-900 items-center justify-center text-center p-8 relative overflow-hidden">
          <video
            src="/videos/eco-city-builder.mp4"
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="z-20 animate-fade-in-up">
            <h1 className="text-6xl font-headline text-primary mb-4 animate-zoom-in">
              Eco City Builder
            </h1>
            <p className="text-xl mb-8">Sustainable Urban Planning</p>
            <Button
              size="lg"
              onClick={() => setGameState('rules')}
              className="font-bold text-lg"
            >
              Become Mayor
            </Button>
          </div>
        </div>
      );
    }

      if (gameState === 'rules') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-gray-900 items-center justify-center text-center p-8">
          <Card className="bg-background/80 text-foreground max-w-2xl animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <BookOpen /> City Planner's Handbook
              </CardTitle>
              <CardDescription>
                Your goal is to build a thriving, sustainable city by balancing resources and citizen happiness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <p>
                <span className="font-bold text-primary">1. Manage Resources:</span> Keep an eye on your population, budget, happiness, and CO2 levels.
              </p>
              <p>
                <span className="font-bold text-primary">2. Build Your City:</span> Choose from a variety of buildings. Each has a cost and affects your city's stats.
              </p>
              <p>
                <span className="font-bold text-primary">3. Handle Events:</span> Random events like heatwaves or economic booms will challenge your planning.
              </p>
              <p>
                <span className="font-bold text-primary">4. Grow Sustainably:</span> A happy city will grow, creating new demands. Keep balancing to succeed!
              </p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                className="w-full font-bold"
                onClick={() => setGameState('playing')}
              >
                Start Building
              </Button>
            </div>
          </Card>
        </div>
      );
    }

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
