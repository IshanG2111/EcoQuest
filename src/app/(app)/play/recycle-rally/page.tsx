
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Trash2,
  Recycle,
  Apple,
  Sparkles,
  BookOpen,
  Box,
  Droplets,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Desktop } from '@/components/desktop';
import gameData from '@/lib/game-data/recycle_rally.json';

type Item = typeof gameData.items[0];
type BinType = 'Recycle' | 'Landfill' | 'Compost' | 'E-Waste' | 'Hazardous' | 'Textile' | 'Bulk';


const binIcons: Record<BinType, React.ElementType> = {
    Recycle: Recycle,
    Compost: Apple,
    Landfill: Trash2,
    'E-Waste': Zap,
    Hazardous: Sparkles,
    Textile: Box,
    Bulk: Box
}

export default function RecycleRallyPage() {
  const [gameState, setGameState] = useState<'home' | 'rules' | 'playing' | 'end'>('home');
  const [score, setScore] = useState(0);
  const [shuffledItems, setShuffledItems] = useState<Item[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  const currentItem = shuffledItems[currentItemIndex];

  useEffect(() => {
    if (gameState === 'playing') {
       // Shuffle items at the start of the game
      setShuffledItems([...gameData.items].sort(() => Math.random() - 0.5));
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                setGameState('end');
                clearInterval(timer);
                return 0;
            }
            return prev - 1
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);


  const handleSort = (bin: BinType) => {
    if (gameState !== 'playing') return;

    if (bin === currentItem.bin) {
      setScore((prev) => prev + 10 * (streak + 1));
      setStreak((prev) => prev + 1);
      setFeedback('Correct!');
    } else {
      setScore((prev) => Math.max(0, prev - 10));
      setStreak(0);
      setFeedback('Wrong bin!');
    }

    setTimeout(() => {
      setFeedback('');
      setCurrentItemIndex((prev) => (prev + 1) % shuffledItems.length);
    }, 800);
  };
  
  const startGame = () => {
    setGameState('playing');
    setTimeLeft(30);
    setScore(0);
    setStreak(0);
    setCurrentItemIndex(0);
    setFeedback('');
  }

  const content = () => {
    if (gameState === 'home') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-yellow-900/80 items-center justify-center text-center p-8 relative overflow-hidden">
          <video
            src="/videos/recycle-rally.mp4"
            autoPlay
            loop
            muted
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          ></video>
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <div className="z-20 animate-fade-in-up">
            <h1 className="text-6xl font-headline text-primary mb-4 animate-zoom-in">
              Recycle Rally
            </h1>
            <p className="text-xl mb-8">The Waste Management Challenge</p>
            <Button
              size="lg"
              onClick={() => setGameState('rules')}
              className="font-bold text-lg"
            >
              Start Sorting
            </Button>
          </div>
        </div>
      );
    }

    if (gameState === 'rules') {
      return (
        <div className="flex flex-col h-full w-full font-code text-white bg-yellow-900/80 items-center justify-center text-center p-8">
          <Card className="bg-background/80 text-foreground max-w-2xl animate-fade-in-up">
              <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl"><BookOpen /> Sorting Guide</CardTitle>
                  <CardDescription>Your goal is to sort as much waste as possible before time runs out!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-left">
                  <p><span className="font-bold text-primary">1. Identify:</span> An item will appear at the top of the screen.</p>
                  <p><span className="font-bold text-primary">2. Sort:</span> Click the correct bin for the item. More bins will appear as you score higher!</p>
                  <p><span className="font-bold text-primary">3. Streak:</span> Correct sorts build a score multiplier. Don't break the chain!</p>
                  <p><span className="font-bold text-primary">4. Level Up:</span> As you do well, the game gets faster and trickier!</p>
              </CardContent>
              <div className="p-6 pt-0">
                  <Button className="w-full font-bold" onClick={startGame}>Let's Go!</Button>
              </div>
          </Card>
        </div>
      );
    }
    
    if (gameState === 'end') {
        return (
             <div className="flex flex-col h-full w-full font-code text-white bg-yellow-900/80 items-center justify-center text-center p-8">
              <Card className="bg-background/80 text-foreground max-w-lg animate-fade-in-up">
                  <CardHeader>
                      <CardTitle className="text-4xl text-primary">Time's Up!</CardTitle>
                      <CardDescription>Great rally! Here's how you did.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-5xl font-bold">{score}</p>
                      <p>You sorted items with a top streak of {streak}!</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                      <Button className="w-full font-bold" onClick={startGame}>Play Again</Button>
                  </div>
              </Card>
            </div>
        )
    }

    const availableBins = (score < 100) ? ['Recycle', 'Compost', 'Landfill'] : (score < 300) ? ['Recycle', 'Compost', 'Landfill', 'E-Waste'] : ['Recycle', 'Compost', 'Landfill', 'E-Waste', 'Hazardous', 'Textile'];

    return (
      <div className="flex flex-col h-full w-full font-code text-white bg-black/80 relative overflow-hidden">
        <div className="z-20 p-4 flex flex-col flex-1 gap-4">
          {/* Header */}
          <header className="grid grid-cols-3 gap-4 items-center bg-black/50 p-2 border-2 border-primary/50 rounded-md">
            <div className="text-left">
              <p className="text-2xl font-bold text-accent">{timeLeft}s</p>
              <p className="text-xs text-muted-foreground">Time Left</p>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-headline text-primary">
                Recycle Rally
              </h1>
              <p className="text-xs text-muted-foreground">Streak: {streak}x</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-accent">
                {score.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Recycle Points</p>
            </div>
          </header>

          {/* Game Area */}
          <main className="flex-1 flex flex-col items-center justify-center bg-yellow-800/30 p-4 border-2 border-primary/50 rounded-md">
            <div className="h-24 flex items-center justify-center">
             {feedback ? (
                <p
                  className={cn(
                    'text-4xl font-bold animate-ping',
                    feedback === 'Correct!' ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {feedback}
                </p>
              ) : currentItem ? (
                <Card className="bg-background/80 border-2 border-dashed p-4">
                  <CardContent className="p-0 flex flex-col items-center justify-center gap-2">
                    <p className="font-bold text-foreground text-center">
                      {currentItem.name}
                    </p>
                  </CardContent>
                </Card>
              ) : <p>Loading items...</p>}
            </div>
          </main>

          {/* Bins */}
          <footer className="bg-black/50 p-3 border-2 border-primary/50 rounded-md">
            <div className={`grid grid-cols-${availableBins.length} gap-3`}>
              {availableBins.map(bin => {
                const Icon = binIcons[bin as BinType];
                return (
                  <Button
                    key={bin}
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-gray-800/50 hover:bg-gray-700/50 border-gray-500"
                    onClick={() => handleSort(bin as BinType)}
                    disabled={gameState !== 'playing'}
                  >
                    <Icon size={24} /> <span>{bin}</span>
                  </Button>
                )
              })}
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return <Desktop>{content()}</Desktop>;
}
