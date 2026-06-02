'use client';

import { useUserProgress } from "@/hooks/useUserProgress";
import { Award, Flame, Star, X, Recycle, Wind, Droplets, Sprout, Leaf } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import './DailyBriefingWidget.css';

const ICON_MAP: Record<string, any> = {
  Recycle,
  Wind,
  Droplets,
  Sprout,
  Leaf
};

export function DailyBriefingWidget({ onClose }: { onClose?: () => void }) {
  const { progress, isLoading } = useUserProgress();

  const points = progress?.points ?? 0;
  const streak = progress?.streak ?? 0;
  const badges = progress?.badges ?? [];

  const stats = [
    {
      title: 'Eco Points',
      value: points.toLocaleString(),
      icon: Star,
      color: 'text-yellow-400',
    },
    {
      title: 'Daily Streak',
      value: `${streak} Days`,
      icon: Flame,
      color: 'text-orange-400',
    },
    {
      title: 'Badges Earned',
      value: badges.length,
      icon: Award,
      color: 'text-blue-400',
    },
  ];

  return (
    <div className="daily-briefing-widget font-body">

      {isLoading ? (
        <div className="space-y-3 py-2">
          <Skeleton className="h-6 w-full bg-white/5" />
          <Skeleton className="h-6 w-full bg-white/5" />
          <Skeleton className="h-6 w-full bg-white/5" />
        </div>
      ) : (
        <ul className="space-y-3">
          {stats.map(stat => (
            <li key={stat.title} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs font-code font-medium text-foreground">{stat.title}</span>
              </div>
              <span className="font-code font-bold text-sm text-primary">{stat.value}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-3 border-t-2 border-dashed border-border">
        <h4 className="font-body text-sm text-primary mb-2">BADGES</h4>
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
          </div>
        ) : badges.length === 0 ? (
          <p className="text-[11px] font-code text-muted-foreground/60 italic">No badges earned yet. Complete quizzes to earn badges!</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => {
              const Icon = ICON_MAP[badge.icon_key] || Award;
              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1"
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/50 border-2 border-secondary flex items-center justify-center hover:scale-105 transition-transform duration-200">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-[8px] font-code text-muted-foreground uppercase text-center mt-1 truncate max-w-[55px]">{badge.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
