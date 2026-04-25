'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useNotifications } from '@/hooks/useNotifications';
import { Flame, Star, Award, Sparkles, BookOpen, AlertTriangle, Loader2, Bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Desktop } from '@/components/desktop';
import ProfileCard from '@/components/profile-card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Helper to generate a unique avatar URL based on user id or name using RoboHash
function getUniqueAvatarUrl(user: { id?: string; name?: string | null } | null) {
  // Use a hash or the id/name as a seed for the avatar
  const seed = user?.id || user?.name || Math.random().toString(36).substring(2, 10);
  // Use RoboHash avatar service
  return `https://robohash.org/${encodeURIComponent(seed)}.png?set=set3`;
}

export default function DashboardPage() {
  const [suggestions] = useState<string[]>([
    'Sustainable Cities: Innovations for Urban Living',
    'Marine Ecosystems and Ocean Stewardship',
    'Forests: Biodiversity and Conservation',
  ]);
  const [error] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { progress, isLoading: progressLoading } = useUserProgress();
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(6);
  const avatarUrl = getUniqueAvatarUrl(user);
  const username = user?.name ?? 'Eco-Champion';

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  const stats = [
    {
      title: 'Eco Points',
      value: progressLoading ? '...' : (progress?.points ?? 0).toLocaleString(),
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      title: 'Daily Streak',
      value: progressLoading ? '...' : `${progress?.streak ?? 0} Days`,
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      title: 'Badges Earned',
      value: progressLoading ? '...' : (progress?.badges.length ?? 0),
      icon: Award,
      color: 'text-blue-500',
    },
  ];

  return (
    <Desktop>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex justify-center items-center">
            <ProfileCard
              name={username}
              title="Eco-Champion"
              handle={user?.name?.toLowerCase() ?? 'eco_champion'}
              avatarUrl={avatarUrl}
              miniAvatarUrl={avatarUrl}
              status='Online'
              contactText="View Stats"
              grainUrl=""
              behindGradient=""
              innerGradient=""
            />
          </div>
          <div className="lg:col-span-2">
            <div>
              <h1 className="text-3xl font-headline tracking-tight uppercase">Welcome Back, {username}!</h1>
              <p className="text-muted-foreground font-body">
                Continue your journey to make the world a greener place.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              {stats.map((stat, index) => (
                <Card
                  key={stat.title}
                  className="animate-fade-in-up retro-window group hover:scale-[1.02] transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/10 border-b border-border/10">
                    <CardTitle className="text-[10px] font-headline tracking-widest uppercase">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={cn('h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity', stat.color)} />
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-headline tracking-tighter">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>


        <div className="grid gap-8 md:grid-cols-2">
          <Card
            className="animate-fade-in-up retro-window"
            style={{ animationDelay: '300ms' }}
          >
            <CardHeader className="bg-secondary/10 border-b border-border/10">
              <CardTitle className="font-headline text-sm tracking-widest uppercase">Your Badges</CardTitle>
              <CardDescription className="font-body text-xs">
                A collection of your achievements so far. Keep it up!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {progressLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin w-4 h-4" /> Loading badges...</div>
              ) : progress?.badges.length === 0 ? (
                <p className="text-sm text-muted-foreground">No badges yet. Complete quizzes to earn some!</p>
              ) : (
                progress?.badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center gap-2" title={badge.description}>
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                      <Award className="w-8 h-8 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-center w-16 truncate">{badge.name}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card
            className="animate-fade-in-up retro-window"
            style={{ animationDelay: '400ms' }}
          >
            <CardHeader className="bg-secondary/10 border-b border-border/10">
              <CardTitle className="flex items-center gap-2 font-headline text-sm tracking-widest uppercase">
                <Sparkles className="text-accent h-4 w-4" />
                For You
              </CardTitle>
              <CardDescription className="font-body text-xs">
                Personalized learning suggestions based on your interests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Generating suggestions...</p>
              ) : error ? (
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              ) : (
                <ul className="space-y-3">
                  {suggestions.slice(0, 3).map((suggestion) => {
                    return (
                      <li key={suggestion}>
                        <Link href="/quizzes">
                          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary transition-colors cursor-pointer">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <span className="font-medium">{suggestion}</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in-up retro-window" style={{ animationDelay: '500ms' }}>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-secondary/10 border-b border-border/10">
            <div>
              <CardTitle className="flex items-center gap-2 font-headline text-sm tracking-widest uppercase">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription className="font-body text-xs">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'You are all caught up.'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-headline text-[10px] h-7 tracking-tighter"
              disabled={unreadCount === 0}
              onClick={markAllAsRead}
            >
              MARK_ALL_AS_READ
            </Button>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet. Complete activities to get updates.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={cn(
                      'rounded-lg border p-3 transition-colors',
                      notification.is_read ? 'bg-muted/30' : 'bg-primary/5 border-primary/30'
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      {!notification.is_read && (
                        <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                          Mark read
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Desktop>
  );
}
