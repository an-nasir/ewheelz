"use client";
// src/components/AnimatedHero.tsx
// Full-width background image hero with left-aligned text overlay.

import Link from "next/link";

interface Props { totalListings?: number }

export default function AnimatedHero({ totalListings = 0 }: Props) {
  return (
    <section style={{
      backgroundImage: "url(https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&q=85)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      position: "relative",
      overflow: "hidden",
      minHeight: "480px",
    }}>
      {/* Dark overlay — heavier on left, fades right */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(9,11,30,0.96) 0%, rgba(15,23,42,0.88) 42%, rgba(15,23,42,0.55) 70%, rgba(15,23,42,0.15) 100%)",
      }} />

      {/* Bottom fade — transitions into the light section below */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
        background: "linear-gradient(to top, #ffffff, transparent)",
      }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: "rgba(99,102,241,0.18)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.35)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Pakistan&apos;s EV Marketplace
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] text-white mb-4">
            Buy &amp; sell used EVs<br />
            <span style={{
              background: "linear-gradient(90deg,#34D399 0%,#60A5FA 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              without getting screwed
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-7 leading-relaxed">
            Battery grades on every listing. Real market prices.<br />
            Paste any OLX ad — get an instant deal verdict.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link href="/listings"
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              Browse Listings →
            </Link>
            <Link href="/listings/post"
              className="px-6 py-3 rounded-xl text-sm font-black transition-all hover:bg-white/10"
              style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#CBD5E1" }}>
              Sell Your EV — Free
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            {[
              { val: totalListings > 0 ? `${totalListings}+` : "Live", label: "Active Listings" },
              { val: "A–F",  label: "Battery Grades" },
              { val: "Free", label: "To List & Search" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-xl font-black text-white">{val}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards — desktop only, positioned right */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {/* Battery grade */}
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(9,11,30,0.88)", backdropFilter: "blur(16px)", border: "1px solid rgba(34,197,94,0.35)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shrink-0"
              style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)", color: "#fff", boxShadow: "0 2px 12px rgba(34,197,94,0.4)" }}>
              A
            </div>
            <div>
              <div className="text-[10px] text-green-400 font-black uppercase tracking-widest">Battery Grade</div>
              <div className="text-sm text-white font-black">Excellent · 95%</div>
            </div>
          </div>

          {/* Market value */}
          <div className="rounded-2xl px-4 py-3"
            style={{ background: "rgba(9,11,30,0.88)", backdropFilter: "blur(16px)", border: "1px solid rgba(99,102,241,0.35)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
            <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">Market Value</div>
            <div className="text-xl font-black text-white">PKR 8.2M</div>
            <div className="text-xs text-emerald-400 font-bold mt-0.5">↓ 12% below avg · Fair deal</div>
          </div>

          {/* Verified */}
          <div className="rounded-xl px-3 py-2 flex items-center gap-2"
            style={{ background: "rgba(99,102,241,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(99,102,241,0.35)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white font-black">eWheelz Verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
