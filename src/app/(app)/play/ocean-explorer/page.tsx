'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, Scissors, Paintbrush, BookOpen, Waves } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/coral_lab.json';

type Tool = 'skimmer' | 'netting' | 'algae_scrubber' | 'manual_removal';
type Hazard = typeof gameData.hazards[0];

export default function OceanExplorerPage() {
  const [gameState, setGameState] = useState<'home' | 'rules' | 'playing'>(
    'home'
  );
  const [marineHealth, setMarineHealth] = useState(40);
  const [currentTool, setCurrentTool] = useState<Tool>('skimmer');
  const [activeHazards, setActiveHazards] = useState<Hazard[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (gameState === 'playing') {
      const hazardInterval = setInterval(() => {
        // Add a new random hazard
        const randomIndex = Math.floor(Math.random() * gameData.hazards.length);
        const newHazard = gameData.hazards[randomIndex];
        setActiveHazards(prev => [...prev.slice(-4), newHazard]); // Keep last 5 hazards
      }, 4000); // New hazard every 4 seconds

      return () => clearInterval(hazardInterval);
    }
  }, [gameState]);


  const handleAction = (hazard: Hazard) => {
    if (hazard.removal.includes(currentTool)) {
      setMarineHealth((prev) => Math.min(100, prev + 10)); // Simplified health gain
      setPoints(prev => prev + hazard.impact);
      setActiveHazards(prev => prev.filter(h => h.id !== hazard.id));
    }
  };

  const getToolIcon = (tool: Tool) => {
    switch(tool) {
        case 'skimmer': return <Trash2 className="mr-2 h-5 w-5" />;
        case 'netting': return <Scissors className="mr-2 h-5 w-5" />;
        case 'algae_scrubber': return <Paintbrush className="mr-2 h-5 w-5" />;
        case 'manual_removal': return <Waves className="mr-2 h-5 w-5" />;
    }
  }

  const content = () => {
    if (gameState === 'home') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-blue-900/80 items-center justify-center text-center p-8 relative overflow-hidden">
          <video
            src="/videos/ocean-explorer.mp4"
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <style jsx>{`
              @keyframes bubble {
                  0% { transform: translateY(0) scale(1); opacity: 1; }
                  100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
              }
              .bubble {
                  position: absolute;
                  bottom: -50px;
                  width: 20px;
                  height: 20px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 50%;
                  animation: bubble 15s linear infinite;
                  z-index: 20;
              }
          `}</style>
          {Array.from({length: 10}).map((_, i) => (
              <div key={i} className="bubble" style={{left: `${Math.random() * 100}%`, animationDuration: `${5 + Math.random() * 10}s`, animationDelay: `${Math.random() * 5}s`}}></div>
          ))}
          <div className="z-20 animate-fade-in-up">
            <h1 className="text-6xl font-headline text-primary mb-4 animate-zoom-in">
              Ocean Explorer
            </h1>
            <p className="text-xl mb-8">The Coral Quest</p>
            <Button
              size="lg"
              onClick={() => setGameState('rules')}
              className="font-bold text-lg"
            >
              Start Dive
            </Button>
          </div>
        </div>
      );
    }
    
      if (gameState === 'rules') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-blue-900/80 items-center justify-center text-center p-8">
          <Card className="bg-background/80 text-foreground max-w-2xl animate-fade-in-up">
              <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl"><BookOpen /> Diver's Log</CardTitle>
                  <CardDescription>Your mission is to clean up the reef and restore marine health.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                  <p><span className="font-bold text-primary">1. Explore &amp; Identify:</span> Hazards will float into view. Identify the problem.</p>
                  <p><span className="font-bold text-primary">2. Select Tool:</span> Use the Tool Wheel to select the correct tool for the job.</p>
                  <p><span className="font-bold text-primary">3. Clean &amp; Heal:</span> Click on a problem with the correct tool selected to remove it and boost marine health.</p>
                  <p><span className="font-bold text-primary">4. Act Fast:</span> Hazards appear over time. Clean them up to keep the reef healthy!</p>
              </CardContent>
              <div className="p-6 pt-0">
                  <Button className="w-full font-bold" onClick={() => setGameState('playing')}>Begin Expedition</Button>
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
                Ocean Explorer
              </h1>
               <p className="text-xs text-muted-foreground">Points: {points}</p>
            </div>
            <div className="text-right">
              <div className="w-48">
                <p className="text-xs text-muted-foreground mb-1">
                  Marine Health
                </p>
                <Progress
                  value={marineHealth}
                  className="h-3 border border-secondary"
                />
              </div>
            </div>
          </header>

          {/* Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center bg-blue-800/30 p-4 border-2 border-primary/50 rounded-md">
            <p className="text-xl text-center mb-4">
              Hazards are appearing! Use your tools to clean them up.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {activeHazards.map((hazard, index) => (
                <div
                  key={`${hazard.id}-${index}`}
                  className={`text-center cursor-pointer p-2 rounded-md border-2 border-dashed ${
                    hazard.removal.includes(currentTool) ? 'border-primary bg-primary/20' : 'border-gray-500'
                  }`}
                  onClick={() => handleAction(hazard)}
                >
                  <div className="w-24 h-24 bg-gray-700/50 rounded-md flex items-center justify-center">
                    <span className="text-red-400">{hazard.name}</span>
                  </div>
                  <p className="text-xs mt-1">Impact: {hazard.impact}</p>
                </div>
              ))}
              {activeHazards.length === 0 && <p className="col-span-3 text-center text-muted-foreground">The water is clear... for now.</p>}
            </div>
          </main>

          {/* Tool Wheel */}
          <footer className="bg-black/50 p-3 border-2 border-primary/50 rounded-md space-y-3">
            <p className="text-center text-xs text-muted-foreground">
              TOOL WHEEL
            </p>
            <div className="flex items-center justify-around gap-3">
              {(['skimmer', 'netting', 'algae_scrubber', 'manual_removal'] as Tool[]).map((tool) => (
                 <Button
                    key={tool}
                    variant={currentTool === tool ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setCurrentTool(tool)}
                  >
                    {getToolIcon(tool)} {tool.replace('_', ' ')}
                  </Button>
              ))}
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
