'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lightbulb, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import './FactWidget.css';
import mockFacts from '@/lib/game-data/random-facts.json';

interface Fact {
  fact: string;
  explanation: string;
  tip: string;
}

export function FactWidget({ onClose }: { onClose?: () => void }) {
  const [factData, setFactData] = useState<Fact | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchFact = useCallback(() => {
    setIsFlipped(false);
    // Directly use the mock data
    const randomFact = mockFacts[Math.floor(Math.random() * mockFacts.length)];
    setFactData(randomFact);
  }, []);

  useEffect(() => {
    fetchFact();
  }, [fetchFact]);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchFact();
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only flip if the click is not on a button
    if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('button')) {
      if (factData) {
        setIsFlipped(!isFlipped);
      }
    }
  }

  const renderButtons = () => (
    <>
      {onClose && (
        <Button
            variant="ghost"
            size="icon"
            className="fact-widget-close-btn"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            aria-label="Close Widget"
        >
            <X className="h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fact-widget-refresh-btn"
        onClick={handleRefresh}
        aria-label="Refresh Fact"
      >
        <RefreshCw className="h-5 w-5" />
      </Button>
    </>
  );

  return (
    <div className="fact-widget-container">
      <div 
        className={cn("fact-widget-card", { 'is-flipped': isFlipped })}
        onClick={handleCardClick}
      >
        {/* Front Face of the Card */}
        <div className="fact-widget-face fact-widget-face--front">
          {!factData ? (
            <p className="font-body text-card-foreground">Loading a fresh fact...</p>
          ) : (
            <blockquote className="text-lg font-medium font-body italic text-card-foreground">
              "{factData.fact}"
            </blockquote>
          )}
          {renderButtons()}
        </div>

        {/* Back Face of the Card */}
        <div className="fact-widget-face fact-widget-face--back font-body">
            {factData && (
                <>
                    <div>
                        <h4><Lightbulb className="inline-block mr-2 h-4 w-4"/>Explanation</h4>
                        <p className="text-card-foreground">{factData.explanation}</p>
                    </div>
                    <div>
                        <h4><CheckCircle className="inline-block mr-2 h-4 w-4"/>Actionable Tip</h4>
                        <p className="text-card-foreground">{factData.tip}</p>
                    </div>
                </>
            )}
            {renderButtons()}
        </div>
      </div>
    </div>
  );
}
