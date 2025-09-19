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
        <Card className="flex flex-col bg-card/80 backdrop-blur-sm">
            <CardHeader className="!p-2 !flex-row items-center justify-between">
                <CardTitle className="text-sm font-body flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 h-full">
                {children}
            </CardContent>
            <CardFooter className="p-2">
                <Button className="w-full" variant="outline" onClick={onToggle}>
                    {isInserted ? 'Remove' : 'Insert'}
                </Button>
            </CardFooter>
        </Card>
    );
}
