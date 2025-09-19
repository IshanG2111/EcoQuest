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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">EcoQuest Games</h1>
          <p className="text-muted-foreground">
            Explore interactive games to boost your environmental knowledge.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card
              key={game.id}
              id={game.id}
              className="flex flex-col overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
            >
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <video
                    src={game.video}
                    autoPlay
                    loop
                    muted
                    className="object-cover w-full h-full"
                    title={game.title}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1">
                <div className="flex items-start gap-4">
                  <game.icon className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="mb-2">{game.title}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="w-full space-y-2">
                    <Link href={game.gameLink} className="w-full block">
                      <Button className="w-full">
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        Play Game
                      </Button>
                    </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Desktop>
  );
}
