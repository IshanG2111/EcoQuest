'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, Droplets, Heart, Sparkles, RefreshCw, X, Award, Trees, Flame } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import './EcoGardenWidget.css';

interface PlantState {
  stage: number; // 1: Sprout, 2: Seedling, 3: Sapling, 4: Flower, 5: Mighty Tree
  growth: number; // 0 to 100
  hydration: number; // 0 to 100
  treesHarvested: number;
  lastChecked: number; // timestamp
}

const STAGE_NAMES = ['Sprout', 'Seedling', 'Sapling', 'Flowering Sprout', 'Mighty Oak'];
const STAGE_EMOJIS = ['🌱', '🌿', '☘️', '🌸', '🌳'];

export function EcoGardenWidget({ onClose }: { onClose?: () => void }) {
  const { progress, mutate } = useUserProgress();
  const [plant, setPlant] = useState<PlantState | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [isFertilizing, setIsFertilizing] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Load state on mount and calculate hydration decay
  useEffect(() => {
    const saved = localStorage.getItem('ecoquest_garden_plant');
    let initialPlant: PlantState = {
      stage: 1,
      growth: 0,
      hydration: 80,
      treesHarvested: 0,
      lastChecked: Date.now(),
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PlantState;
        // Calculate decay based on hours passed
        const hoursPassed = (Date.now() - parsed.lastChecked) / 3600000;
        const decayAmount = Math.floor(hoursPassed * 2); // 2% decay per hour
        const newHydration = Math.max(0, parsed.hydration - decayAmount);
        
        initialPlant = {
          ...parsed,
          hydration: newHydration,
          lastChecked: Date.now(),
        };
      } catch (e) {}
    }

    setPlant(initialPlant);
    localStorage.setItem('ecoquest_garden_plant', JSON.stringify(initialPlant));
  }, []);

  // Save state helper
  const savePlantState = (updated: PlantState) => {
    setPlant(updated);
    localStorage.setItem('ecoquest_garden_plant', JSON.stringify(updated));
  };

  if (!plant) return null;

  const isWithered = plant.hydration <= 0 && plant.stage < 5;
  const currentPoints = progress?.points ?? 0;

  const showTempMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAction = async (action: 'water' | 'fertilize' | 'revive' | 'harvest') => {
    if (!plant) return;

    let pointsCost = 0;
    let pointsAwarded = 0;
    let updatedPlant = { ...plant, lastChecked: Date.now() };

    if (action === 'water') {
      if (isWithered) {
        showTempMessage('The plant is withered! Revive it first.');
        return;
      }
      if (plant.stage === 5) {
        showTempMessage('The tree is fully grown! Harvest it.');
        return;
      }
      pointsCost = 10;
      if (currentPoints < pointsCost) {
        showTempMessage('Insufficient Eco Points (Need 10)');
        return;
      }

      setIsWatering(true);
      setTimeout(() => setIsWatering(false), 1000);

      updatedPlant.hydration = Math.min(100, plant.hydration + 25);
      updatedPlant.growth = plant.growth + 12;
    } 
    else if (action === 'fertilize') {
      if (isWithered) {
        showTempMessage('The plant is withered! Revive it first.');
        return;
      }
      if (plant.stage === 5) {
        showTempMessage('The tree is fully grown! Harvest it.');
        return;
      }
      pointsCost = 20;
      if (currentPoints < pointsCost) {
        showTempMessage('Insufficient Eco Points (Need 20)');
        return;
      }

      setIsFertilizing(true);
      setTimeout(() => setIsFertilizing(false), 1000);

      updatedPlant.growth = plant.growth + 30;
      updatedPlant.hydration = Math.min(100, plant.hydration + 10);
    } 
    else if (action === 'revive') {
      if (!isWithered) {
        showTempMessage('Plant does not need reviving.');
        return;
      }
      pointsCost = 40;
      if (currentPoints < pointsCost) {
        showTempMessage('Insufficient Eco Points (Need 40)');
        return;
      }
      updatedPlant.hydration = 60;
      updatedPlant.growth = Math.max(0, plant.growth - 15); // penalize slightly
      showTempMessage('Plant revived 🌱');
    } 
    else if (action === 'harvest') {
      if (plant.stage < 5) {
        showTempMessage('Tree is not fully grown yet.');
        return;
      }
      pointsAwarded = 250;
      updatedPlant.stage = 1;
      updatedPlant.growth = 0;
      updatedPlant.hydration = 80;
      updatedPlant.treesHarvested = plant.treesHarvested + 1;
      
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 3000);
      showTempMessage('Tree harvested! +250 XP 🌳✨');
    }

    // Check for level up/growth stage transition
    if (updatedPlant.growth >= 100 && updatedPlant.stage < 5) {
      updatedPlant.stage += 1;
      if (updatedPlant.stage === 5) {
        updatedPlant.growth = 100;
        showTempMessage('Mighty Oak Grown! Harvest for points 🌳🎉');
      } else {
        updatedPlant.growth = 0;
        pointsAwarded += 100; // award 100 pts for level up
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 2000);
        showTempMessage(`Evolved into ${STAGE_NAMES[updatedPlant.stage - 1]}! +100 XP 🎉`);
      }
    }

    // Call API to adjust points
    const netPoints = pointsAwarded - pointsCost;
    if (netPoints !== 0) {
      try {
        const response = await fetch('/api/user/progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pointsToAdd: netPoints }),
        });
        if (response.ok) {
          mutate(); // trigger SWR refresh
        }
      } catch (e) {
        console.error('Failed to update points', e);
      }
    }

    savePlantState(updatedPlant);
  };

  return (
    <div className="eco-garden-widget font-body">
      <div className="egw-body p-3 flex flex-col items-center gap-3">
        {/* Plant display box */}
        <div className={cn(
          "egw-display-box relative w-full h-[140px] rounded border border-primary/15 bg-black/35 flex flex-col items-center justify-center overflow-hidden",
          isWithered && "withered-bg"
        )}>
          {plant.treesHarvested > 0 && (
            <div className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/60 rounded px-1.5 py-0.5 text-[9px] text-emerald-400 font-bold font-code z-10" title="Trees Harvested">
              🌳 HARVESTED: x{plant.treesHarvested}
            </div>
          )}
          {/* Weather/sparkles animation */}
          {showSparkles && <div className="sparkles-overlay font-body text-sm tracking-wider">✨ CONGRATS ✨</div>}
          {isWatering && <div className="watering-drops">💧 💧 💧</div>}
          {isFertilizing && <div className="fertilizer-sparks">⭐ ⭐ ⭐</div>}

          {/* Plant graphic */}
          <div className={cn(
            "plant-graphic text-6xl select-none transition-transform duration-500",
            isWatering && "animate-bounce",
            isFertilizing && "scale-110",
            isWithered && "opacity-60 scale-95 rotate-12"
          )}>
            {isWithered ? '🥀' : STAGE_EMOJIS[plant.stage - 1]}
          </div>

          {/* Plant stats text overlay */}
          <div className="absolute bottom-2 left-2 text-[9px] font-code text-muted-foreground">
            STAGE {plant.stage}/5: <span className="text-primary font-body font-bold text-xs tracking-wider">{STAGE_NAMES[plant.stage - 1].toUpperCase()}</span>
          </div>

          {plant.stage === 5 && (
            <div className="absolute top-2 right-2 bg-emerald-500/20 border border-emerald-500/60 rounded px-1.5 py-0.5 text-[10px] font-body text-emerald-400 animate-pulse">
              HARVEST READY
            </div>
          )}
        </div>

        {/* Status bars */}
        <div className="w-full space-y-2 text-[10px]">
          {/* Hydration */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-code">
              <span className="flex items-center gap-1 text-sky-400 font-bold text-[10px]">
                <Droplets className="h-3.5 w-3.5" /> HYDRATION
              </span>
              <span className={cn("font-bold font-code text-[11px]", plant.hydration < 30 ? "text-red-400 animate-pulse" : "text-sky-300")}>
                {plant.hydration}%
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded border border-primary/10 overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-300", plant.hydration < 30 ? "bg-red-500" : "bg-sky-500")} 
                style={{ width: `${plant.hydration}%` }} 
              />
            </div>
          </div>

          {/* Growth */}
          <div className="space-y-1">
            <div className="flex justify-between items-center font-code">
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                <Sprout className="h-3.5 w-3.5" /> GROWTH
              </span>
              <span className="text-emerald-300 font-bold font-code text-[11px]">{plant.growth}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded border border-primary/10 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300" 
                style={{ width: `${plant.growth}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Message row */}
        <div className="h-4 text-center">
          {message ? (
            <p className="text-[10px] font-code text-amber-400 animate-pulse font-medium">{message}</p>
          ) : (
            <p className="text-[9px] font-code text-muted-foreground/60">Care for your plant to earn Eco Points!</p>
          )}
        </div>

        {/* Actions grid */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {isWithered ? (
            <Button
              onClick={() => handleAction('revive')}
              className="col-span-2 h-9 text-[10px] font-code font-bold uppercase tracking-tight bg-amber-600 hover:bg-amber-500 border-2 border-amber-400 text-white rounded"
            >
              REVIVE PLANT (-40 XP)
            </Button>
          ) : plant.stage === 5 ? (
            <Button
              onClick={() => handleAction('harvest')}
              className="col-span-2 h-9 text-[10px] font-code font-bold uppercase tracking-tight bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-400 text-white rounded animate-bounce"
            >
              HARVEST TREE (+250 XP)
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleAction('water')}
                variant="outline"
                className="h-8 text-[9px] font-code font-bold uppercase tracking-tight border-2 border-sky-600 text-sky-400 hover:bg-sky-950/20"
              >
                WATER (-10 XP)
              </Button>
              <Button
                onClick={() => handleAction('fertilize')}
                variant="outline"
                className="h-8 text-[9px] font-code font-bold uppercase tracking-tight border-2 border-emerald-600 text-emerald-400 hover:bg-emerald-950/20"
              >
                FERTILIZE (-20 XP)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
