// src/app/articles/page.tsx — Guides & Articles Hub (JetBrains-inspired design)
import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Article } from "@/types";
import NewsletterWidget from "@/components/NewsletterWidget";

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
  const allArticles = (await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })) as unknown as Article[];

  const categoryFilter = searchParams.category ?? "";
  const filtered = categoryFilter ? allArticles.filter(a => a.category === categoryFilter) : allArticles;
  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);
  const availableCategories = Array.from(new Set(allArticles.map(a => a.category)));

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#8B5CF6 0%,#6366F1 50%,#3B82F6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "300px", height: "300px", borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "15%",
            width: "220px", height: "220px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              📖 EV Knowledge Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              EV Guides &amp; Articles
            </h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl">
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
