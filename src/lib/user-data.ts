import {
  Recycle,
  Wind,
  Droplets,
  Leaf,
  Sprout,
  Briefcase,
  Users,
  FileQuestion,
  MessageSquare,
  Palette,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface LeaderboardUser {
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

export interface Badge {
  name: string;
  icon: LucideIcon;
}

export interface UserProgress {
  points: number;
  streak: number;
  badges: Badge[];
}

// Re-exporting Lucide icons with new names to match the old component names for easy swapping
export const DailyBriefingIcon = Briefcase;
export const RankingsIcon = Users;
export const QuizzesIcon = FileQuestion;
export const CommsIcon = MessageSquare;
export const ThemesIcon = Palette;

export const leaderboardData: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'GaiaGuard',
    score: 5280,
    avatar: 'https://picsum.photos/seed/avatar1/40/40',
  },
  {
    rank: 2,
    name: 'EcoWarrior',
    score: 5010,
    avatar: 'https://picsum.photos/seed/avatar2/40/40',
  },
  {
    rank: 3,
    name: 'PlanetProtector',
    score: 4890,
    avatar: 'https://picsum.photos/seed/avatar3/40/40',
  },
  {
    rank: 4,
    name: 'GreenThumb',
    score: 4520,
    avatar: 'https://picsum.photos/seed/avatar4/40/40',
  },
  {
    rank: 5,
    name: 'AquaSavvy',
    score: 4300,
    avatar: 'https://picsum.photos/seed/avatar5/40/40',
  },
  {
    rank: 6,
    name: 'SolarFlare',
    score: 4150,
    avatar: 'https://picsum.photos/seed/avatar6/40/40',
  },
  {
    rank: 7,
    name: 'You',
    score: 3980,
    avatar: 'https://picsum.photos/seed/you/40/40',
  },
  {
    rank: 8,
    name: 'RecycleRex',
    score: 3800,
    avatar: 'https://picsum.photos/seed/avatar8/40/40',
  },
];

export const userProgress: UserProgress = {
  points: 3980,
  streak: 5,
  badges: [
    { name: 'Recycling Rookie', icon: Recycle },
    { name: 'Energy Saver', icon: Wind },
    { name: 'Water Wizard', icon: Droplets },
    { name: 'First Steps', icon: Sprout },
    { name: 'Green Learner', icon: Leaf },
  ],
};

export const availableActivities: string[] = [
    'Sustainable Cities: Innovations for Urban Living',
    'Marine Ecosystems and Ocean Stewardship',
    'Polar Environments and Arctic Challenges',
    'Forests: Biodiversity and Conservation',
    'Sustainable Waste Management and Recycling'
];
