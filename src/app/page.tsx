// src/app/page.tsx — eWheelz Homepage (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EvModel, ChargingStation } from "@/types";
import EvIntelligenceToday from "@/components/EvIntelligenceToday";
import AnimatedHero from "@/components/AnimatedHero";
import GradientCard from "@/components/GradientCard";

function getSpecs(ev: EvModel) {
  return (ev.specs ?? {}) as Record<string, number | null>;
}

/* ── Gradient insight card (coloured background, white text) ── */
function InsightCard({
  emoji, rank, label, model, value, unit, href, gradient, shadow,
}: {
  emoji: string; rank: string; label: string;
  model: string; value: string; unit: string;
  href: string; gradient: string; shadow: string;
}) {
  return (
    <Link href={href} className="group block">
      <div
        className="rounded-2xl p-6 relative overflow-hidden transition-all duration-250"
        style={{
          background: gradient,
          boxShadow: shadow,
        }}
      >
        {/* Sheen sweep on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
            animation: "none",
          }}
        />
        {/* Inner light orb */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.4)", filter: "blur(24px)" }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl">{emoji}</span>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              {rank}
            </span>
          </div>
          <div className="text-white/70 text-xs uppercase tracking-wider mb-1 font-medium">{label}</div>
          <div className="text-white font-bold text-base mb-1 group-hover:underline decoration-white/40">{model}</div>
          <div className="text-white font-black text-4xl tabular-nums">
            {value}
            <span className="text-xl font-medium text-white/70 ml-1">{unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Tool card (white card with gradient icon + hover glow) ── */
function ToolCard({ href, icon, title, desc, badge, cta, accentColor }: {
  href: string; icon: string; title: string;
  desc: string; badge?: string; cta: string;
  accentColor: string;
}) {
  return (
    <GradientCard
      href={href}
      className="group h-full"
      glowColor={accentColor}
    >
      <Link href={href} className="flex flex-col h-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{
              background: `${accentColor.replace(/[\d.]+\)$/, "0.12)")}`,
              border: `1px solid ${accentColor.replace(/[\d.]+\)$/, "0.25)")}`,
            }}
          >
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: `${accentColor.replace(/[\d.]+\)$/, "0.10)")}`,
                color: accentColor.replace("rgba", "rgb").replace(/,\s*[\d.]+\)$/, ")"),
                border: `1px solid ${accentColor.replace(/[\d.]+\)$/, "0.25)")}`,
              }}
            >{badge}</span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-brand-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
        <div className="mt-4 text-sm font-semibold text-brand-500 group-hover:text-brand-600 flex items-center gap-1 transition-colors">
          {cta}
          <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
        </div>
      </Link>
    </GradientCard>
  );
}

/* ── Why card (horizontal, icon + text) ── */
function WhyCard({ icon, title, desc, gradient }: {
  icon: string; title: string; desc: string; gradient: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#E6E9F2] transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-900 text-sm mb-1">{title}</div>
        <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const allEvs = (await prisma.evModel.findMany({
    where: { availableInPk: true },
    orderBy: { brand: "asc" },
  })) as EvModel[];

  const stations = ((await prisma.chargingStation.findMany({})) as unknown) as ChargingStation[];

  const evWithRange   = [...allEvs].filter((ev) => (getSpecs(ev).rangeRealWorld ?? 0) > 0);
  const evWithBattery = [...allEvs].filter((ev) => (getSpecs(ev).batteryCapKwh  ?? 0) > 0);
  const evWithDc      = [...allEvs].filter((ev) => (getSpecs(ev).chargingDcKw   ?? 0) > 0);

  const longestRange    = evWithRange.sort(   (a, b) => (getSpecs(b).rangeRealWorld ?? 0) - (getSpecs(a).rangeRealWorld ?? 0))[0];
  const biggestBattery  = evWithBattery.sort( (a, b) => (getSpecs(b).batteryCapKwh  ?? 0) - (getSpecs(a).batteryCapKwh  ?? 0))[0];
  const fastestCharging = evWithDc.sort(      (a, b) => (getSpecs(b).chargingDcKw   ?? 0) - (getSpecs(a).chargingDcKw   ?? 0))[0];

  const stationCount     = stations.length;
  const operationalCount = stations.filter((s) => s.liveStatus === "OPERATIONAL").length;
  const dcFastCount      = stations.filter((s) => s.maxPowerKw >= 50).length;

  const heroStats = [
    { value: String(allEvs.length),   label: "EVs Tracked",   gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { value: String(stationCount),    label: "Stations",       gradient: "linear-gradient(135deg,#22C55E,#10B981)" },
    { value: "4",                     label: "Chemistries",    gradient: "linear-gradient(135deg,#3B82F6,#6366F1)" },
  ];

  const popularComparisons = [
    { label: "Atto 3 vs MG ZS EV",        slugs: "byd-atto-3,mg-zs-ev" },
    { label: "BYD Seal vs Tesla Model 3",  slugs: "byd-seal,tesla-model-3" },
    { label: "Ioniq 5 vs BYD Seal",        slugs: "hyundai-ioniq-5,byd-seal" },
    { label: "Lumin vs Honri VE",          slugs: "changan-lumin,honri-ve" },
  ];

  return (
    <div className="bg-[#F6F8FF]">

      {/* ── 1. Animated Hero ───────────────────────────────────── */}
      <AnimatedHero stats={heroStats} />

      {/* ── 2. EV Records (gradient cards) ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="neon-badge mb-3">🏆 Pakistan EV Records</div>
            <h2 className="text-3xl font-bold text-slate-900">Top performers</h2>
          </div>
          <Link href="/ev" className="text-sm text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors">
            Full database <span className="transition-transform hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {longestRange && (
            <InsightCard emoji="🏆" rank="#1 Range" label="Longest Pakistan range"
              model={`${longestRange.brand} ${longestRange.model}`}
              value={String(getSpecs(longestRange).rangeRealWorld ?? "—")} unit="km"
              href={`/ev/${longestRange.slug}`}
              gradient="linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)"
              shadow="0 8px 32px rgba(99,102,241,0.28)" />
          )}
          {biggestBattery && (
            <InsightCard emoji="🔋" rank="#1 Battery" label="Largest battery pack"
              model={`${biggestBattery.brand} ${biggestBattery.model}`}
              value={String(getSpecs(biggestBattery).batteryCapKwh ?? "—")} unit="kWh"
              href={`/ev/${biggestBattery.slug}`}
              gradient="linear-gradient(135deg,#22C55E 0%,#10B981 100%)"
              shadow="0 8px 32px rgba(34,197,94,0.28)" />
          )}
          {fastestCharging && (
            <InsightCard emoji="⚡" rank="#1 Charging" label="Fastest DC charging"
              model={`${fastestCharging.brand} ${fastestCharging.model}`}
              value={String(getSpecs(fastestCharging).chargingDcKw ?? "—")} unit="kW"
              href={`/ev/${fastestCharging.slug}`}
              gradient="linear-gradient(135deg,#3B82F6 0%,#6366F1 100%)"
              shadow="0 8px 32px rgba(59,130,246,0.28)" />
          )}
        </div>
      </section>

      {/* ── 3. Smart Tools ────────────────────────────────────── */}
      <section className="py-16 border-y border-[#E6E9F2]" style={{ background: "linear-gradient(180deg,#EEF2FF 0%,#F6F8FF 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="neon-badge mb-4">⚡ Smart Tools</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">More than listings</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Pakistan&apos;s first EV intelligence platform with built-in tools to plan, compare, and optimize your EV journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ToolCard href="/trip-planner" icon="🗺️" title="EV Trip Planner" badge="New"
              desc="Enter origin & destination — we show exactly where to charge on any Pakistan route."
              cta="Plan a trip" accentColor="rgba(99,102,241,1)" />
            <ToolCard href="/cost-calculator" icon="💰" title="Cost Calculator"
              desc="Real savings vs petrol with Pakistan electricity rates, monthly projections, and CO₂ impact."
              cta="Calculate" accentColor="rgba(34,197,94,1)" />
            <ToolCard href="/compare" icon="⚖️" title="EV Comparison"
              desc="Side-by-side: range, battery, DC charging, motor power, 0-100 time and ownership cost."
              cta="Compare" accentColor="rgba(59,130,246,1)" />
          </div>
        </div>
      </section>

      {/* ── 4. Charging Network ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="badge-ev mb-4">🔌 Charging Network</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Pakistan Charging Infrastructure</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              {stationCount} stations nationwide with CCS2, CHAdeMO, GB/T and Type 2 connectors.
              Real-time operational status and pricing per kWh.
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mb-8">
              {[
                { v: stationCount, l: "Stations", grad: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
                { v: operationalCount, l: "Online",  grad: "linear-gradient(135deg,#22C55E,#10B981)" },
                { v: dcFastCount,  l: "DC Fast",  grad: "linear-gradient(135deg,#3B82F6,#6366F1)" },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    className="text-4xl font-black tabular-nums"
                    style={{ background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                  >
                    {s.v}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-medium">{s.l}</div>
                </div>
              ))}
            </div>

            <Link href="/charging-map" className="btn-primary text-sm">
              Open Interactive Map →
            </Link>
          </div>

          {/* Cities card */}
          <GradientCard className="p-7" glowColor="rgba(99,102,241,0.10)">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Coverage cities</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(stations.map((s) => s.city))).sort().slice(0, 10).map((city) => (
                <span
                  key={city}
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
                  style={{
                    background: "#EEF2FF",
                    color: "#4F46E5",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  📍 {city}
                </span>
              ))}
            </div>

            {/* Charging type pills */}
            <div className="mt-5 pt-5 border-t border-[#E6E9F2]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Connector types</div>
              <div className="flex flex-wrap gap-2">
                {["CCS2", "CHAdeMO", "GB/T", "Type 2", "AC"].map((t) => (
                  <span key={t}
                    className="px-2.5 py-1 text-xs font-semibold rounded-full"
                    style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(34,197,94,0.20)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </GradientCard>
        </div>
      </section>

      {/* ── 5. EV Intelligence Today ──────────────────────────── */}
      <div style={{ background: "linear-gradient(180deg,#F6F8FF 0%,#EEF2FF 30%,#F6F8FF 100%)" }}>
        <EvIntelligenceToday />
      </div>

      {/* ── 6. Popular comparisons ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-[#E6E9F2]">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Popular Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {popularComparisons.map((c) => (
            <Link
              key={c.slugs}
              href={`/compare?slugs=${c.slugs}`}
              className="px-4 py-2 text-sm font-medium rounded-full hover-pill"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(99,102,241,0.20)",
                color: "#4F46E5",
              }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 7. Why eWheelz ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="neon-badge mb-4">💡 Why eWheelz</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">EV intelligence, not just listings.</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-8">
              PakWheels shows you cars. eWheelz helps you understand EVs. Battery chemistry, real-world range,
              charging infrastructure, and running costs — everything EV buyers actually need.
            </p>
            <div className="space-y-3">
              <WhyCard icon="🔋" title="Real Battery Specs" gradient="linear-gradient(135deg,#22C55E,#10B981)"
                desc="Chemistry (LFP vs NMC), capacity, degradation rates, and Pakistan heat performance." />
              <WhyCard icon="📍" title="Live Charging Infrastructure" gradient="linear-gradient(135deg,#6366F1,#8B5CF6)"
                desc="Every station mapped with connector types, pricing per kWh, and availability status." />
              <WhyCard icon="🗺️" title="Smart Trip Planner" gradient="linear-gradient(135deg,#3B82F6,#6366F1)"
                desc="Know if you can reach your destination. Optimal charging stops before you leave." />
              <WhyCard icon="💰" title="Real Cost Comparison" gradient="linear-gradient(135deg,#8B5CF6,#EC4899)"
                desc="Monthly savings vs petrol with Pakistan electricity rates and CO₂ impact." />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                v: `${allEvs.length}`, l: "EVs tracked", sub: "available in Pakistan",
                grad: "linear-gradient(135deg,#6366F1,#8B5CF6)", bg: "#EEF2FF", border: "rgba(99,102,241,0.15)",
              },
              {
                v: `${stationCount}+`, l: "Charging stations", sub: "nationwide network",
                grad: "linear-gradient(135deg,#22C55E,#10B981)", bg: "#F0FDF4", border: "rgba(34,197,94,0.15)",
              },
              {
                v: "4", l: "Battery chemistries", sub: "LFP, NMC, LMO, NCA",
                grad: "linear-gradient(135deg,#3B82F6,#6366F1)", bg: "#EFF6FF", border: "rgba(59,130,246,0.15)",
              },
              {
                v: "Free", l: "Always free", sub: "No ads · No paywall",
                grad: "linear-gradient(135deg,#8B5CF6,#EC4899)", bg: "#FDF4FF", border: "rgba(139,92,246,0.15)",
              },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <div
                  className="text-3xl font-black mb-2"
                  style={{ background: s.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  {s.v}
                </div>
                <div className="text-sm font-semibold text-slate-900">{s.l}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Battery CTA Banner ─────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#3B82F6 100%)" }}
      >
        {/* Inner blob */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "rgba(255,255,255,0.4)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-15"
          style={{ background: "rgba(255,255,255,0.3)", filter: "blur(50px)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌡️</span>
              <h2 className="text-2xl font-bold text-white">Pakistan&apos;s climate is hard on batteries.</h2>
            </div>
            <p className="text-indigo-100 text-base leading-relaxed">
              Learn why LFP chemistry survives 45°C heat better than NMC, and which batteries last longest on Pakistan roads.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/batteries"
              className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.95)", color: "#4F46E5", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              🔋 Battery Guide →
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center font-bold text-sm px-6 py-3 rounded-xl transition-all text-white whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.30)" }}
            >
              Read Articles
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
