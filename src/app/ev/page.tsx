// src/app/ev/page.tsx — EV Database (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "EV Database — Pakistan",
  description: "All electric vehicles available in Pakistan. Compare specs, pricing, and battery technology.",
};

interface SearchParams { powertrain?: string; sort?: string }

const POWERTRAIN_STYLES: Record<string, { gradient: string; text: string; bg: string; border: string }> = {
  BEV:  { gradient: "linear-gradient(135deg,#22C55E,#10B981)", text: "#15803D", bg: "#F0FDF4", border: "#86EFAC" },
  PHEV: { gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)", text: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC" },
  REEV: { gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", text: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD" },
  HEV:  { gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", text: "#B45309", bg: "#FFFBEB", border: "#FCD34D" },
};

export default async function EvDatabasePage({ searchParams }: { searchParams: SearchParams }) {
  const powertrain = searchParams.powertrain || "";
  const sort = searchParams.sort || "brand";

  const allModels = await prisma.evModel.findMany({
    where: powertrain ? { powertrain } : undefined,
    orderBy: sort === "price" ? { pricePkrMin: "asc" } : sort === "year" ? { year: "desc" } : { brand: "asc" },
    include: {
      specs: {
        select: {
          rangeWltp: true, rangeRealWorld: true, batteryCapKwh: true,
          motorPowerKw: true, chargingDcKw: true, driveType: true, accel0100: true,
        },
      },
      battery: { select: { chemistry: true } },
      _count: { select: { listings: true } },
    },
  });

  const powertrains = ["BEV", "PHEV", "REEV", "HEV"];

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #3B82F6 100%)",
        padding: "0",
      }}>
        {/* Animated blob decorations */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "320px", height: "320px", borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", filter: "blur(60px)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "15%",
            width: "220px", height: "220px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(50px)",
            pointerEvents: "none",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              ⚡ EV Database
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              Pakistan EV Database
            </h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl">
              {allModels.length} electric vehicles tracked — compare specs, pricing, and battery technology.
            </p>

            {/* Powertrain filters */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/ev"
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={!powertrain
                  ? { background: "#FFFFFF", color: "#4F46E5", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                  : { background: "rgba(255,255,255,0.20)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }
                }
              >
                All Types
              </Link>
              {powertrains.map((pt) => (
                <Link
                  key={pt}
                  href={`/ev?powertrain=${pt}${sort !== "brand" ? `&sort=${sort}` : ""}`}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={powertrain === pt
                    ? { background: "#FFFFFF", color: "#4F46E5", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                    : { background: "rgba(255,255,255,0.20)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }
                  }
                >
                  {pt}
                </Link>
              ))}

              {/* Sort controls */}
              <div className="ml-auto flex gap-2">
                {[["brand", "A–Z"], ["price", "Price ↑"], ["year", "Newest"]].map(([key, label]) => (
                  <Link
                    key={key}
                    href={`/ev?${powertrain ? `powertrain=${powertrain}&` : ""}sort=${key}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={sort === key
                      ? { background: "#FFFFFF", color: "#4F46E5" }
                      : { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)" }
                    }
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── EV Cards ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {allModels.map((ev, idx) => {
          const ptStyle = POWERTRAIN_STYLES[ev.powertrain] ?? POWERTRAIN_STYLES.BEV;
          return (
            <Link
              key={ev.id}
              href={`/ev/${ev.slug}`}
              className="group block hover-lift"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E6E9F2",
                borderRadius: "16px",
                overflow: "hidden",
                animationDelay: `${idx * 40}ms`,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                {/* Gradient accent left bar */}
                <div className="hidden sm:block w-1 self-stretch rounded-full flex-shrink-0"
                  style={{ background: ptStyle.gradient }} />

                {/* Brand icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black"
                  style={{ background: ptStyle.bg, color: ptStyle.text, border: `1px solid ${ptStyle.border}` }}>
                  {ev.brand[0]}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                      {ev.brand} {ev.model}
                    </span>
                    {ev.variant && <span className="text-sm text-slate-400">{ev.variant}</span>}

                    {/* Powertrain badge */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: ptStyle.bg, color: ptStyle.text, border: `1px solid ${ptStyle.border}` }}>
                      {ev.powertrain}
                    </span>

                    {ev.battery?.chemistry && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                        {ev.battery.chemistry}
                      </span>
                    )}
                    {ev.availableInPk && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }}>
                        🇵🇰 PK ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {ev.year} · {ev.bodyType || "—"} · {ev.country || "—"}
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-4 gap-4 sm:gap-6 shrink-0">
                  <SpecPill label="Range" value={ev.specs?.rangeRealWorld ? `${ev.specs.rangeRealWorld}` : "—"} unit="km" color="#16A34A" />
                  <SpecPill label="Battery" value={ev.specs?.batteryCapKwh ? `${ev.specs.batteryCapKwh}` : "—"} unit="kWh" color="#4F46E5" />
                  <SpecPill label="DC Charge" value={ev.specs?.chargingDcKw ? `${ev.specs.chargingDcKw}` : "—"} unit="kW" color="#2563EB" />
                  <SpecPill label="0–100" value={ev.specs?.accel0100 ? `${ev.specs.accel0100}` : "—"} unit="s" color="#7C3AED" />
                </div>

                {/* Price */}
                <div className="text-right shrink-0 min-w-[110px]">
                  {ev.pricePkrMin ? (
                    <>
                      <div className="font-black text-base"
                        style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        PKR {(ev.pricePkrMin / 1_000_000).toFixed(1)}M
                      </div>
                      {ev._count.listings > 0 && (
                        <div className="text-xs text-slate-400 mt-0.5">{ev._count.listings} listing{ev._count.listings > 1 ? "s" : ""}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-400">Price TBD</div>
                  )}
                  <div className="mt-1.5 text-xs font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    View specs →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all"
          style={{
            background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
            boxShadow: "0 4px 16px rgba(99,102,241,0.30)",
          }}
        >
          Compare EVs side-by-side →
        </Link>
      </div>
    </div>
  );
}

function SpecPill({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-black tabular-nums" style={{ color: value !== "—" ? color : "#94A3B8" }}>
        {value}<span className="text-[10px] font-normal ml-0.5 opacity-70">{value !== "—" ? unit : ""}</span>
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}
