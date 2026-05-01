'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FactWidget } from './FactWidget';
import { DailyBriefingWidget } from './DailyBriefingWidget';
import { PixelWeatherWidget } from './PixelWeatherWidget';
import { WidgetCard } from './WidgetCard';
import { Lightbulb, Newspaper, CloudSun } from 'lucide-react';

type WidgetType = 'fact' | 'briefing' | 'weather';

interface WidgetDockProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    activeWidgets: WidgetType[];
    toggleWidget: (widgetId: WidgetType) => void;
}

const availableWidgets: {id: WidgetType, title: string, icon: React.ElementType, component: React.FC<any>}[] = [
    { id: 'fact', title: 'Eco Fact', icon: Lightbulb, component: FactWidget },
    { id: 'briefing', title: 'Daily Briefing', icon: Newspaper, component: DailyBriefingWidget },
    { id: 'weather', title: 'Pixel Weather', icon: CloudSun, component: PixelWeatherWidget },
];

export function WidgetDock({ isOpen, onOpenChange, activeWidgets, toggleWidget }: WidgetDockProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-3/4 bg-background/90 backdrop-blur-sm border-t-2 border-primary">
                <SheetHeader>
                    <SheetTitle className="text-center font-headline text-2xl text-primary">Widget Library</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 overflow-auto h-full">
                   {availableWidgets.map(widget => (
                       <WidgetCard 
                            key={widget.id}
                            title={widget.title} 
                            icon={widget.icon}
                            onToggle={() => toggleWidget(widget.id)}
                            isInserted={activeWidgets.includes(widget.id)}
                        >
                            <div className="flex items-center justify-center h-full scale-90 pointer-events-none">
                               <widget.component theme="forest" />
                            </div>
                       </WidgetCard>
                   ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
