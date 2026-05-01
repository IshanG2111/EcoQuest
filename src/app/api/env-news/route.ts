import { NextResponse } from 'next/server';

// Simple keyword helpers
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (/wildfire|forest fire|blaze/.test(t)) return 'wildfire';
  if (/flood|hurricane|cyclone|storm|tornado/.test(t)) return 'extreme-weather';
  if (/climate|carbon|emissions|greenhouse|warming|temperature/.test(t)) return 'climate';
  if (/wildlife|species|extinction|biodiversity|coral|animal/.test(t)) return 'wildlife';
  if (/plastic|pollution|toxic|contamination|smog/.test(t)) return 'pollution';
  if (/solar|wind|renewable|energy|clean power|battery/.test(t)) return 'energy';
  if (/recycle|waste|circular|compost/.test(t)) return 'waste';
  if (/ocean|sea|marine|fish|reef|whale/.test(t)) return 'ocean';
  return 'environment';
}

function scoreImpact(text: string): number {
  const t = text.toLowerCase();
  let score = 45;
  if (/record|highest|worst|crisis|emergency|catastrophic|unprecedented/.test(t)) score += 35;
  if (/breakthrough|solution|innovation|milestone|success/.test(t)) score += 20;
  if (/warn|alert|threat|risk/.test(t)) score += 15;
  if (/study|research|scientists|report/.test(t)) score += 10;
  return Math.min(score, 100);
}

function detectSentiment(title: string): 'positive' | 'negative' | 'neutral' {
  const t = title.toLowerCase();
  if (/breakthrough|success|solution|win|milestone|clean|protect|restore|achieve|improve/.test(t)) return 'positive';
  if (/crisis|threat|destroy|loss|extinct|pollution|flood|fire|collapse|dead|die|drop|fall/.test(t)) return 'negative';
  return 'neutral';
}

// Try rss2json proxy
async function tryRss2Json(url: string, source: string): Promise<any[]> {
  const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=10&api_key=`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) return [];
  const data = await res.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) return [];
  return data.items
    .map((item: any) => {
      const title = (item.title ?? '').trim();
      const desc = (item.description ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 220);
      const combined = `${title} ${desc}`;
      return {
        title,
        description: desc,
        url: item.link ?? item.guid ?? '',
        image: item.thumbnail || item.enclosure?.link || null,
        source,
        publishedAt: item.pubDate ?? new Date().toISOString(),
        category: detectCategory(combined),
        impactScore: scoreImpact(combined),
        sentiment: detectSentiment(title),
      };
    })
    .filter((a: any) => a.title && a.url);
}

// Try fetching the RSS directly and parsing XML
async function tryDirectRss(url: string, source: string): Promise<any[]> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    headers: { 'User-Agent': 'EcoQuest/1.0 (+https://ecoquest.app)' },
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const items: any[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const get = (re: RegExp) => re.exec(block)?.[1]?.trim() ?? '';
    const title = get(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const link  = get(/<link>(.*?)<\/link>/) || get(/<link[^>]+href="([^"]+)"/);
    const desc  = get(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/).replace(/<[^>]+>/g, '').trim().slice(0, 220);
    const date  = get(/<pubDate>(.*?)<\/pubDate>/);
    const img   = (/<media:thumbnail[^>]+url="([^"]+)"/.exec(block) || /<media:content[^>]+url="([^"]+)"/.exec(block))?.[1] ?? null;
    const combined = `${title} ${desc}`;
    if (title && link) {
      items.push({ title, description: desc, url: link, image: img, source, publishedAt: date, category: detectCategory(combined), impactScore: scoreImpact(combined), sentiment: detectSentiment(title) });
    }
  }
  return items;
}

// Hardcoded curated fallback articles (always shown if live fetch fails)
const FALLBACK_ARTICLES = [
  { title: 'Global CO₂ Levels Hit New Record High in 2024', description: 'Scientists report atmospheric carbon dioxide concentrations have reached unprecedented levels, accelerating the need for urgent climate action.', url: 'https://www.bbc.com/news/science-environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'climate', impactScore: 95, sentiment: 'negative' as const },
  { title: 'Solar Power Capacity Doubles Globally for Third Consecutive Year', description: 'Renewable energy installations are outpacing fossil fuel growth in most G20 nations, driven by falling panel costs and government incentives.', url: 'https://www.theguardian.com/environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'energy', impactScore: 82, sentiment: 'positive' as const },
  { title: 'Amazon Rainforest Deforestation Falls 50% in Brazil', description: 'Satellite monitoring shows significant reduction in illegal logging after stricter enforcement and international pressure on supply chains.', url: 'https://www.theguardian.com/environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'wildlife', impactScore: 88, sentiment: 'positive' as const },
  { title: 'Great Barrier Reef Faces Another Mass Bleaching Event', description: 'Warming ocean temperatures have triggered the fifth mass bleaching event in eight years, threatening the UNESCO World Heritage site.', url: 'https://www.bbc.com/news/science-environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'ocean', impactScore: 92, sentiment: 'negative' as const },
  { title: 'EU Bans Single-Use Plastics Across 27 Member States', description: 'The European Union enforcement of its plastics directive is reducing marine litter by an estimated 30% along coastal monitoring zones.', url: 'https://www.theguardian.com/environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'pollution', impactScore: 75, sentiment: 'positive' as const },
  { title: 'Arctic Sea Ice Extent Hits Second-Lowest on Record', description: 'Summer melt season results show Arctic sea ice declining at 13% per decade, with scientists warning of accelerating permafrost thaw.', url: 'https://www.bbc.com/news/science-environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'climate', impactScore: 90, sentiment: 'negative' as const },
  { title: 'Scientists Discover 100+ New Deep-Sea Species Near Hydrothermal Vents', description: 'An expedition to the Pacific Ocean floor has catalogued over 100 previously unknown species, highlighting the importance of marine conservation.', url: 'https://www.theguardian.com/environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'ocean', impactScore: 70, sentiment: 'positive' as const },
  { title: 'India Deploys 100 GW of Solar by 2026 — Ahead of Schedule', description: 'The Indian government reports its renewable energy push is 18 months ahead of target, creating 800,000 green jobs in the process.', url: 'https://www.theguardian.com/environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'energy', impactScore: 80, sentiment: 'positive' as const },
  { title: 'Wildfire Season Extends Year-Round Across Southern Europe', description: 'Climate scientists warn that the traditional summer wildfire window has expanded to cover 9 months of the year across the Mediterranean basin.', url: 'https://www.bbc.com/news/science-environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'wildfire', impactScore: 88, sentiment: 'negative' as const },
  { title: 'Global Plastic Recycling Rate Stuck at 9% Despite Pledges', description: 'A UN report finds that despite corporate commitments, the global plastic recycling rate has barely moved, with most plastic still going to landfill.', url: 'https://www.bbc.com/news/science-environment', image: null, source: 'EcoQuest Digest', publishedAt: new Date().toISOString(), category: 'waste', impactScore: 77, sentiment: 'negative' as const },
];

const FEED_SOURCES = [
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', name: 'BBC Environment' },
  { url: 'https://www.theguardian.com/environment/rss', name: 'The Guardian' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', name: 'NYT Climate' },
  { url: 'https://earthobservatory.nasa.gov/feeds/earth-observatory.rss', name: 'NASA Earth' },
];

export async function GET() {
  // Try all feeds concurrently with two strategies each
  const fetchTasks = FEED_SOURCES.flatMap(f => [
    tryRss2Json(f.url, f.name).catch(() => [] as any[]),
    tryDirectRss(f.url, f.name).catch(() => [] as any[]),
  ]);

  const results = await Promise.allSettled(fetchTasks);
  const live: any[] = [];
  results.forEach(r => { if (r.status === 'fulfilled') live.push(...r.value); });

  // De-dupe
  const seen = new Set<string>();
  const deduped = live.filter(a => {
    const key = a.title.slice(0, 50).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => b.impactScore - a.impactScore).slice(0, 20);

  // Merge: live articles first, pad with fallbacks if needed
  const finalArticles = deduped.length >= 5
    ? deduped
    : [...deduped, ...FALLBACK_ARTICLES].slice(0, 15);

  return NextResponse.json(finalArticles, {
    headers: {
      'Cache-Control': 's-maxage=14400, stale-while-revalidate=28800',
    },
  });
}
