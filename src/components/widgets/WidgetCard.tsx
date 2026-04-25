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
        <Card className="flex flex-col retro-window h-full">
            <CardHeader className="window-drag-handle !p-2">
                <CardTitle className="text-xs font-headline flex items-center gap-2 tracking-widest">
                    <Icon className="h-4 w-4" />
                    {title.toUpperCase()}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex-1">
                {children}
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
