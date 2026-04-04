// src/app/[locale]/page.tsx
import { prisma } from "@/lib/prisma";
import { Link } from "@/navigation";
import AnimatedHero from "@/components/AnimatedHero";
import DealChecker from "@/components/DealChecker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eWheelz — Pakistan's Verified Used EV Marketplace",
  description: "Buy and sell used EVs in Pakistan with confidence. Every listing has a battery health grade. No scams, no surprises.",
};

// Brand → Unsplash image map (free, already in next.config allowlist)
const BRAND_IMAGES: Record<string, string> = {
  BYD:     "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500&q=70",
  MG:      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500&q=70",
  Hyundai: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&q=70",
  Changan: "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=500&q=70",
  Deepal:  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&q=70",
  default: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&q=70",
};

const BRANDS = ["BYD", "MG", "Hyundai", "Changan", "Deepal", "Xpeng", "Tesla"];

// ── Listing card with image ────────────────────────────────────────────────────
function ListingCard({ listing, brandAvg }: { listing: any; brandAvg?: number }) {
  const h = listing.batteryHealth;
  const grade = h ? (h >= 90 ? "A" : h >= 80 ? "B" : h >= 70 ? "C" : h >= 60 ? "D" : "F") : null;
  const gradeColor = grade === "A" ? "#16A34A" : grade === "B" ? "#6366F1" : grade === "C" ? "#D97706" : grade === "D" ? "#EA580C" : "#DC2626";
  const brand = listing.evModel?.brand ?? BRANDS.find(b => (listing.evName ?? "").includes(b)) ?? "default";
  const imgUrl = BRAND_IMAGES[brand] ?? BRAND_IMAGES.default;
  const evName = `${listing.evModel?.brand ?? listing.evName ?? ""} ${listing.evModel?.model ?? ""}`.trim();
  const dealGrade = getDealGrade(listing.price, brandAvg ?? null);

  return (
    <div className="rounded-2xl overflow-hidden hover:shadow-lg transition-all"
      style={{ background: "#fff", border: "1px solid #E6E9F2" }}>

      {/* Image with overlay */}
      <div style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover", backgroundPosition: "center",
        height: "148px", position: "relative",
      }}>
        {/* dark gradient bottom */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 55%)" }} />
        {/* Brand pill top-left */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}>
          {brand !== "default" ? brand : "EV"}
        </div>
        {/* Battery grade top-right */}
        {grade && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
            style={{ background: gradeColor, boxShadow: `0 2px 8px ${gradeColor}60` }}>
            {grade}
          </div>
        )}
        {/* Price bottom-left over image */}
        <div className="absolute bottom-3 left-3">
          <div className="text-lg font-black"
            style={{ background: "linear-gradient(90deg,#34D399,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PKR {(listing.price / 1_000_000).toFixed(2)}M
          </div>
        </div>
      </div>

      {/* Deal grade pill */}
      {dealGrade && (
        <div className="px-4 pt-3 pb-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
            style={{ color: dealGrade.color, background: dealGrade.bg, border: `1px solid ${dealGrade.color}30` }}>
            {dealGrade.label}
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="p-4 pt-2">
        <div className="font-black text-slate-900 text-sm leading-tight mb-1">{evName || "Electric Vehicle"}</div>
        <div className="text-xs text-slate-400 flex gap-3">
          <span>{listing.year}</span>
          <span>📍 {listing.city}</span>
          {listing.mileage && <span>{listing.mileage.toLocaleString()} km</span>}
        </div>
      </div>

      {/* CTA row */}
      <div className="grid grid-cols-3 border-t border-[#E6E9F2]">
        <Link href={`/listings/${listing.id}` as any}
          className="py-2.5 text-xs font-black text-center text-slate-600 hover:bg-slate-50 transition-colors border-r border-[#E6E9F2]">
          View →
        </Link>
        <a href={`/battery-health?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
          className="py-2.5 text-xs font-black text-center text-emerald-600 hover:bg-emerald-50 transition-colors border-r border-[#E6E9F2]">
          🔋
        </a>
        <a href={`/ev-valuation?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
          className="py-2.5 text-xs font-black text-center text-indigo-600 hover:bg-indigo-50 transition-colors">
          💰
        </a>
      </div>
    </div>
  );
}

// Deal-grade a listing vs brand average prices
function getDealGrade(price: number, brandAvg: number | null): { label: string; color: string; bg: string } | null {
  if (!brandAvg) return null;
  const pct = ((price - brandAvg) / brandAvg) * 100;
  if (pct <= -12) return { label: "🔥 Hot Deal",    color: "#16A34A", bg: "#F0FDF4" };
  if (pct <= -5)  return { label: "✅ Good Deal",   color: "#2563EB", bg: "#EFF6FF" };
  if (pct <= 5)   return { label: "📊 Fair Price",  color: "#D97706", bg: "#FFFBEB" };
  return             { label: "⚠️ High Price",   color: "#DC2626", bg: "#FEF2F2" };
}

export default async function HomePage() {
  const [listings, totalListings, allActive] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" } as any,
      include: { evModel: { select: { brand: true, model: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } as any }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" } as any,
      select: { price: true, evName: true, evModel: { select: { brand: true } } },
    }),
  ]);

  // Build brand price stats for Market Pulse + deal grading
  const byBrand: Record<string, number[]> = {};
  for (const l of allActive) {
    const brand = (l as any).evModel?.brand ?? BRANDS.find(b => (l.evName ?? "").includes(b));
    if (brand) { byBrand[brand] = byBrand[brand] ?? []; byBrand[brand].push(l.price); }
  }
  const brandAvgMap: Record<string, number> = {};
  for (const [brand, prices] of Object.entries(byBrand)) {
    brandAvgMap[brand] = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  }

  const pulse = Object.entries(byBrand)
    .filter(([, p]) => p.length >= 2)
    .map(([brand, p]) => ({ brand, avg: brandAvgMap[brand], min: Math.min(...p), count: p.length }))
    .sort((a, b) => b.count - a.count).slice(0, 4);

  // Hot deals: listings priced 10%+ below their brand average
  const hotDeals = (listings as any[]).filter(l => {
    const brand = l.evModel?.brand ?? BRANDS.find(b => (l.evName ?? "").includes(b));
    const avg = brand ? brandAvgMap[brand] : null;
    return avg && l.price < avg * 0.90;
  }).slice(0, 3);

  return (
    <div style={{ background: "#F6F8FF" }}>

      {/* ── 1. Hero — 2-col with car image ──────────────────────────────────── */}
      <AnimatedHero totalListings={totalListings} />

      {/* ── 2. Corolla vs EV — high up, hooks petrol-car owners immediately ─── */}
      <section style={{ background: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E6E9F2" }}>
            <div className="grid sm:grid-cols-2">
              {/* Left — dark hook */}
              <div style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }} className="p-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.25)" }}>
                  🚗 Still driving a Corolla?
                </div>
                <h2 className="text-xl font-black text-white mb-2 leading-tight">
                  You&apos;re spending <span style={{ color: "#F87171" }}>PKR 500K/year</span> on petrol you don&apos;t have to
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Petrol at PKR 280/L. Electricity at PKR 50/kWh. BYD Seal costs PKR 3/km.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Corolla per km", val: "PKR 20", note: "1600cc city driving" },
                    { label: "BYD Seal per km", val: "PKR 3",  note: "Pakistan grid avg" },
                  ].map(({ label, val, note }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
                      <div className="text-base font-black text-white">{val}</div>
                      <div className="text-[10px] text-slate-500">{note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — result */}
              <div className="p-7 flex flex-col justify-center">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">At 25,000 km/year</div>
                {[
                  { label: "Corolla fuel/year",    val: "PKR 500K", color: "#EF4444", bg: "#FEF2F2" },
                  { label: "BYD energy/year",      val: "PKR 75K",  color: "#16A34A", bg: "#F0FDF4" },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                    style={{ background: bg, border: `1px solid ${color}20` }}>
                    <span className="text-xs font-semibold text-slate-600">{label}</span>
                    <span className="font-black text-sm" style={{ color }}>{val}</span>
                  </div>
                ))}
                <div className="rounded-2xl p-5 text-center mb-4"
                  style={{ background: "linear-gradient(135deg,#EEF2FF,#F0FDF4)", border: "2px solid #BBF7D0" }}>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">You save every year</div>
                  <div className="text-3xl font-black"
                    style={{ background: "linear-gradient(90deg,#22C55E,#6366F1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    PKR 425K
                  </div>
                  <div className="text-xs text-slate-400 mt-1">PKR 2.1M over 5 years · enough for EMI payments</div>
                </div>
                <Link href="/listings?brand=BYD" className="block text-center py-3 rounded-xl text-sm font-black text-white"
                  style={{ background: "linear-gradient(135deg,#22C55E,#6366F1)" }}>
                  See BYD listings in Pakistan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 32, background: "linear-gradient(to bottom, #ffffff, #0F172A)" }} />

      {/* ── 3. Market Pulse — dark, each card links to filtered listings ─────── */}
      {pulse.length > 0 && (
        <section style={{ background: "#0F172A" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-green-400">Live Market Pulse</span>
              <span className="ml-auto text-xs text-slate-500">{totalListings} listings</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pulse.map(({ brand, avg, min, count }) => (
                <Link key={brand} href={`/listings?brand=${brand}` as any}
                  className="group rounded-2xl p-4 block transition-all hover:scale-[1.03]"
                  style={{ background: "#1E293B", border: "1px solid #334155" }}>
                  <div className="text-xs text-slate-400 mb-1 font-semibold">{brand}</div>
                  <div className="text-lg font-black text-white">PKR {(avg / 1_000_000).toFixed(1)}M</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">from {(min / 1_000_000).toFixed(1)}M · {count} listed</div>
                  <div className="text-[10px] text-indigo-400 font-bold mt-2 group-hover:text-indigo-300 transition-colors">View listings →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div style={{ height: 32, background: "linear-gradient(to bottom, #0F172A, #F6F8FF)" }} />

      {/* ── 5. Hot Deals — algo-picked listings priced 10%+ below market ─── */}
      {hotDeals.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">Today&apos;s Hot Deals</h2>
                <p className="text-xs text-slate-400">Priced 10%+ below market average — updated daily</p>
              </div>
            </div>
            <Link href="/listings" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              See all →
            </Link>
          </div>
          <div className={`grid gap-3 ${hotDeals.length === 1 ? "grid-cols-1 max-w-sm" : hotDeals.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
            {hotDeals.map((l: any) => {
              const br = l.evModel?.brand ?? BRANDS.find((b: string) => (l.evName ?? "").includes(b)) ?? "default";
              const avg = br !== "default" ? brandAvgMap[br] : undefined;
              const saving = avg ? avg - l.price : 0;
              const evName = `${l.evModel?.brand ?? l.evName ?? ""} ${l.evModel?.model ?? ""}`.trim();
              return (
                <Link key={l.id} href={`/listings/${l.id}` as any}
                  className="group rounded-2xl p-4 block transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: "#fff", border: "2px solid #BBF7D0" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] font-black text-green-600 uppercase tracking-wider">🔥 Hot Deal</div>
                      <div className="font-black text-slate-900 text-sm mt-0.5 leading-tight">{evName || "EV"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-green-600">PKR {(l.price / 1_000_000).toFixed(1)}M</div>
                      {avg && <div className="text-[10px] text-slate-400 line-through">avg {(avg / 1_000_000).toFixed(1)}M</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap text-[10px] text-slate-400">
                    <span>📍 {l.city}</span>
                    <span>{l.year}</span>
                    {saving > 0 && (
                      <span className="font-black text-green-600">
                        Save PKR {(saving / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-xs font-black text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    View listing →
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 4. Deal Checker ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2"
            style={{ background: "#EEF2FF", color: "#4F46E5" }}>
            Free · Instant
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Should I buy this?</h2>
          <p className="text-slate-500 text-sm">Paste a WhatsApp ad, OLX link, or any EV listing text.</p>
        </div>

        {/* 3-col feature strip */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: "📊", title: "Real market data", desc: `${allActive.length}+ listings analysed` },
            { icon: "🔋", title: "Battery signal", desc: "Flags #1 hidden cost in used EVs" },
            { icon: "💡", title: "Negotiation tip", desc: "One-line action you can use today" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl p-3 flex gap-2.5 items-start"
              style={{ background: "#0F172A", border: "1px solid #1E293B" }}>
              <span className="text-lg shrink-0">{icon}</span>
              <div>
                <div className="text-xs font-black text-white leading-tight">{title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <DealChecker />
      </section>

      {/* ── 4. Recent listings with images ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Recent listings</h2>
            {totalListings > 0 && <p className="text-xs text-slate-400 mt-0.5">{totalListings} active across Pakistan</p>}
          </div>
          <Link href="/listings" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            View all →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(listings as any[]).map(l => {
              const b = l.evModel?.brand ?? BRANDS.find((br: string) => (l.evName ?? "").includes(br));
              return <ListingCard key={l.id} listing={l} brandAvg={b ? brandAvgMap[b] : undefined} />;
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E9F2]">
            <div className="font-black text-slate-900 mb-1">No listings yet</div>
            <Link href="/listings/post" className="mt-4 inline-block px-6 py-3 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              List Your EV Free →
            </Link>
          </div>
        )}
      </section>

      <div style={{ height: 32, background: "linear-gradient(to bottom, #F6F8FF, #0F172A)" }} />

      {/* ── 5. Tools Banner + Grid ────────────────────────────────────────── */}
      <div style={{ background: "#0F172A" }}>
        {/* Hero Banner */}
        <div className="relative overflow-hidden" style={{ minHeight: 240, background: "linear-gradient(105deg, #0F172A 0%, #1E293B 60%, #1E1B4B 100%)" }}>
          {/* EV charging image (right, faded) */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80)",
              backgroundSize: "cover", backgroundPosition: "center",
            }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0F172A 0%, transparent 70%)" }} />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-4xl font-black text-white mb-2 leading-tight">Tools That Sell</h2>
            <p className="text-slate-300 text-lg max-w-2xl mb-6">Every listing advantage you're missing vs competitors. Free. No sign-up. No fees.</p>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "30 sec checks", icon: "⚡" },
                { label: "PKR accuracy", icon: "🎯" },
                { label: "No commission", icon: "✓" },
              ].map(({ label, icon }) => (
                <div key={label} className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <span>{icon}</span>
                  <span className="text-sm font-black text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/battery-health", icon: "🔋", title: "Battery Health", benefit: "A–F grade in 30 sec", color: "#22C55E" },
              { href: "/ev-valuation", icon: "💰", title: "Resale Valuation", benefit: "Real PKR range", color: "#A78BFA" },
              { href: "/import-duty", icon: "📦", title: "Import Duty", benefit: "Exact breakdown", color: "#EC4899" },
              { href: "/cost-calculator", icon: "📊", title: "Cost Calculator", benefit: "5-year savings", color: "#34D399" },
            ].map(({ href, icon, title, benefit, color }) => (
              <Link key={href} href={href as any}
                className="group block rounded-2xl p-6 transition-all duration-150 hover:-translate-y-1 relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${color}25`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ boxShadow: `inset 0 0 20px ${color}15` }} />
                <div className="relative">
                  <span className="text-4xl block mb-3">{icon}</span>
                  <h4 className="text-sm font-black text-white mb-1">{title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{benefit}</p>
                  <div className="text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color }}>
                    Open →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
