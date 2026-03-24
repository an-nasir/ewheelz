// src/app/not-found.tsx — Branded 404 page
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist. Explore Pakistan's top EV resource.",
};

const QUICK_LINKS = [
  { href: "/ev",           icon: "⚡", label: "EV Database",     desc: "Browse all EVs in Pakistan" },
  { href: "/compare",      icon: "⚖️", label: "Compare EVs",     desc: "Side-by-side spec comparison" },
  { href: "/charging-map", icon: "🔌", label: "Charging Map",    desc: "Find stations near you" },
  { href: "/articles",     icon: "📰", label: "Articles",        desc: "EV news & guides" },
];

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "#F6F8FF" }}
    >
      {/* Big 404 badge */}
      <div
        className="text-[120px] font-black leading-none mb-2 select-none"
        style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6,#22C55E)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </div>

      <div className="text-2xl font-bold text-slate-900 mb-2">Page not found</div>
      <p className="text-slate-500 text-center max-w-md mb-10 leading-relaxed">
        The page you are looking for doesn&apos;t exist or may have moved.
        Here are some useful places to go instead:
      </p>

      {/* Quick-link grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-10">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}
          >
            <span className="text-2xl">{l.icon}</span>
            <span className="text-sm font-semibold text-slate-900">{l.label}</span>
            <span className="text-xs text-slate-400 leading-snug">{l.desc}</span>
          </Link>
        ))}
      </div>

      {/* Back home CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          boxShadow: "0 4px 16px rgba(99,102,241,0.30)",
        }}
      >
        ← Back to eWheelz
      </Link>
    </div>
  );
}
