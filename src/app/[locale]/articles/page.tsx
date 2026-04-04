// src/app/articles/page.tsx — Guides & Articles Hub + Live EV News Aggregator
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Article } from "@/types";
import NewsletterWidget from "@/components/NewsletterWidget";

// ── RSS news fetcher (server-side, cached 1h) ─────────────────────────────────
const EV_KEYWORDS = ["electric", "EV", "BYD", "Tesla", "MG ZS", "Hyundai", "battery", "charging", "hybrid", "PHEV", "Deepal", "Changan", "Xpeng", "electric car", "electric vehicle"];

function isEVRelated(text: string) {
  const l = text.toLowerCase();
  return EV_KEYWORDS.some(k => l.includes(k.toLowerCase()));
}

function parseItems(xml: string, source: string, flag: string) {
  const out: { title: string; link: string; pubDate: string; source: string; flag: string; excerpt: string }[] = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const title   = (/<title><!\[CDATA\[([\s\S]*?)\]\]>/.exec(b) ?? /<title>([^<]+)<\/title>/.exec(b))?.[1]?.trim() ?? "";
    const link    = (/<link>([^<]+)<\/link>/.exec(b) ?? /<guid>([^<]+)<\/guid>/.exec(b))?.[1]?.trim() ?? "";
    const pubDate = (/<pubDate>([^<]+)<\/pubDate>/.exec(b))?.[1]?.trim() ?? "";
    const desc    = (/<description><!\[CDATA\[([\s\S]*?)\]\]>/.exec(b) ?? /<description>([\s\S]*?)<\/description>/.exec(b))?.[1] ?? "";
    const excerpt = desc.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").slice(0, 140).trim();
    if (title && (isEVRelated(title) || isEVRelated(desc))) out.push({ title, link, pubDate, source, flag, excerpt });
  }
  return out;
}

async function fetchLiveNews() {
  const feeds = [
    { source: "Dawn",            url: "https://www.dawn.com/feeds/home",            flag: "🇵🇰" },
    { source: "The News",        url: "https://www.thenews.com.pk/rss/1/7",         flag: "🇵🇰" },
    { source: "Profit Pakistan", url: "https://profit.pakistantoday.com.pk/feed/",  flag: "🇵🇰" },
    { source: "Electrek",        url: "https://electrek.co/feed/",                  flag: "🌍" },
    { source: "InsideEVs",       url: "https://insideevs.com/rss/articles/",        flag: "🌍" },
  ];
  const results = await Promise.allSettled(
    feeds.map(async f => {
      const r = await fetch(f.url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000), headers: { "User-Agent": "eWheelz/1.0" } });
      return parseItems(await r.text(), f.source, f.flag);
    })
  );
  return results
    .flatMap(r => r.status === "fulfilled" ? r.value : [])
    .sort((a, b) => new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime())
    .slice(0, 20);
}

export const metadata: Metadata = {
  title: "EV Guides & Articles",
  description:
    "Expert guides, comparisons, and news about electric vehicles in Pakistan — battery chemistry, charging, ownership costs, and more.",
};

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { label: string; emoji: string; bg: string; color: string; border: string }> = {
  NEWS:       { label: "News",       emoji: "📰", bg: "#EFF6FF", color: "#2563EB", border: "#93C5FD" },
  GUIDE:      { label: "Guide",      emoji: "📖", bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  REVIEW:     { label: "Review",     emoji: "⭐", bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
  COMPARISON: { label: "Comparison", emoji: "⚖️", bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" },
  MARKET:     { label: "Market",     emoji: "📊", bg: "#FFF7ED", color: "#C2410C", border: "#FDBA74" },
};

function catInfo(cat: string) {
  return CATEGORIES[cat] ?? { label: cat, emoji: "📄", bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
}

// ─── Reading time ─────────────────────────────────────────────────────────────

function readingTime(content: string) {
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

// ─── Format date ──────────────────────────────────────────────────────────────

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
  } catch { return dateStr; }
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const cat = catInfo(article.category);

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="group block h-full">
        <div className="h-full rounded-2xl p-8 flex flex-col hover-lift"
          style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>

          {/* Top accent bar */}
          <div className="h-1 w-12 rounded-full mb-5" style={{ background: `linear-gradient(90deg,${cat.color},${cat.border})` }} />

          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">{cat.emoji}</span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
              Featured · {cat.label}
            </span>
          </div>

          <h2 className="text-xl font-black leading-tight mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors flex-1">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto pt-4 border-t border-[#E6E9F2]">
            <span>{fmtDate(article.publishedAt ?? article.createdAt)}</span>
            <span>·</span>
            <span>{readingTime(article.content)}</span>
            <span className="ml-auto text-indigo-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Read article →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <div className="h-full rounded-xl p-5 flex flex-col hover-lift"
        style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>

        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
            {cat.emoji} {cat.label}
          </span>
          <span className="text-xs text-slate-400">{readingTime(article.content)}</span>
        </div>

        <h2 className="text-sm font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors flex-1">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#E6E9F2]">
          <span className="text-xs text-slate-400">{fmtDate(article.publishedAt ?? article.createdAt)}</span>
          <span className="text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlesPage({ searchParams }: { searchParams: { category?: string } }) {
  const [allArticles, liveNews] = await Promise.all([
    prisma.article.findMany({ where: { published: true }, orderBy: { publishedAt: "desc" } })
      .then(r => r as unknown as Article[]),
    fetchLiveNews().catch(() => [] as { title: string; link: string; pubDate: string; source: string; flag: string; excerpt: string }[]),
  ]);

  const categoryFilter = searchParams.category ?? "";
  const filtered = categoryFilter ? allArticles.filter(a => a.category === categoryFilter) : allArticles;
  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);
  const availableCategories = Array.from(new Set(allArticles.map(a => a.category)));

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Dark image hero ── */}
      <div style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1400&q=80)",
        backgroundSize: "cover", backgroundPosition: "center 40%", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(9,11,30,0.97) 0%,rgba(15,23,42,0.90) 55%,rgba(15,23,42,0.5) 100%)" }} />
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
              style={{ background: "rgba(99,102,241,0.18)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.35)" }}>
              📖 EV Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              EV Guides &amp; Articles
            </h1>
            <p className="text-slate-400 text-lg mb-6 max-w-xl">
              Expert analysis, comparisons, and ownership guides for Pakistan EV buyers
            </p>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              <Link href="/articles"
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={!categoryFilter
                  ? { background: "#FFFFFF", color: "#4F46E5", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }
                  : { background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }
                }>
                All
              </Link>
              {availableCategories.map(cat => {
                const info = catInfo(cat);
                return (
                  <Link key={cat} href={`/articles?category=${cat}`}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                    style={categoryFilter === cat
                      ? { background: "#FFFFFF", color: "#4F46E5", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }
                      : { background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }
                    }>
                    {info.emoji} {info.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 text-sm">No articles in this category yet.</p>
            <Link href="/articles" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
              View all articles
            </Link>
          </div>
        )}

        {/* Featured Article */}
        {featured && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Featured</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <ArticleCard article={featured} featured />
              </div>
              {rest.slice(0, 2).length > 0 && (
                <div className="lg:col-span-2 flex flex-col gap-5">
                  {rest.slice(0, 2).map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of articles grid */}
        {rest.slice(2).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">More Articles</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.slice(2).map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        )}

        {/* ── Live EV News Stream ── */}
        {liveNews.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Live EV News</span>
              <span className="text-xs text-slate-400">— auto-updated from Dawn, Electrek, InsideEVs &amp; more</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveNews.map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="group rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-all"
                  style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{item.flag}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.source}</span>
                    {item.pubDate && (
                      <span className="ml-auto text-[10px] text-slate-300">
                        {new Date(item.pubDate).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.excerpt}</div>
                  )}
                  <div className="text-xs font-bold text-indigo-500 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    Read on {item.source} →
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Topics Guide */}
        <div className="mb-6 rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
          <h2 className="text-base font-bold text-slate-900 mb-4">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji: "🔋", label: "Battery Chemistry", href: "/batteries", bg: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", color: "#16A34A", border: "#86EFAC" },
              { emoji: "⚡", label: "Charging Stations",  href: "/charging",  bg: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", color: "#B45309", border: "#FCD34D" },
              { emoji: "⚖️", label: "EV Comparisons",    href: "/compare",   bg: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", color: "#7C3AED", border: "#C4B5FD" },
              { emoji: "🚗", label: "EV Database",        href: "/ev",        bg: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", color: "#4F46E5", border: "#A5B4FC" },
            ].map(t => (
              <Link key={t.href} href={t.href}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl text-center hover-lift-sm"
                style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-semibold" style={{ color: t.color }}>{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter CTA — live, stores to DB + sends welcome email via Resend */}
        <NewsletterWidget source="article_inline" variant="banner" />
      </div>
    </div>
  );
}
