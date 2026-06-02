import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "../ui/button";

interface WidgetCardProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onToggle: () => void;
    isInserted: boolean;
}

export function WidgetCard({ title, icon: Icon, children, onToggle, isInserted }: WidgetCardProps) {
    return (
        <Card className="flex flex-col retro-window h-full relative group/card overflow-hidden">
            <CardHeader className="window-drag-handle !py-3 !px-4 flex items-center min-h-[40px]">
                <CardTitle className="text-[10px] font-headline flex items-center gap-2 tracking-widest leading-normal">
                    <Icon className="h-3.5 w-3.5" />
                    {title.toUpperCase()}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1 relative flex items-center justify-center min-h-[150px]">
                {children}
                {/* Hover Add/Remove Button Option */}
                <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 z-10 p-4">
                    <span className="text-[9px] font-headline text-center leading-normal text-muted-foreground">
                        {isInserted ? 'ACTIVE ON DESKTOP' : 'AVAILABLE IN LIBRARY'}
                    </span>
                    <Button 
                        onClick={onToggle}
                        variant={isInserted ? "destructive" : "primary" as any}
                        className="font-headline text-[9px] py-2 px-4 h-9 shadow-md pointer-events-auto"
                    >
                        {isInserted ? 'REMOVE WIDGET' : 'ADD TO DESKTOP'}
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="p-3 bg-secondary/10 border-t border-border/20">
                <Button 
                    className="w-full font-headline text-[10px] tracking-tighter h-8" 
                    variant={isInserted ? "destructive" : "primary" as any} 
                    onClick={onToggle}
                >
                    {isInserted ? 'TERMINATE_WIDGET' : 'INITIALIZE_WIDGET'}
                </Button>
            </CardFooter>
        </Card>
    );
}
