'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { userProgress, availableActivities } from '@/lib/user-data';
import { quizModules } from '@/lib/quizzes-data';
import { Flame, Star, Award, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Desktop } from '@/components/desktop';
import ProfileCard from '@/components/profile-card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const avatarUrl = 'https://picsum.photos/seed/avatar/300/300';
  const username = user?.displayName ?? 'Eco-Champion';

  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }
    // Replaced AI call with mock data to prevent API errors.
    setIsLoading(true);
    const mockSuggestions = [
      'Sustainable Cities: Innovations for Urban Living',
      'Marine Ecosystems and Ocean Stewardship',
      'Forests: Biodiversity and Conservation',
    ];
    setSuggestions(mockSuggestions);
    setIsLoading(false);
  }, [user, router]);

  const stats = [
    {
      title: 'Eco Points',
      value: userProgress.points.toLocaleString(),
      icon: Star,
      color: 'text-yellow-500',
    },
    {
      title: 'Daily Streak',
      value: `${userProgress.streak} Days`,
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      title: 'Badges Earned',
      value: userProgress.badges.length,
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
                    handle={user?.displayName?.toLowerCase() ?? 'eco_champion'}
                    avatarUrl={avatarUrl}
                    miniAvatarUrl="https://picsum.photos/seed/user-avatar-mini/80/80"
                    status='Online'
                    contactText="View Stats"
                    grainUrl=""
                    behindGradient=""
                    innerGradient=""
                 />
            </div>
            <div className="lg:col-span-2">
                <div>
                  <h1 className="text-3xl font-bold">Welcome Back, {username}!</h1>
                  <p className="text-muted-foreground">
                    Continue your journey to make the world a greener place.
                  </p>
                </div>
                 <div className="grid gap-4 md:grid-cols-3 mt-6">
                  {stats.map((stat, index) => (
                    <Card
                      key={stat.title}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className={cn('h-5 w-5', stat.color)} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </div>
        </div>


        <div className="grid gap-8 md:grid-cols-2">
          <Card
            className="animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>
                A collection of your achievements so far. Keep it up!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {userProgress.badges.map((badge) => (
                <div
                  key={badge.name}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <badge.icon className="w-8 h-8 text-accent pixelated-icon" />
                  </div>
                  <span className="text-xs font-medium">{badge.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card
            className="animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-accent h-6 w-6" />
                For You
              </CardTitle>
              <CardDescription>
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
                    const module = quizModules.find(m => m.title === suggestion);
                    const moduleHref = module ? `/learn/quiz/${module.id}` : '/quizzes';
                    return (
                      <li key={suggestion}>
                        <Link href={moduleHref}>
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
      </div>
    </Desktop>
  );
}
