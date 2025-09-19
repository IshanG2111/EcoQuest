'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shovel, Trash2, Droplets, BookOpen, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/ecosystem_builder.json';

// Define types based on your JSON structure
type Tile = {
  id: string;
  category: string;
  name: string;
  effects: { [key: string]: number };
  cost: number;
  rarity: string;
};

type GameEvent = {
  id: string;
  name: string;
  probability: number;
  effects: { [key: string]: number };
};

export default function ForestGuardianPage() {
  const [gameState, setGameState] = useState<'home' | 'rules' | 'playing'>(
    'home'
  );
  const [ecosystemHealth, setEcosystemHealth] = useState(50);
  const [points, setPoints] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Simplified game loop trigger
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(() => {
        // Trigger a random event based on probability
        const randomEvent = gameData.events.find(
          (event) => Math.random() < event.probability
        );
        if (randomEvent) {
          setCurrentEvent(randomEvent as unknown as GameEvent);
          if (randomEvent.effects.treeMortality) {
            setEcosystemHealth(prev => Math.max(0, prev + (randomEvent.effects.treeMortality || 0)));
          }
        } else {
            setCurrentEvent(null);
        }
      }, 5000); // Check for new event every 5 seconds

      return () => clearInterval(gameLoop);
    }
  }, [gameState]);

  const handleAction = (tile: Tile) => {
    // For simplicity, we just use the first positive effect we find.
    const healthEffect = tile.effects.fertility || tile.effects.waterRetention || tile.effects.waterFiltration || 5;
    const pointsEffect = tile.cost * 10;
    
    setEcosystemHealth((prev) =>
      Math.min(100, Math.max(0, prev + healthEffect))
    );
    setPoints((prev) => prev + pointsEffect);
  };
  
  const content = () => {
    if (gameState === 'home') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-green-900/80 items-center justify-center text-center p-8 relative overflow-hidden">
          <video
            src="/videos/forest-guardian.mp4"
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="z-20 animate-fade-in-up">
            <h1 className="text-6xl font-headline text-primary mb-4 animate-zoom-in">Forest Guardian</h1>
            <p className="text-xl mb-8">A Conservation Adventure</p>
            <Button size="lg" onClick={() => setGameState('rules')} className="font-bold text-lg">
              Start Your Patrol
            </Button>
          </div>
        </div>
      );
    }

    if (gameState === 'rules') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-green-900/80 items-center justify-center text-center p-8">
          <Card className="bg-background/80 text-foreground max-w-2xl animate-fade-in-up">
              <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl"><BookOpen /> Ranger's Field Guide</CardTitle>
                  <CardDescription>Your mission is to restore the forest's health and earn points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                  <p><span className="font-bold text-primary">1. Assess:</span> Look for degraded areas and choose actions to fix them.</p>
                  <p><span className="font-bold text-primary">2. Act:</span> Use your toolbar to perform actions like planting trees or cleaning water.</p>
                  <p><span className="font-bold text-primary">3. Beware of Events:</span> Random events like wildfires or droughts can occur, impacting the ecosystem.</p>
                  <p><span className="font-bold text-primary">4. Reward:</span> Watch the Ecosystem Health meter fill up and your Guardian Points increase!</p>
              </CardContent>
              <div className="p-6 pt-0">
                  <Button className="w-full font-bold" onClick={() => setGameState('playing')}>Begin Restoration</Button>
              </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full w-full font-code text-white bg-black/80 relative overflow-hidden">
        <div className="z-20 p-4 flex flex-col flex-1 gap-4">
          {/* Header */}
          <header className="flex justify-between items-center bg-black/50 p-2 border-2 border-primary/50 rounded-md">
            <div>
              <h1 className="text-lg font-headline text-primary">
                Forest Guardian
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="w-48">
                  <p className="text-xs text-muted-foreground mb-1">
                    Ecosystem Health
                  </p>
                  <Progress
                    value={ecosystemHealth}
                    className="h-3 border border-secondary"
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">
                {points.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Guardian Points</p>
            </div>
          </header>

          {/* Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center bg-green-900/30 p-4 border-2 border-primary/50 rounded-md">
             {currentEvent && (
              <div className="w-full text-center p-2 bg-red-900/50 border border-red-500 rounded-md mb-4 flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-300" />
                <p className="font-bold">EVENT: {currentEvent.name}</p>
              </div>
            )}
            <p className="text-xl text-center mb-4">
              The forest is degraded. Use your tools to restore it!
            </p>
            {/* Simplified Display */}
            <div className="grid grid-cols-3 gap-4">
               <div
                className="text-center cursor-pointer p-2 hover:bg-white/10 rounded-md"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'oak_sapling');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <div className="w-24 h-24 bg-yellow-900/50 border-2 border-dashed border-yellow-700 rounded-md flex items-center justify-center">
                  <span className="text-yellow-400">Empty Patch</span>
                </div>
                <p className="text-xs mt-1">Plant trees here</p>
              </div>
              <div
                className="text-center cursor-pointer p-2 hover:bg-white/10 rounded-md"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'invasive_shrub');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <div className="w-24 h-24 bg-purple-900/50 border-2 border-dashed border-purple-700 rounded-md flex items-center justify-center">
                  <span className="text-purple-400">Invasive Species</span>
                </div>
                <p className="text-xs mt-1">Remove these</p>
              </div>
              <div
                className="text-center cursor-pointer p-2 hover:bg-white/10 rounded-md"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'stream_restoration');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <div className="w-24 h-24 bg-blue-900/50 border-2 border-dashed border-blue-700 rounded-md flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-xs mt-1">Clean Waterway</p>
              </div>
            </div>
          </main>

          {/* Toolbar */}
          <footer className="bg-black/50 p-3 border-2 border-primary/50 rounded-md space-y-3">
            <p className="text-center text-xs text-muted-foreground">TOOL BAR</p>
            <div className="flex items-center justify-around gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'oak_sapling');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <Shovel className="mr-2 h-5 w-5" /> Plant Tree
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'root_barrier');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <Trash2 className="mr-2 h-5 w-5" /> Remove Invasive
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const tile = gameData.tiles.find(t => t.id === 'stream_restoration');
                  if (tile) handleAction(tile as unknown as Tile);
                }}
              >
                <Droplets className="mr-2 h-5 w-5" /> Clean Waterway
              </Button>
            </div>
          </footer>
        </div>
      </div>
    );
  }
  return <Desktop>{content()}</Desktop>;
}
