// src/app/[locale]/page.tsx
import { prisma } from "@/lib/prisma";
import { Link } from "@/navigation";
import AnimatedHero from "@/components/AnimatedHero";
import GradientCard from "@/components/GradientCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "eWheelz — Pakistan's Verified Used EV Marketplace",
  description: "Buy and sell used EVs in Pakistan with confidence. Every listing has a battery health grade. No scams, no surprises.",
};

// ── How it works step ──────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <div className="font-black text-slate-900 mb-1">{title}</div>
        <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

// ── Tool card ─────────────────────────────────────────────────────────────────
function ToolCard({ href, icon, title, desc, accent, badge }: {
  href: string; icon: string; title: string; desc: string; accent: string; badge?: string;
}) {
  return (
    <GradientCard href={href} className="group h-full" glowColor={accent}>
      <Link href={href as any} className="flex flex-col h-full p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {badge && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style={{ background: accent }}>{badge}</span>}
        </div>
        <div className="font-black text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{title}</div>
        <div className="text-xs text-slate-500 leading-relaxed flex-1">{desc}</div>
        <div className="mt-3 text-xs font-bold flex items-center gap-1 transition-colors" style={{ color: accent }}>
          Open <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </div>
      </Link>
    </GradientCard>
  );
}

// ── Listing preview card ───────────────────────────────────────────────────────
function ListingCard({ listing }: { listing: any }) {
  const h = listing.batteryHealth;
  const grade = h ? (h >= 90 ? "A" : h >= 80 ? "B" : h >= 70 ? "C" : h >= 60 ? "D" : "F") : null;
  const gradeColor = grade === "A" ? "#16A34A" : grade === "B" ? "#6366F1" : grade === "C" ? "#D97706" : grade === "D" ? "#EA580C" : "#DC2626";
  const gradeBg   = grade === "A" ? "#F0FDF4" : grade === "B" ? "#EEF2FF" : grade === "C" ? "#FFFBEB" : grade === "D" ? "#FFF7ED" : "#FEF2F2";
  const evName = `${listing.evModel?.brand ?? listing.evName ?? ""} ${listing.evModel?.model ?? ""}`.trim();

  return (
    <div className="bg-white rounded-2xl border border-[#E6E9F2] hover:shadow-md transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-black text-slate-900">{evName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{listing.year} · {listing.city}</div>
          </div>
          {grade ? (
            <div className="flex flex-col items-center px-2 py-1 rounded-xl"
              style={{ background: gradeBg }}>
              <div className="font-black text-lg leading-none" style={{ color: gradeColor }}>{grade}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: gradeColor }}>Battery</div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-2 py-1 font-semibold">No grade</div>
          )}
        </div>
        <div className="text-xl font-black text-indigo-600 mb-1">
          PKR {(listing.price / 1_000_000).toFixed(2)}M
        </div>
        {listing.mileage && <div className="text-xs text-slate-400">🛣 {listing.mileage.toLocaleString()} km</div>}
      </div>

      {/* Action row — real CTAs */}
      <div className="border-t border-[#E6E9F2] grid grid-cols-2">
        <a href={`/battery-health?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
          className="py-3 text-xs font-black text-center text-emerald-600 hover:bg-emerald-50 transition-colors border-r border-[#E6E9F2]">
          🔋 Is battery healthy?
        </a>
        <a href={`/ev-valuation?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
          className="py-3 text-xs font-black text-center text-indigo-600 hover:bg-indigo-50 transition-colors">
          💰 Is price fair?
        </a>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [listings, totalListings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" } as any,
      include: { evModel: { select: { brand: true, model: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } as any }),
  ]);

  return (
    <div className="bg-[#F6F8FF]">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <AnimatedHero />

      {/* ── 2. How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900">How eWheelz works</h2>
          <p className="text-slate-500 text-sm mt-2">Designed so neither buyer nor seller gets screwed.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          <Step n="1" title="List your EV free"
            desc="Post in 2 minutes. Add photos, price, mileage. No registration needed to start." />
          <Step n="2" title="Run a battery check"
            desc="Our free diagnostic gives your battery a grade A–F. Buyers see it on your listing." />
          <Step n="3" title="Sell at a fair price"
            desc="Our valuation tool shows you the real market price. No more dealer lowballs." />
        </div>
      </section>

      {/* ── 3. Power tools — the two that matter ────────────────────────────── */}
      <section className="border-y border-[#E6E9F2]" style={{ background: "linear-gradient(180deg,#EEF2FF,#F6F8FF)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Free tools for buyers & sellers</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <GradientCard href="/battery-health" className="group" glowColor="rgba(34,197,94,1)">
              <Link href="/battery-health" className="block p-6">
                <div className="text-3xl mb-3">🔋</div>
                <div className="font-black text-slate-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">Battery Health Check</div>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Answer 10 questions about your EV. Get a graded report — A to F — in 30 seconds. Free forever.
                </p>
                <div className="inline-flex items-center gap-1 text-sm font-black text-emerald-600">
                  Check now <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </Link>
            </GradientCard>

            <GradientCard href="/ev-valuation" className="group" glowColor="rgba(139,92,246,1)">
              <Link href="/ev-valuation" className="block p-6">
                <div className="text-3xl mb-3">💰</div>
                <div className="font-black text-slate-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">EV Resale Valuation</div>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Enter your EV, year, km, city. Get a real PKR range — what buyers will actually pay, not what dealers claim.
                </p>
                <div className="inline-flex items-center gap-1 text-sm font-black text-purple-600">
                  Get valuation <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </Link>
            </GradientCard>
          </div>

          {/* Secondary tools — smaller, less prominent */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ToolCard href="/compare"         icon="⚖️" title="Compare EVs"       desc="Side-by-side specs"              accent="#6366F1" />
            <ToolCard href="/cost-calculator" icon="📊" title="Cost Calculator"   desc="EV vs petrol savings"            accent="#10B981" />
            <ToolCard href="/charging-map"    icon="📍" title="Charging Map"      desc="Stations across Pakistan"        accent="#3B82F6" />
            <ToolCard href="/emi-calculator"  icon="🏦" title="EMI Calculator"    desc="HBL, MCB, Meezan rates"          accent="#F59E0B" badge="New" />
          </div>
        </div>
      </section>

      {/* ── 4. Recent listings ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Recent listings</h2>
            {totalListings > 0 && <p className="text-sm text-slate-400 mt-0.5">{totalListings} active across Pakistan</p>}
          </div>
          <Link href="/listings" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
            View all →
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {(listings as any[]).map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E9F2]">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-black text-slate-900 mb-1">No listings yet</div>
            <p className="text-sm text-slate-400 mb-5">Be the first to list your EV in Pakistan&apos;s verified marketplace.</p>
            <Link href="/listings/post"
              className="inline-block px-6 py-3 rounded-xl text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              List Your EV Free →
            </Link>
          </div>
        )}
      </section>

      {/* ── 5. EV database — secondary ──────────────────────────────────────── */}
      <section className="border-t border-[#E6E9F2] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-black text-slate-900 text-lg">Looking to buy new?</div>
            <p className="text-sm text-slate-500 mt-0.5">Browse specs, range and prices for every EV available in Pakistan.</p>
          </div>
          <Link href="/ev"
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-black border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
            Browse EV Database →
          </Link>
        </div>
      </section>

    </div>
  );
}
