// src/app/articles/[slug]/page.tsx — Article detail page
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Article } from "@/types";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = (await prisma.article.findUnique({
    where: { slug: params.slug },
  })) as Article | null;

  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, { label: string; emoji: string; bg: string; color: string; border: string }> = {
  NEWS:       { label: "News",       emoji: "📰", bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  GUIDE:      { label: "Guide",      emoji: "📖", bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  REVIEW:     { label: "Review",     emoji: "⭐", bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
  COMPARISON: { label: "Comparison", emoji: "⚖️", bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" },
  MARKET:     { label: "Market",     emoji: "📊", bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
};

function catInfo(cat: string) {
  return CATEGORIES[cat] ?? { label: cat, emoji: "📄", bg: "#F6F8FF", color: "#64748B", border: "#E6E9F2" };
}

function readingTime(content: string) {
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Simple markdown-ish renderer — converts newlines to paragraphs
function renderContent(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => {
    if (p.startsWith("# ")) {
      return (
        <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-3">
          {p.slice(2)}
        </h2>
      );
    }
    if (p.startsWith("## ")) {
      return (
        <h3 key={i} className="text-base font-semibold text-slate-800 mt-6 mb-2">
          {p.slice(3)}
        </h3>
      );
    }
    if (p.startsWith("- ") || p.startsWith("* ")) {
      const items = p.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("* "));
      return (
        <ul key={i} className="list-disc list-inside space-y-1 text-slate-600 text-sm my-3">
          {items.map((item, j) => (
            <li key={j}>{item.slice(2)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="text-slate-600 text-sm leading-relaxed">
        {p}
      </p>
    );
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = (await prisma.article.findUnique({
    where: { slug: params.slug },
  })) as Article | null;

  if (!article || !article.published) notFound();

  const cat = catInfo(article.category);

  // Related articles (same category, excluding current)
  const allArticles = (await prisma.article.findMany({
    where: { published: true },
  })) as unknown as Article[];
  const related = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span>›</span>
        <Link href="/articles" className="hover:text-indigo-600 transition-colors">Articles</Link>
        <span>›</span>
        <span className="text-slate-400 truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}
          >
            {cat.emoji} {cat.label}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-xs text-slate-400">{readingTime(article.content)}</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">{article.title}</h1>

        {article.excerpt && (
          <p className="text-slate-600 text-base leading-relaxed pl-4" style={{ borderLeft: "4px solid #22C55E" }}>
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
          <span>eWheelz Editorial</span>
          <span>·</span>
          <span>{fmtDate(article.publishedAt ?? article.createdAt)}</span>
        </div>
      </header>

      {/* Article Body */}
      <article className="rounded-xl p-6 space-y-4 mb-12" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
        {renderContent(article.content)}
      </article>

      {/* Back link */}
      <div className="pt-6 mb-8" style={{ borderTop: "1px solid #E6E9F2" }}>
        <Link
          href="/articles"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          ← Back to all articles
        </Link>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
            <h2 className="text-base font-semibold text-slate-800">Related Articles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((a) => {
              const rc = catInfo(a.category);
              return (
                <Link key={a.id} href={`/articles/${a.slug}`} className="group block">
                  <div className="rounded-xl p-4 transition-all h-full group-hover:-translate-y-1"
                    style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.04)" }}>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                      style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
                    >
                      {rc.emoji} {rc.label}
                    </span>
                    <div className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                      {a.title}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
