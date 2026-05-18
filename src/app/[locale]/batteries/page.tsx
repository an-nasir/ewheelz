// src/app/batteries/page.tsx — Battery Database (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "EV Battery Database — LFP vs NMC vs Blade",
  description: "Compare EV battery chemistry — LFP Blade, NMC, LFP. Which survives Pakistan's 45°C heat?",
};

const CHEMISTRY_CARDS = [
  {
    key: "LFP Blade",
    emoji: "🏆",
    title: "LFP Blade (BYD)",
    tagline: "Best for Pakistan",
    pros: ["Highest thermal stability at 45°C+", "5,000+ cycle life", "Cell-to-pack design, no module fires", "Zero thermal runaway risk"],
    cons: ["BYD proprietary only", "Slightly lower energy density"],
    gradient: "linear-gradient(135deg,#F0FDF4,#DCFCE7)",
    border: "#86EFAC",
    accent: "#16A34A",
    dot: "#22C55E",
  },
  {
    key: "LFP",
    emoji: "✅",
    title: "LFP (Standard)",
    tagline: "Good for hot climates",
    pros: ["Heat-tolerant chemistry", "2,000+ cycle life", "Low cost per kWh", "Budget EVs"],
    cons: ["Lower range per kg", "Slower fast-charge"],
    gradient: "linear-gradient(135deg,#EFF6FF,#E0F2FE)",
    border: "#93C5FD",
    accent: "#2563EB",
    dot: "#3B82F6",
  },
  {
    key: "NMC",
    emoji: "⚡",
    title: "NMC / NCM",
    tagline: "Performance focus",
    pros: ["Highest energy density", "Best range-to-weight", "800V capable (Ioniq 5)", "Fast charge compatible"],
    cons: ["Heat sensitive above 40°C", "More degradation in Pakistani summers", "2,000 cycle life"],
    gradient: "linear-gradient(135deg,#F5F3FF,#EDE9FE)",
    border: "#C4B5FD",
    accent: "#7C3AED",
    dot: "#8B5CF6",
  },
];

export default async function BatteriesPage() {
  const batteries = await prisma.evBattery.findMany({
    include: {
      evModel: {
        select: { brand: true, model: true, slug: true, powertrain: true, pricePkrMin: true, availableInPk: true },
      },
    },
    orderBy: { capacityKwh: "desc" },
  });

  // Group batteries by chemistry for count
  const grouped = new Map<string, number>();
  for (const b of batteries) {
    const key = b.chemistry?.includes("Blade") ? "LFP Blade"
      : b.chemistry?.includes("NMC") || b.chemistry === "NMC" ? "NMC"
      : "LFP";
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  const CHEM_STYLES: Record<string, { badge: string; dot: string }> = {
    "LFP Blade": { badge: "background:#F0FDF4;color:#16A34A;border:1px solid #86EFAC", dot: "#22C55E" },
    LFP:         { badge: "background:#EFF6FF;color:#2563EB;border:1px solid #93C5FD", dot: "#3B82F6" },
    NMC:         { badge: "background:#F5F3FF;color:#7C3AED;border:1px solid #C4B5FD", dot: "#8B5CF6" },
  };

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#F59E0B 0%,#EF4444 40%,#8B5CF6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "280px", height: "280px", borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "20%",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              🔋 Battery Database
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              EV Battery Guide
            </h1>
            <p className="text-amber-100 text-lg mb-6 max-w-xl">
              {batteries.length} battery packs tracked · Chemistry comparison for Pakistan&apos;s 45°C+ summers
            </p>

            {/* Chemistry counts */}
            <div className="flex flex-wrap gap-3">
              {CHEMISTRY_CARDS.map(c => (
                <div key={c.key} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)" }}>
                  <span>{c.emoji}</span>
                  <span>{c.key}</span>
                  <span className="opacity-70">· {grouped.get(c.key) ?? 0} EVs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Chemistry Guide Cards ── */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {CHEMISTRY_CARDS.map(c => (
            <div key={c.key} style={{
              background: c.gradient,
              border: `1px solid ${c.border}`,
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
            }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{c.emoji}</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                  <div className="text-xs font-semibold mt-0.5" style={{ color: c.accent }}>{c.tagline}</div>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                {c.pros.map(p => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <span style={{ color: c.dot }} className="mt-0.5 font-bold">✓</span>{p}
                  </div>
                ))}
                {c.cons.map(p => (
                  <div key={p} className="flex items-start gap-1.5 text-xs text-slate-500">
                    <span className="mt-0.5 text-slate-400">·</span>{p}
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-white/60 text-xs" style={{ color: c.accent }}>
                {grouped.get(c.key) ?? 0} EVs in database
              </div>
            </div>
          ))}
        </div>

        {/* ── Pakistan Climate Advisory ── */}
        <div className="mb-6 rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "1px solid #FCD34D" }}>
          <span className="text-3xl flex-shrink-0">🌡️</span>
          <div>
            <div className="font-bold text-amber-800 text-sm mb-1">Pakistan Climate Advisory</div>
            <p className="text-sm text-amber-700 leading-relaxed">
              Pakistan summers reach 45–50°C in Punjab and Sindh. LFP and LFP Blade batteries handle this best.
              NMC batteries degrade faster above 35°C. For daily parking in direct sun, prioritize liquid-cooled packs.
            </p>
          </div>
        </div>

        {/* ── Battery Pack Cards ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-base">All Battery Packs</h2>
            <span className="text-xs text-slate-400">Sorted by capacity · {batteries.length} tracked</span>
          </div>

          <div className="space-y-3">
            {batteries.map((b) => {
              const chemGroup = b.chemistry?.includes("Blade") ? "LFP Blade"
                : b.chemistry?.includes("NMC") || b.chemistry === "NMC" ? "NMC"
                : "LFP";
              const cs = CHEM_STYLES[chemGroup] ?? CHEM_STYLES["LFP"];
              const accentColor = chemGroup === "LFP Blade" ? "#16A34A" : chemGroup === "NMC" ? "#7C3AED" : "#2563EB";
              return (
                <div key={b.id} className="rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md"
                  style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderLeft: `4px solid ${accentColor}` }}>

                  <div className="flex items-start justify-between gap-4 flex-wrap">

                    {/* Left: model + chemistry */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}22` }}>
                        🔋
                      </div>
                      <div className="min-w-0">
                        <Link href={`/ev/${b.evModel.slug}`}
                          className="font-black text-slate-900 hover:text-indigo-600 transition-colors text-sm leading-tight block">
                          {b.evModel.brand} {b.evModel.model}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ cssText: cs.badge } as React.CSSProperties}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cs.dot }} />
                            {b.chemistry}
                          </span>
                          {b.evModel.availableInPk && (
                            <span className="text-[10px] font-black text-green-600 px-2 py-0.5 rounded-full"
                              style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                              🇵🇰 Available in PK
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: price */}
                    {b.evModel.pricePkrMin && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Starting from</div>
                        <div className="font-black text-base"
                          style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          PKR {(b.evModel.pricePkrMin / 1_000_000).toFixed(1)}M
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { icon: "⚡", label: "Capacity",   val: b.capacityKwh ? `${b.capacityKwh} kWh` : null },
                      { icon: "🔌", label: "Voltage",    val: b.voltage     ? `${b.voltage}V`          : null },
                      { icon: "🔄", label: "Cycle Life", val: b.cycleLife   ? `${b.cycleLife.toLocaleString()} cycles` : null },
                      { icon: "🛡",  label: "Warranty",  val: b.warrantyYears ? `${b.warrantyYears} years` : null },
                    ].filter(s => s.val).map(({ icon, label, val }) => (
                      <div key={label} className="rounded-xl px-3 py-2"
                        style={{ background: "#F8FAFF", border: "1px solid #EEF2FF" }}>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{icon} {label}</div>
                        <div className="text-xs font-black text-slate-800">{val}</div>
                      </div>
                    ))}
                    {b.thermalManagement && (
                      <div className="rounded-xl px-3 py-2"
                        style={{ background: b.thermalManagement === "liquid" ? "#F0FDF4" : "#F8FAFF", border: b.thermalManagement === "liquid" ? "1px solid #86EFAC" : "1px solid #EEF2FF" }}>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">❄️ Cooling</div>
                        <div className={`text-xs font-black ${b.thermalManagement === "liquid" ? "text-green-700" : "text-slate-600"}`}>
                          {b.thermalManagement === "liquid" ? "Liquid ✓" : b.thermalManagement}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="mt-8 text-center">
          <Link href="/compare"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.30)" }}>
            Compare EVs side-by-side →
          </Link>
        </div>
      </div>
    </div>
  );
}
