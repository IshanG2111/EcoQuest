'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lightbulb, CheckCircle, X, Leaf, Zap, Droplets, Fish, TreePine, Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import './FactWidget.css';

interface Fact {
  id: number;
  fact: string;
  explanation: string;
  tip: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CATEGORY_ICONS: Record<string, typeof Leaf> = {
  waste: Recycle, ocean: Fish, energy: Zap, water: Droplets,
  forests: TreePine, wildlife: Leaf, food: Leaf, fashion: Leaf,
  transport: Leaf, pollution: Leaf, climate: Leaf, soil: Leaf,
};
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: '#22c55e', medium: '#f97316', hard: '#ef4444',
};

export function FactWidget({ onClose }: { onClose?: () => void }) {
  const [fact, setFact] = useState<Fact | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchFact = useCallback(async () => {
    setIsFlipped(false);
    setIsLoading(true);
    try {
      const res = await fetch('/api/eco-facts?random=true');
      if (!res.ok) throw new Error();
      const data: Fact = await res.json();
      setFact(data);
    } catch {
      // fallback inline
      setFact({ id: 0, fact: "Recycling one aluminum can saves enough energy to run a TV for three hours.", explanation: "Recycling aluminum uses only ~5% of the energy needed to produce new aluminum from raw bauxite ore.", tip: "Always recycle your aluminum cans.", category: "waste", difficulty: "easy" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchFact(); 
    setIsMounted(true);
  }, [fetchFact]);

  const Icon = fact ? (CATEGORY_ICONS[fact.category] ?? Leaf) : Leaf;

  return (
    <div className={cn("fact-widget-container", isMounted ? "animate-in fade-in zoom-in duration-300" : "opacity-0")}>
      <div
        className={cn("fact-widget-card", { 'is-flipped': isFlipped })}
        onClick={e => { if (!(e.target as HTMLElement).closest('button')) setIsFlipped(f => !f); }}
      >
        {/* Front */}
        <div className="fact-widget-face fact-widget-face--front handle">
          <div className="fw-category-row">
            {isLoading ? (
              <Skeleton className="h-4 w-24 bg-white/10" />
            ) : fact && (
              <>
                <span className="fw-cat-badge" style={{ color: DIFFICULTY_COLOR[fact.difficulty] }}>
                  <Icon className="h-3 w-3" />
                  {fact.category.toUpperCase()}
                </span>
                <span className="fw-difficulty" style={{ color: DIFFICULTY_COLOR[fact.difficulty] }}>
                  {fact.difficulty.toUpperCase()}
                </span>
              </>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-white/10" />
              </div>
            ) : (
              <blockquote className="text-base font-medium font-body italic text-card-foreground leading-snug">
                "{fact?.fact}"
              </blockquote>
            )}
          </div>

          <p className="fw-flip-hint">Tap card to reveal explanation →</p>
          <div className="fw-buttons">
            <Button variant="ghost" size="icon" className="fact-widget-refresh-btn" onClick={e => { e.stopPropagation(); fetchFact(); }} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="fact-widget-close-btn" onClick={e => { e.stopPropagation(); onClose(); }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Back */}
        <div className="fact-widget-face fact-widget-face--back handle font-body">
          {fact && (
            <>
              <div className="fw-back-section">
                <h4 className="fw-back-heading"><Lightbulb className="inline-block mr-1.5 h-4 w-4" />Why It Matters</h4>
                <p className="text-card-foreground text-sm leading-relaxed">{fact.explanation}</p>
              </div>
              <div className="fw-back-section">
                <h4 className="fw-back-heading"><CheckCircle className="inline-block mr-1.5 h-4 w-4 text-green-400" />Your Action</h4>
                <p className="text-card-foreground text-sm leading-relaxed">{fact.tip}</p>
              </div>
            </>
          )}
          <div className="fw-buttons">
            <Button variant="ghost" size="icon" className="fact-widget-refresh-btn" onClick={e => { e.stopPropagation(); fetchFact(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="fact-widget-close-btn" onClick={e => { e.stopPropagation(); onClose(); }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
