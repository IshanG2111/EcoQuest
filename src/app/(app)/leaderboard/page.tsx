'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Desktop } from '@/components/desktop';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/use-auth';

export default function LeaderboardPage() {
  const { leaderboard, currentUser, isLoading, isError } = useLeaderboard(20);
  const { user } = useAuth();

  return (
    <Desktop>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline tracking-tight uppercase">Leaderboard</h1>
          <p className="text-muted-foreground font-body">
            See who's leading the charge in the quest for a greener planet.
          </p>
        </div>

        {currentUser && (
          <Card className="p-4 flex items-center gap-4 bg-primary/10 retro-window border-primary/20">
            <span className="text-[10px] font-headline tracking-widest uppercase opacity-70">Your Rank:</span>
            <span className="text-2xl font-headline text-primary tracking-tighter">#{currentUser.rank}</span>
            <span className="text-xs font-body text-muted-foreground">with {currentUser.total_points.toLocaleString()} Eco Points</span>
          </Card>
        )}

        <Card className="overflow-hidden retro-window">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-16 text-destructive">Failed to load leaderboard. Please refresh.</div>
          ) : (
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow>
                  <TableHead className="w-16 text-center font-headline text-[10px] tracking-widest">RANK</TableHead>
                  <TableHead className="font-headline text-[10px] tracking-widest">USER</TableHead>
                  <TableHead className="text-right font-headline text-[10px] tracking-widest">ECO_POINTS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => {
                  const isMe = entry.user_id === user?.id;
                  return (
                    <TableRow key={entry.user_id} className={cn(isMe && 'bg-secondary font-bold')}>
                      <TableCell className="text-center font-medium">
                        {entry.rank === 1 ? (
                          <Trophy className="w-6 h-6 text-yellow-500 inline-block" />
                        ) : entry.rank === 2 ? (
                          <Trophy className="w-6 h-6 text-gray-400 inline-block" />
                        ) : entry.rank === 3 ? (
                          <Trophy className="w-6 h-6 text-orange-400 inline-block" />
                        ) : (
                          entry.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={entry.avatar_url ?? undefined} alt={entry.display_name} />
                            <AvatarFallback>{entry.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{entry.display_name}{isMe && ' (You)'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{entry.total_points.toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                {leaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No players yet. Complete quizzes and games to earn Eco Points!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </Desktop>
  );
}
