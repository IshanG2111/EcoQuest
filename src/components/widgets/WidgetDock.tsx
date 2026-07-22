'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Lightbulb, Newspaper, CloudSun, Rss, CalendarDays, Trees, Network } from 'lucide-react';

type WidgetType = 'fact' | 'briefing' | 'weather' | 'news' | 'calendar' | 'garden' | 'ecograph';

interface WidgetDockProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  activeWidgets: WidgetType[];
  toggleWidget: (widgetId: WidgetType) => void;
}

const availableWidgets = [
  { 
    id: 'ecograph' as WidgetType,
    title: 'EcoGraph Knowledge Mini',
    desc: 'Real-time environmental knowledge graph entity explorer and multi-hop discovery widget.',
    icon: Network
  },
  { 
    id: 'fact' as WidgetType, 
    title: 'Eco Fact Card', 
    desc: 'Double-sided 3D flipping card showing verified environmental facts and actionable carbon-saving tips.',
    icon: Lightbulb 
  },
  { 
    id: 'briefing' as WidgetType, 
    title: 'Daily Briefing', 
    desc: 'HUD summary tracker showing live statistics including total Eco Points, streaks, and badges.',
    icon: Newspaper 
  },
  { 
    id: 'weather' as WidgetType, 
    title: 'Pixel Weather', 
    desc: 'Selected skin-themed microclimate environment displaying region-specific ecological facts.',
    icon: CloudSun 
  },
  { 
    id: 'news' as WidgetType, 
    title: 'Eco News Feed', 
    desc: 'Real-time environmental RSS feed featuring article classification and categorical impact scoring.',
    icon: Rss 
  },
  { 
    id: 'calendar' as WidgetType, 
    title: 'Eco Tiles Calendar', 
    desc: 'GitHub-style daily green activity tracker and predictive carbon-offset planner.',
    icon: CalendarDays 
  },
  { 
    id: 'garden' as WidgetType, 
    title: 'Eco Garden Pet', 
    desc: 'Real-time care simulation of an evolving sprout reflecting your ongoing carbon savings.',
    icon: Trees 
  },
];

export function WidgetDock({ isOpen, onOpenChange, activeWidgets, toggleWidget }: WidgetDockProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[320px] bg-background/95 backdrop-blur-md border-l-2 border-primary p-4 flex flex-col h-full font-body select-none text-foreground shadow-2xl"
      >
        <SheetHeader className="border-b border-primary/20 pb-4 mb-4">
          <SheetTitle className="text-center font-headline text-lg tracking-widest text-primary uppercase">
            WIDGET_DOCK.SYS
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow overflow-y-auto space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {availableWidgets.map(widget => {
            const Icon = widget.icon;
            const isInserted = activeWidgets.includes(widget.id);
            return (
              <div 
                key={widget.id} 
                className="p-3 border-2 border-primary/20 rounded-lg bg-black/45 hover:border-primary/45 transition-all flex flex-col gap-2 relative group/card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-code font-bold text-xs tracking-wider uppercase text-primary">
                      {widget.id}.sys
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleWidget(widget.id)}
                    className={`px-3 py-1 font-code text-[8px] font-bold rounded border transition-all cursor-pointer uppercase ${
                      isInserted 
                        ? 'bg-destructive/20 border-destructive/50 text-destructive hover:bg-destructive/30' 
                        : 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
                    }`}
                  >
                    {isInserted ? 'REMOVE' : 'ADD'}
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-headline text-[10px] uppercase text-foreground/80 tracking-wider">
                    {widget.title}
                  </span>
                  <p className="text-[10px] font-code text-muted-foreground leading-relaxed">
                    {widget.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="border-t border-primary/20 pt-4 mt-auto text-center text-[9px] font-code text-muted-foreground/60">
          TOGGLE WIDGETS TO DISPLAY ON THE DESKTOP
        </div>
      </SheetContent>
    </Sheet>
  );
}
