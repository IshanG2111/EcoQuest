import React from 'react';
import { cn } from '@/lib/utils';

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton-shimmer', className)} style={style} />;
}

/** Skeleton for the simplified dashboard layout */
export function DashboardSkeleton() {
  return (
    <div className="dash-skeleton-root">
      {/* Hero skeleton */}
      <div className="skeleton-card" style={{ padding: 'var(--space-6)', minHeight: '140px' }}>
        <Shimmer className="skeleton-text" style={{ width: '60%', height: '1.5rem', marginBottom: 'var(--space-3)' }} />
        <Shimmer className="skeleton-text" style={{ width: '40%', height: '1rem', marginBottom: 'var(--space-4)' }} />
        <Shimmer className="skeleton-text" style={{ width: '80%', height: '6px', borderRadius: '99px' }} />
      </div>

      {/* Stat cards skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton-card" style={{ padding: 'var(--space-4)', minHeight: '100px' }}>
            <Shimmer className="skeleton-circle" style={{ width: '32px', height: '32px', marginBottom: 'var(--space-3)' }} />
            <Shimmer className="skeleton-text" style={{ width: '50%', height: '0.7rem', marginBottom: 'var(--space-2)' }} />
            <Shimmer className="skeleton-text" style={{ width: '70%', height: '1.5rem' }} />
          </div>
        ))}
      </div>

      {/* Next action skeleton */}
      <div className="skeleton-card" style={{ padding: 'var(--space-5)', minHeight: '90px' }}>
        <Shimmer className="skeleton-text" style={{ width: '30%', height: '0.75rem', marginBottom: 'var(--space-3)' }} />
        <Shimmer className="skeleton-text" style={{ width: '80%', height: '1rem', marginBottom: 'var(--space-2)' }} />
        <Shimmer className="skeleton-text" style={{ width: '50%', height: '0.85rem' }} />
      </div>
    </div>
  );
}

/** Skeleton for a card grid (e.g., quizzes page) */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ padding: 'var(--space-5)', minHeight: '180px', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-3)' }}>
          <Shimmer className="skeleton-text" style={{ width: '70%', height: '1rem' }} />
          <Shimmer className="skeleton-text" style={{ width: '90%', height: '0.85rem' }} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Shimmer style={{ width: '60px', height: '22px', borderRadius: '99px' }} />
            <Shimmer style={{ width: '60px', height: '22px', borderRadius: '99px' }} />
          </div>
          <Shimmer style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-md)' }} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a table (e.g., leaderboard) */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'hsl(var(--muted) / 0.2)' }}>
        <Shimmer className="skeleton-text" style={{ width: '40px', height: '0.7rem' }} />
        <Shimmer className="skeleton-text" style={{ flex: 1, height: '0.7rem' }} />
        <Shimmer className="skeleton-text" style={{ width: '80px', height: '0.7rem' }} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid hsl(var(--border) / 0.2)' }}>
          <Shimmer className="skeleton-text" style={{ width: '30px', height: '1rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
            <Shimmer className="skeleton-circle" style={{ width: '32px', height: '32px' }} />
            <Shimmer className="skeleton-text" style={{ width: `${40 + (i * 7) % 40}%`, height: '0.85rem' }} />
          </div>
          <Shimmer className="skeleton-text" style={{ width: '60px', height: '0.85rem' }} />
        </div>
      ))}
    </div>
  );
}

/** Minimal branded loading indicator (for root loading.tsx) */
export function BrandedLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'hsl(var(--background))',
    }}>
      <div className="welcome-logo-mark" style={{ animation: 'dash-pulse 2s ease-in-out infinite' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1 2.5-1.8 6.5" />
          <path d="M10.2 13.5C7.8 15.5 5 16 3 16c0-3 1.5-5 4.5-6.5" />
        </svg>
      </div>
    </div>
  );
}
