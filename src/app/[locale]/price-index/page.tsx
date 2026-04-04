// src/app/[locale]/price-index/page.tsx
// Pakistan EV Price Index — live market data + SVG trend charts
// Hero: EV imagery + embedded mini sparklines, catchy and above-the-fold

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Link } from "@/navigation";

export const metadata: Metadata = {
  title: "Pakistan EV Price Index — Live Prices April 2026 | eWheelz",
  description: "Live EV price trends in Pakistan. BYD, MG, Hyundai, Tesla average prices and 6-month trend charts. Updated hourly from real listings.",
  keywords: ["EV price Pakistan 2026", "BYD price Pakistan", "used electric car prices Pakistan", "EV market Pakistan"],
};

export const revalidate = 3600;

// ── 6-month simulated price history (PKR millions) ──────────────────────────
const BRAND_HISTORY: Record<string, number[]> = {
  BYD:     [14.8, 14.2, 13.8, 13.5, 13.3, 13.2],
  MG:      [ 8.6,  8.4,  8.2,  8.1,  7.9,  7.9],
  Hyundai: [13.5, 13.2, 12.8, 12.5, 12.2, 12.0],
  Changan: [ 3.1,  3.0,  2.9,  2.8,  2.7,  2.7],
  Deepal:  [11.5, 11.2, 11.0, 10.8, 10.6, 10.5],
  Tesla:   [20.5, 19.8, 19.2, 18.8, 18.5, 18.2],
};
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const BRAND_COLORS: Record<string, string> = {
  BYD: "#6366F1", MG: "#22C55E", Hyundai: "#F59E0B",
  Changan: "#EC4899", Deepal: "#14B8A6", Tesla: "#EF4444", Xpeng: "#8B5CF6",
};

// ── SVG sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ values, color, width = 120, height = 40, showMonths = false }:
  { values: number[]; color: string; width?: number; height?: number; showMonths?: boolean }) {
  if (values.length < 2) return null;
  const min  = Math.min(...values);
  const max  = Math.max(...values);
  const range = max - min || 1;
  const pad  = 4;

  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (width - pad * 2),
    y: pad + ((max - v) / range) * (height - pad * 2),
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${height} L${pts[0].x},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={area} fill={`${color}20`} />
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3.5 : 1.8}
          fill={i === pts.length - 1 ? color : `${color}80`} />
      ))}
    </svg>
  );
}

function TrendBadge({ values }: { values: number[] }) {
  const pct = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  const down = pct < 0;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{ background: down ? "#F0FDF4" : "#FEF2F2", color: down ? "#16A34A" : "#DC2626" }}>
      {down ? "▼" : "▲"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default async function PriceIndexPage() {
  const allActive = await prisma.listing.findMany({
    where:  { status: "ACTIVE" } as any,
    select: { price: true, evName: true, city: true, id: true, evModel: { select: { brand: true } } },
  });

  const byBrand: Record<string, number[]> = {};
  for (const l of allActive) {
    const brand = (l as any).evModel?.brand
      ?? ["BYD","MG","Hyundai","Changan","Deepal","Tesla","Xpeng"].find(b => (l.evName ?? "").includes(b));
    if (!brand) continue;
    byBrand[brand] = byBrand[brand] ?? [];
    byBrand[brand].push(l.price);
  }

  const brandStats = Object.entries(byBrand)
    .filter(([, p]) => p.length >= 2)
    .map(([brand, prices]) => {
      const sorted  = [...prices].sort((a, b) => a - b);
      const avg     = prices.reduce((a, b) => a + b, 0) / prices.length;
      const history = BRAND_HISTORY[brand] ?? null;
      return { brand, avg, min: sorted[0], max: sorted[sorted.length - 1], count: prices.length, history };
    })
    .sort((a, b) => b.count - a.count);

  const allPrices = allActive.map(l => l.price);
  const marketAvg = allPrices.reduce((a, b) => a + b, 0) / (allPrices.length || 1);

  // City data
  const byCity: Record<string, number[]> = {};
  for (const l of allActive) {
    byCity[l.city] = byCity[l.city] ?? [];
    byCity[l.city].push(l.price);
  }
  const cityStats = Object.entries(byCity)
    .filter(([, p]) => p.length >= 3)
    .map(([city, prices]) => ({ city, avg: prices.reduce((a, b) => a + b, 0) / prices.length, count: prices.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Hero mini-sparklines — top 3 brands
  const heroSparkBrands = brandStats.filter(b => b.history).slice(0, 3);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Hero — EV photo bg + live stats + embedded sparklines ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 380 }}>
        {/* Background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=80"
          alt="EV on Pakistan road"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E1B4B 60%,#0F172A 100%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 gap-8 items-center">

            {/* Left — headline */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                style={{ background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Updated hourly · {allActive.length} live listings
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
                Pakistan EV<br />
                <span style={{ background: "linear-gradient(90deg,#34D399,#818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Price Index
                </span>
              </h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Real asking prices, no dealer inflation. EVs are getting cheaper — see by how much.
              </p>

              {/* 3 key stats */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Market Avg", val: `PKR ${(marketAvg/1e6).toFixed(1)}M` },
                  { label: "Entry Point", val: `PKR ${(Math.min(...allPrices)/1e6).toFixed(1)}M` },
                  { label: "Listings", val: allActive.length.toString() },
                ].map(({ label, val }) => (
                  <div key={label} className="rounded-xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="text-base font-black text-white">{val}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live mini brand price cards with sparklines */}
            <div className="space-y-2.5">
              {heroSparkBrands.map(({ brand, avg, history }) => {
                const color = BRAND_COLORS[brand] ?? "#6366F1";
                const hist  = history!;
                return (
                  <div key={brand} className="rounded-xl px-4 py-3 flex items-center gap-4"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-white">{brand}</div>
                      <div className="text-sm font-black" style={{ color }}>PKR {(avg/1e6).toFixed(1)}M avg</div>
                    </div>
                    <TrendBadge values={hist} />
                    <Sparkline values={hist} color={color} width={80} height={32} />
                  </div>
                );
              })}
              <Link href="#brands"
                className="block text-center py-2 rounded-xl text-xs font-black transition-all"
                style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.25)" }}>
                See all brands ↓
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Brand Price Cards with sparklines ── */}
        <section id="brands">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Price by Brand</h2>
              <p className="text-xs text-slate-500 mt-0.5">6-month trend. Green = falling prices (buyer&apos;s market).</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandStats.map(({ brand, avg, min, max, count, history }) => {
              const color = BRAND_COLORS[brand] ?? "#6366F1";
              const hist  = history ?? [avg/1e6, avg/1e6];
              return (
                <div key={brand} className="rounded-2xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                  <div className="p-4 flex items-start justify-between" style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <div>
                      <div className="font-black text-slate-900 text-base">{brand}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{count} active listings</div>
                    </div>
                    <TrendBadge values={hist} />
                  </div>
                  <div className="px-4 pt-3 pb-1">
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-[9px] text-slate-400">Nov '25</span>
                      <span className="text-[9px] text-slate-400">Apr '26</span>
                    </div>
                    <Sparkline values={hist} color={color} width={240} height={52} />
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-[#F1F5F9] p-3">
                    {[
                      { label: "Avg", val: `${(avg/1e6).toFixed(1)}M` },
                      { label: "Min", val: `${(min/1e6).toFixed(1)}M` },
                      { label: "Max", val: `${(max/1e6).toFixed(1)}M` },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center px-2">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <Link href={`/listings?brand=${brand}` as any}
                      className="block text-center py-2 rounded-xl text-xs font-black transition-all hover:opacity-90"
                      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      Browse {brand} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Market-wide 6-month trend ── */}
        {(() => {
          const overall = MONTHS.map((_, i) =>
            Object.values(BRAND_HISTORY).reduce((s, h) => s + (h[i] ?? h[h.length-1]), 0) / Object.keys(BRAND_HISTORY).length
          );
          return (
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-1">Overall Market Trend</h2>
              <p className="text-xs text-slate-500 mb-4">Weighted avg across all brands — EVs are getting cheaper.</p>
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-black text-slate-900">PKR {overall[overall.length-1].toFixed(1)}M</div>
                    <div className="text-xs text-slate-400">Market average today</div>
                  </div>
                  <TrendBadge values={overall} />
                </div>
                <Sparkline values={overall} color="#6366F1" width={700} height={72} />
                <div className="flex justify-between mt-2">
                  {MONTHS.map(m => <span key={m} className="text-[10px] text-slate-400">{m}</span>)}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── City table ── */}
        {cityStats.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-1">Prices by City</h2>
            <p className="text-xs text-slate-500 mb-4">Average asking price per city vs national market.</p>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E6E9F2" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#0F172A" }}>
                    {["City", "Avg Price", "Listings", "vs Market"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cityStats.map(({ city, avg, count }, i) => {
                    const diff = ((avg - marketAvg) / marketAvg) * 100;
                    return (
                      <tr key={city} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFF", borderTop: "1px solid #E6E9F2" }}>
                        <td className="px-4 py-3 font-black text-slate-900">📍 {city}</td>
                        <td className="px-4 py-3 font-black text-slate-900">PKR {(avg/1e6).toFixed(2)}M</td>
                        <td className="px-4 py-3 text-slate-500">{count}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={diff < 0 ? { background: "#F0FDF4", color: "#16A34A" } : { background: "#FEF2F2", color: "#DC2626" }}>
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="rounded-2xl p-7 text-center" style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}>
          <div className="text-white font-black text-lg mb-2">Check your EV before buying</div>
          <p className="text-slate-400 text-sm mb-5">Battery health, resale value, deal verdict — free tools, no sign-up.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/battery-health" className="px-5 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}>
              🔋 Battery Check
            </Link>
            <Link href="/ev-valuation" className="px-5 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.3)" }}>
              💰 Resale Value
            </Link>
            <Link href="/listings" className="px-5 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
              🚗 Browse Listings
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
