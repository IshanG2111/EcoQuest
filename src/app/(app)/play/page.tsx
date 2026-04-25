import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { games } from '@/lib/games';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Desktop } from '@/components/desktop';
import { Gamepad2 } from 'lucide-react';

export default function PlayPage() {
  return (
    <Desktop>
      <div className="mx-auto max-w-7xl space-y-10 px-5 py-8 pb-24 md:px-6">
        <div className="relative">
          <h1 className="mb-2 text-4xl font-headline tracking-tighter text-primary uppercase md:text-5xl">Arcade_Terminal</h1>
          <p className="max-w-2xl text-base text-muted-foreground font-medium md:text-lg">
            EXECUTE_PROGRAM: Interactive ecological simulations designed to synchronize your environmental impact knowledge.
          </p>
          <div className="absolute -left-4 top-0 w-1 h-full bg-primary/20 rounded-full" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card
              key={game.id}
              id={game.id}
              className="group flex flex-col overflow-hidden bg-card border-2 border-primary/10 hover:border-primary/40 transition-all duration-500 shadow-lg hover:shadow-primary/5 rounded-xl"
            >
              <CardHeader className="p-0 border-b-2 border-primary/5 overflow-hidden">
                <div className="relative h-56 w-full grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700">
                  <video
                    src={game.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full scale-105 group-hover:scale-100 transition-transform duration-700"
                    title={game.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                  
                  {/* Category Tag */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-primary/30 text-[10px] py-0 px-2 font-headline uppercase tracking-widest text-primary">
                        {game.tags[0]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-8 flex-1 relative">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors duration-300">
                    <game.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="mb-2 font-headline text-2xl tracking-wide group-hover:text-primary transition-colors duration-300 uppercase">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed line-clamp-3 md:text-base">
                      {game.description}
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex-col items-start gap-6 pt-0 pb-8 px-6">
                <div className="flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                  {game.tags.slice(1).map((tag) => (
                    <span key={tag} className="text-[11px] font-mono uppercase tracking-tight text-muted-foreground border-b border-transparent hover:border-primary cursor-default md:text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <Link href={game.gameLink} className="w-full">
                  <Button className="w-full h-14 text-base font-headline tracking-widest uppercase rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300 md:h-16 md:text-lg">
                    <Gamepad2 className="mr-3 h-5 w-5" />
                    Initialize_Sim
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-primary/5 flex justify-between items-center opacity-40">
            <div className="flex gap-4">
                 <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                 <span className="text-[10px] font-mono uppercase tracking-[0.2em]">All Systems Nominal // Global Eco-Sync: 100%</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em]">
                EcoPlay_Subsystem_Build_2026.04
            </div>
        </div>
      </div>
    </Desktop>
  );
}
