'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, RefreshCw, ExternalLink, Zap, Leaf, Flame, Droplets, Wind, Globe, Recycle, Fish, AlertTriangle, Loader2, GripVertical } from 'lucide-react';
import './EcoNewsWidget.css';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string;
  category: string;
  impactScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const CATEGORY_META: Record<string, { label: string; icon: typeof Leaf; color: string }> = {
  climate:         { label: 'Climate',      icon: Globe,        color: '#f97316' },
  wildfire:        { label: 'Wildfire',     icon: Flame,        color: '#ef4444' },
  'extreme-weather': { label: 'Storms',    icon: Wind,         color: '#8b5cf6' },
  wildlife:        { label: 'Wildlife',     icon: Leaf,         color: '#22c55e' },
  pollution:       { label: 'Pollution',    icon: AlertTriangle,color: '#facc15' },
  energy:          { label: 'Energy',       icon: Zap,          color: '#06b6d4' },
  waste:           { label: 'Waste',        icon: Recycle,      color: '#84cc16' },
  ocean:           { label: 'Ocean',        icon: Fish,         color: '#3b82f6' },
  environment:     { label: 'Environ.',     icon: Leaf,         color: '#10b981' },
};

const CATEGORIES = ['all', ...Object.keys(CATEGORY_META)];

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
}

function ImpactBar({ score, sentiment }: { score: number; sentiment: string }) {
  const color = sentiment === 'positive' ? '#22c55e' : sentiment === 'negative' ? '#ef4444' : '#f97316';
  return (
    <div className="enw-impact-wrap">
      <div className="enw-impact-bar" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

const CACHE_KEY = 'ecoquest_news_cache';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours in ms

interface NewsCache {
  articles: NewsArticle[];
  fetchedAt: number;
}

function readCache(): NewsCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: NewsCache = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null; // expired
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(articles: NewsArticle[]) {
  try {
    const cache: NewsCache = { articles, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or disabled — ignore
  }
}

export function EcoNewsWidget({ onClose }: { onClose?: () => void }) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheAge, setCacheAge] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [width, setWidth] = useState(360);
  const [height, setHeight] = useState(520);
  const resizing = useRef<{ dir: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const applyArticles = useCallback((data: NewsArticle[], fetchedAt: number) => {
    setArticles(data);
    const ageMs = Date.now() - fetchedAt;
    const ageMin = Math.round(ageMs / 60_000);
    setCacheAge(ageMin < 2 ? 'just now' : ageMin < 60 ? `${ageMin}m ago` : `${Math.round(ageMin / 60)}h ago`);
  }, []);

  const fetchNews = useCallback(async (force = false) => {
    // 1. Try local cache first (unless forced)
    if (!force) {
      const cached = readCache();
      if (cached) {
        applyArticles(cached.articles, cached.fetchedAt);
        setLoading(false);
        return;
      }
    }
    // 2. Fetch from API
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/env-news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NewsArticle[] = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response format');
      writeCache(data);
      applyArticles(data, Date.now());
    } catch (e: any) {
      // Fall back to stale cache even if expired
      const stale = (() => { try { const r = localStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) as NewsCache : null; } catch { return null; } })();
      if (stale?.articles?.length) {
        applyArticles(stale.articles, stale.fetchedAt);
        setError('Using cached data — live fetch failed');
      } else {
        setError(`Could not load news: ${e.message ?? 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [applyArticles]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // Auto-refresh every 4 hours in the background
  useEffect(() => {
    const interval = setInterval(() => fetchNews(true), CACHE_TTL);
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Resize logic
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!resizing.current) return;
      const { dir, startX, startY, startW, startH } = resizing.current;
      if (dir.includes('e')) setWidth(Math.max(280, startW + e.clientX - startX));
      if (dir.includes('s')) setHeight(Math.max(300, startH + e.clientY - startY));
    }
    function onUp() { resizing.current = null; }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, []);

  const startResize = (e: React.PointerEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    resizing.current = { dir, startX: e.clientX, startY: e.clientY, startW: width, startH: height };
  };

  const filtered = filter === 'all' ? articles : articles.filter(a => a.category === filter);

  return (
    <div className="enw-root" style={{ width, height }}>
      {/* Title bar */}
      <div className="enw-titlebar handle">
        <div className="enw-titlebar-left">
          <span className="enw-title-dot enw-dot-red" />
          <span className="enw-title-dot enw-dot-yellow" />
          <span className="enw-title-dot enw-dot-green" />
          <span className="enw-title-text">ECO_NEWS.RSS</span>
          {cacheAge && !loading && (
            <span className="enw-cache-age">· {cacheAge}</span>
          )}
        </div>
        <div className="enw-titlebar-right">
          <button className="enw-icon-btn" onClick={() => fetchNews(true)} title="Force refresh (bypass cache)" disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'enw-spin' : ''}`} />
          </button>
          {onClose && (
            <button className="enw-icon-btn enw-close-btn" onClick={onClose} title="Close">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="enw-filters">
        {CATEGORIES.map(cat => {
          const meta = CATEGORY_META[cat];
          const Icon = meta?.icon;
          return (
            <button
              key={cat}
              className={`enw-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
              style={filter === cat && meta ? { borderColor: meta.color, color: meta.color } : {}}
            >
              {Icon && <Icon className="h-2.5 w-2.5" />}
              {cat === 'all' ? 'ALL' : meta?.label ?? cat}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="enw-content">
        {loading && (
          <div className="enw-state">
            <Loader2 className="h-6 w-6 enw-spin" />
            <span>FETCHING_NEWS...</span>
          </div>
        )}
        {!loading && error && (
          <div className="enw-state enw-error">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="enw-state">No news found for this category.</div>
        )}
        {!loading && !error && filtered.map((article, i) => {
          const meta = CATEGORY_META[article.category] ?? CATEGORY_META.environment;
          const Icon = meta.icon;
          return (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="enw-article"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt=""
                  className="enw-article-img"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="enw-article-body">
                <div className="enw-article-meta">
                  <span className="enw-cat-badge" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
                    <Icon className="h-2.5 w-2.5" />
                    {meta.label}
                  </span>
                  <span className="enw-source">{article.source}</span>
                  <span className="enw-time">{timeAgo(article.publishedAt)}</span>
                </div>
                <p className="enw-article-title">{article.title}</p>
                {article.description && (
                  <p className="enw-article-desc">{article.description}</p>
                )}
                <div className="enw-article-footer">
                  <ImpactBar score={article.impactScore} sentiment={article.sentiment} />
                  <span className="enw-impact-label">IMPACT: {article.impactScore}</span>
                  <ExternalLink className="h-3 w-3 enw-ext-icon" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Resize handle */}
      <div
        className="enw-resize-se"
        onPointerDown={e => startResize(e, 'se')}
        title="Resize"
      >
        <GripVertical className="h-3 w-3" />
      </div>
    </div>
  );
}
