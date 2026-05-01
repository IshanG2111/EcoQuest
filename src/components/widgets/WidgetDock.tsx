'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FactWidget } from './FactWidget';
import { DailyBriefingWidget } from './DailyBriefingWidget';
import { PixelWeatherWidget } from './PixelWeatherWidget';
import { WidgetCard } from './WidgetCard';
import { Lightbulb, Newspaper, CloudSun, Rss, Globe, Flame, Leaf, Zap, BarChart2 } from 'lucide-react';

type WidgetType = 'fact' | 'briefing' | 'weather' | 'news';

interface WidgetDockProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    activeWidgets: WidgetType[];
    toggleWidget: (widgetId: WidgetType) => void;
}

// Static preview for the news widget (instead of rendering the full widget)
function EcoNewsPreview() {
    const items = [
        { cat: 'Climate', icon: Globe, color: '#f97316', title: 'Arctic Sea Ice Hits Record Low', score: 95 },
        { cat: 'Energy', icon: Zap, color: '#06b6d4', title: 'Solar Capacity Doubles Globally', score: 82 },
        { cat: 'Wildlife', icon: Leaf, color: '#22c55e', title: 'Amazon Deforestation Falls 50%', score: 88 },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', padding: '4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28ca41', display: 'inline-block' }} />
                <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', letterSpacing: '0.08em', marginLeft: 6, opacity: 0.7 }}>ECO_NEWS.RSS</span>
            </div>
            {items.map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'hsl(var(--muted) / 0.3)', border: '1px solid hsl(var(--border) / 0.3)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 4, background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon style={{ width: 12, height: 12, color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.55rem', color: item.color, fontWeight: 700, fontFamily: 'monospace', marginBottom: 2 }}>{item.cat}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</div>
                        <div style={{ height: 2, background: 'hsl(var(--muted))', borderRadius: 99, marginTop: 4 }}>
                            <div style={{ height: '100%', width: `${item.score}%`, background: '#f97316', borderRadius: 99 }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

const availableWidgets: {id: WidgetType, title: string, icon: React.ElementType, component: React.FC<any>, preview?: React.FC}[] = [
    { id: 'fact',     title: 'Eco Fact',     icon: Lightbulb,  component: FactWidget },
    { id: 'briefing', title: 'Daily Briefing',icon: Newspaper,  component: DailyBriefingWidget },
    { id: 'weather',  title: 'Pixel Weather', icon: CloudSun,   component: PixelWeatherWidget },
    { id: 'news',     title: 'Eco News Feed', icon: Rss,        component: () => null, preview: EcoNewsPreview },
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
                            <div className="flex items-center justify-center h-full w-full">
                                {widget.preview ? (
                                    <widget.preview />
                                ) : (
                                    <div className="scale-90 pointer-events-none w-full flex justify-center">
                                        <widget.component theme="forest" />
                                    </div>
                                )}
                            </div>
                       </WidgetCard>
                   ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
