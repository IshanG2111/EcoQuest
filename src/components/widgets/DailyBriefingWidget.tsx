'use client';
import { userProgress } from "@/lib/user-data";
import { Award, Flame, Star } from "lucide-react";
import './DailyBriefingWidget.css';

export function DailyBriefingWidget() {
    const stats = [
        {
          title: 'Eco Points',
          value: userProgress.points.toLocaleString(),
          icon: Star,
          color: 'text-yellow-400',
        },
        {
          title: 'Daily Streak',
          value: `${userProgress.streak} Days`,
          icon: Flame,
          color: 'text-orange-400',
        },
        {
          title: 'Badges Earned',
          value: userProgress.badges.length,
          icon: Award,
          color: 'text-blue-400',
        },
      ];

    return (
        <div className="daily-briefing-widget">
            <ul className="space-y-3">
                {stats.map(stat => (
                    <li key={stat.title} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <stat.icon className={`h-5 w-5 ${stat.color}`} />
                         <span className="font-body text-sm">{stat.title}</span>
                       </div>
                       <span className="font-code font-bold text-lg">{stat.value}</span>
                    </li>
                ))}
            </ul>
             <div className="mt-4 pt-3 border-t-2 border-dashed border-border">
                <h4 className="font-headline text-xs text-primary mb-2">BADGES</h4>
                <div className="flex flex-wrap gap-3">
                {userProgress.badges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                        <div
                        key={badge.name}
                        className="flex flex-col items-center gap-1"
                        title={badge.name}
                        >
                        <div className="w-10 h-10 rounded-full bg-secondary/50 border-2 border-secondary flex items-center justify-center">
                            <Icon className="w-6 h-6 text-accent" />
                        </div>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    )
}
