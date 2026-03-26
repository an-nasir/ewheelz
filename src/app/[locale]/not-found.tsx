// src/app/[locale]/not-found.tsx — Funky branded 404 inside locale layout (has NavBar/Footer)
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "This page ran out of charge. Explore Pakistan's top EV resource instead.",
};

const QUICK_LINKS = [
  { href: "/ev",             icon: "⚡", label: "EV Database",     desc: "Browse 17+ EVs" },
  { href: "/compare",        icon: "⚖️", label: "Compare EVs",     desc: "Side-by-side specs" },
  { href: "/charging-map",   icon: "🔌", label: "Charging Map",    desc: "16+ stations" },
  { href: "/emi-calculator", icon: "🏦", label: "EMI Calculator",  desc: "Bank financing" },
  { href: "/peos",           icon: "🇵🇰", label: "EV Quiz",         desc: "Find your EV" },
  { href: "/articles",       icon: "📰", label: "EV News",         desc: "Latest updates" },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden relative bg-[#F6F8FF]">

      {/* Background floating blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle,#6366F1,transparent)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle,#22C55E,transparent)" }} />
      </div>

      <div className="relative text-center max-w-2xl mx-auto">

        {/* Big 404 with glitch shadow */}
        <div className="relative inline-block mb-4">
          <div
            className="text-[8rem] sm:text-[11rem] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#22C55E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>
          {/* Glitch ghost */}
          <div className="absolute top-0.5 left-1 w-full pointer-events-none opacity-15 blur-[3px]"
            style={{
              background: "linear-gradient(135deg,#EF4444,#F59E0B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "inherit",
              fontWeight: "inherit",
              lineHeight: "inherit",
            }}
          >
            404
          </div>
        </div>

        {/* Bouncing emojis */}
        <div className="flex items-center justify-center gap-5 mb-6 text-4xl">
          {["⚡","🚗","🔋"].map((e, i) => (
            <span key={e} className="inline-block animate-bounce"
              style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.2s" }}>
              {e}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          This page ran out of charge 😬
        </h1>
        <p className="text-slate-500 text-base mb-8 max-w-sm mx-auto leading-relaxed">
          It doesn&apos;t exist or may have moved. Pakistan&apos;s best EV content is just a click away though.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
          >
            ← Take me home
          </Link>
          <Link href="/ev"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            ⚡ Browse EVs
          </Link>
        </div>

        {/* Quick links */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Or jump directly to</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E6E9F2] hover:border-indigo-200 hover:shadow-md transition-all group text-left"
            >
              <span className="text-xl">{link.icon}</span>
              <div>
                <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{link.label}</div>
                <div className="text-[11px] text-slate-400">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
