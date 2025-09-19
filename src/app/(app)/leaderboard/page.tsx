import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { leaderboardData } from '@/lib/user-data';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Desktop } from '@/components/desktop';

export default function LeaderboardPage() {
  return (
    <Desktop>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See who's leading the charge in the quest for a greener planet.
          </p>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((user, index) => (
                <TableRow key={user.name} className={cn(user.name === 'You' && 'bg-secondary font-bold')}>
                  <TableCell className="text-center font-medium">
                    {user.rank === 1 ? (
                      <Trophy className="w-6 h-6 text-yellow-500 inline-block" />
                    ) : user.rank === 2 ? (
                      <Trophy className="w-6 h-6 text-gray-400 inline-block" />
                    ) : user.rank === 3 ? (
                      <Trophy className="w-6 h-6 text-orange-400 inline-block" />
                    ) : (
                      user.rank
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">{user.score.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </Desktop>
  );
}
