'use client';

import { useState, useEffect } from 'react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useNotifications } from '@/hooks/useNotifications';
import {
  Flame, Star, Award, Sparkles, BookOpen, AlertTriangle,
  Loader2, Bell, Copy, BarChart2, ChevronRight, Leaf,
  Globe, Zap, Shield, Clock, TrendingUp, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Desktop } from '@/components/desktop';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';

// Eco Points progress percentage
function xpPercent(points: number) {
  const level = Math.floor(points / 500) + 1;
  const levelMin = (level - 1) * 500;
  const levelMax = level * 500;
  return { level, pct: Math.round(((points - levelMin) / (levelMax - levelMin)) * 100), levelMax };
}

const LEVEL_NAMES = ['Seedling', 'Sprout', 'Sapling', 'Eco Warrior', 'Green Knight', 'Earth Guardian', 'Planet Protector'];

const SUGGESTIONS = [
  {
    title: 'Sustainable Cities: Innovations for Urban Living',
    desc: 'Learn how cities are becoming greener and smarter.',
    readTime: '12 min read',
    tag: 'RECOMMENDED',
    href: '/quizzes',
    img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=160&q=80',
  },
  {
    title: 'Marine Ecosystems and Ocean Stewardship',
    desc: 'Dive deep into ocean conservation strategies.',
    readTime: '8 min read',
    tag: 'POPULAR',
    href: '/quizzes',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160&q=80',
  },
  {
    title: 'Forests: Biodiversity and Conservation',
    desc: 'Explore why forests are the lungs of the Earth.',
    readTime: '10 min read',
    tag: 'NEW',
    href: '/quizzes',
    img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=160&q=80',
  },
];

export default function DashboardPage() {
  const [copied, setCopied] = useState(false);
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

  const avatarUrl = getAvatarUrl(user?.id || user?.name);
  const username = user?.name ?? 'Eco-Champion';
  const handle = (user?.name ?? 'eco_champion').toLowerCase().replace(/\s+/g, '_');

  const pts = progress?.points ?? 0;
  const streak = progress?.streak ?? 0;
  const badges = progress?.badges ?? [];
  const { level, pct, levelMax } = xpPercent(pts);
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? 'Eco Warrior';

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  function handleCopy() {
    navigator.clipboard.writeText(`@${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Desktop>
      <div className="dash-root animate-in fade-in duration-500">
        {/* ── LEFT PANEL ── */}
        <aside className="dash-sidebar">
          {/* name + title */}
          <div className="dash-profile-header">
            <div className="dash-profile-name">{username}</div>
            <div className="dash-profile-title">
              <Leaf className="dash-leaf-icon" />
              Eco-Champion
            </div>
          </div>

          {/* avatar */}
          <div className="dash-avatar-ring">
            <div className="dash-avatar-glow" />
            <img
              src={avatarUrl}
              alt={username}
              className="dash-avatar-img"
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0.4'; }}
            />
            <div className="dash-avatar-badge">
              <Leaf className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* status row */}
          <div className="dash-status-row">
            <span className="dash-online-dot" />
            <span className="dash-online-text">Online</span>
          </div>

          {/* handle */}
          <div className="dash-handle-row">
            <span className="dash-handle-text">@{handle}</span>
            <button
              className="dash-copy-btn"
              onClick={handleCopy}
              title="Copy handle"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* view stats btn */}
          <Link href="/leaderboard" className="dash-view-stats-btn">
            <BarChart2 className="h-4 w-4" />
            View Stats
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>

          {/* level card */}
          <div className="dash-level-card">
            <div className="dash-level-badge">{level}</div>
            <div className="dash-level-info">
              <div className="dash-level-name">{levelName}</div>
              <div className="dash-xp-bar-wrap">
                <div className="dash-xp-bar" style={{ width: `${pct}%` }} />
              </div>
              <div className="dash-xp-label">
                {progressLoading ? (
                  <Skeleton className="h-3 w-20 bg-primary/20" />
                ) : (
                  `${pts.toLocaleString()} / ${levelMax.toLocaleString()} XP`
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="dash-main">
          {/* ── TOP BAR ── */}
          <div className="dash-topbar">
            <div className="dash-topbar-date">
              <span className="dash-topbar-date-icon">📅</span>
              {dateStr}
            </div>
            <div className="dash-topbar-right">
              <button className="dash-bell-btn" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="dash-bell-badge">{unreadCount}</span>
                )}
              </button>
              <div className="dash-points-chip">
                <Leaf className="h-4 w-4 text-green-400" />
                <span>{progressLoading ? <Skeleton className="h-4 w-12 bg-white/10" /> : pts.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── WELCOME HERO ── */}
          <section className="dash-hero">
            <div className="dash-hero-text">
              <h1 className="dash-hero-title">
                Welcome Back,<br />
                <span className="dash-hero-username">{username.toUpperCase()}!</span>
              </h1>
              <p className="dash-hero-sub">
                Continue your journey to make the world a greener place.<br />
                <span className="dash-hero-highlight">Every action counts.</span>
              </p>
            </div>
            <div className="dash-hero-globe" aria-hidden>
              <Globe className="h-24 w-24 text-cyan-400 opacity-80" />
              <Leaf className="dash-hero-leaf dash-hero-leaf-1" />
              <Leaf className="dash-hero-leaf dash-hero-leaf-2" />
            </div>
          </section>

          {/* ── STAT CARDS ── */}
          <div className="dash-stats-grid">
            {/* Eco Points */}
            <div className="dash-stat-card dash-stat-green">
              <div className="dash-stat-icon-wrap dash-stat-icon-green">
                <Star className="h-5 w-5" />
              </div>
              <div className="dash-stat-label">ECO POINTS</div>
              <div className="dash-stat-value">
                {progressLoading ? <Skeleton className="h-8 w-24 bg-white/10" /> : pts.toLocaleString()}
              </div>
              <div className="dash-stat-sub">
                <TrendingUp className="h-3 w-3" />
                +320 this week
              </div>
            </div>

            {/* Daily Streak */}
            <div className="dash-stat-card dash-stat-orange">
              <div className="dash-stat-icon-wrap dash-stat-icon-orange">
                <Flame className="h-5 w-5" />
              </div>
              <div className="dash-stat-label">DAILY STREAK</div>
              <div className="dash-stat-value">
                {progressLoading ? <Skeleton className="h-8 w-24 bg-white/10" /> : (
                  <><span>{streak}</span><span className="dash-stat-unit"> Day{streak !== 1 ? 's' : ''}</span></>
                )}
              </div>
              <div className="dash-stat-sub dash-streak-dots">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={cn('dash-streak-dot', i < Math.min(streak, 5) && 'dash-streak-dot-active')} />
                ))}
              </div>
            </div>

            {/* Badges Earned */}
            <div className="dash-stat-card dash-stat-blue">
              <div className="dash-stat-icon-wrap dash-stat-icon-blue">
                <Shield className="h-5 w-5" />
              </div>
              <div className="dash-stat-label">BADGES EARNED</div>
              <div className="dash-stat-value">
                {progressLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : badges.length}
              </div>
              <Link href="/badges" className="dash-stat-sub dash-stat-link">
                View all badges <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* ── BOTTOM GRID ── */}
          <div className="dash-bottom-grid">
            {/* YOUR BADGES */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <div className="dash-panel-title">
                  <Leaf className="h-4 w-4 text-green-400" />
                  YOUR BADGES
                </div>
                <Link href="/badges" className="dash-panel-link">View All <ChevronRight className="h-3 w-3" /></Link>
              </div>
              <p className="dash-panel-desc">A collection of your achievements so far. Keep it up!</p>

              {progressLoading ? (
                <div className="grid grid-cols-3 gap-3 py-4">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="h-12 w-12 rounded-full bg-white/5" />
                        <Skeleton className="h-3 w-16 bg-white/5" />
                     </div>
                   ))}
                </div>
              ) : badges.length === 0 ? (
                <div className="dash-empty-badges">
                  <Award className="h-10 w-10 opacity-30" />
                  <p>No badges yet. Complete quizzes to earn some!</p>
                </div>
              ) : (
                <div className="dash-badges-grid">
                  {badges.map((badge, i) => (
                    <div key={badge.id} className="dash-badge-item" title={badge.description}>
                      <div className={cn('dash-badge-ring', i % 3 === 0 ? 'dash-badge-green' : i % 3 === 1 ? 'dash-badge-teal' : 'dash-badge-gray')}>
                        <Award className="h-7 w-7" />
                      </div>
                      <span className="dash-badge-name">{badge.name}</span>
                      <span className="dash-badge-date">{badge.description?.slice(0, 22)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOR YOU */}
            <div className="dash-panel">
              <div className="dash-panel-header">
                <div className="dash-panel-title">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  FOR YOU
                </div>
              </div>
              <p className="dash-panel-desc">Personalized learning suggestions based on your interests.</p>

              <div className="dash-suggestions">
                {SUGGESTIONS.slice(0, 2).map((s) => (
                  <Link key={s.title} href={s.href} className="dash-suggestion-card group">
                    <img src={s.img} alt={s.title} className="dash-suggestion-img" />
                    <div className="dash-suggestion-body">
                      <span className="dash-suggestion-tag">{s.tag}</span>
                      <p className="dash-suggestion-title group-hover:text-primary transition-colors">{s.title}</p>
                      <p className="dash-suggestion-desc">{s.desc}</p>
                      <div className="dash-suggestion-footer">
                        <span className="dash-suggestion-time"><Clock className="h-3 w-3" /> {s.readTime}</span>
                        <span className="dash-suggestion-cta">Start Learning <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="dash-footer">
            <Leaf className="h-4 w-4 text-green-400" />
            Together, we build a better planet.
          </footer>
        </main>
      </div>
    </Desktop>
  );
}
