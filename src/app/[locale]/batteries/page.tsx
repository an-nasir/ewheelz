// src/app/batteries/page.tsx — Battery Database (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

        {/* ── Full Battery Table ── */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E6E9F2" }}>
            <h2 className="font-bold text-slate-900">All Battery Packs</h2>
            <span className="text-xs text-slate-500">Sorted by capacity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: "#F6F8FF", borderBottom: "1px solid #E6E9F2" }}>
                  {["EV Model", "Chemistry", "Capacity", "Voltage", "Cooling", "Cycle Life", "Warranty", "Price PKR"].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i > 1 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {batteries.map((b) => {
                  const chemGroup = b.chemistry?.includes("Blade") ? "LFP Blade"
                    : b.chemistry?.includes("NMC") || b.chemistry === "NMC" ? "NMC"
                    : "LFP";
                  const cs = CHEM_STYLES[chemGroup] ?? CHEM_STYLES["LFP"];
                  return (
                    <tr key={b.id} className="transition-colors hover:bg-[#F6F8FF]"
                      style={{ borderBottom: "1px solid #E6E9F2" }}>
                      <td className="px-5 py-3.5">
                        <Link href={`/ev/${b.evModel.slug}`}
                          className="font-medium text-slate-900 hover:text-indigo-600 transition-colors">
                          {b.evModel.brand} {b.evModel.model}
                        </Link>
                        {b.evModel.availableInPk && (
                          <span className="ml-2 text-[10px] font-semibold text-green-600">PK ✓</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ cssText: cs.badge } as React.CSSProperties}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: cs.dot }} />
                          {b.chemistry}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                        {b.capacityKwh ? `${b.capacityKwh} kWh` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">
                        {b.voltage ? `${b.voltage}V` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium ${b.thermalManagement === "liquid" ? "text-green-600" : "text-slate-500"}`}>
                          {b.thermalManagement || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">
                        {b.cycleLife ? b.cycleLife.toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right text-slate-600">
                        {b.warrantyYears ? `${b.warrantyYears} yr` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {b.evModel.pricePkrMin ? (
                          <span className="font-black text-sm"
                            style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            {(b.evModel.pricePkrMin / 1_000_000).toFixed(1)}M
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
