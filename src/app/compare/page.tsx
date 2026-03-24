// src/app/compare/page.tsx — EV Comparison Engine (JetBrains-inspired)
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { estimateRange } from "@/lib/rangeEstimator";

export const metadata = {
  title: "Compare EVs in Pakistan — Side-by-Side Specs & Range",
  description: "Compare electric vehicles available in Pakistan. Side-by-side battery, range, performance, and charging specs.",
};

interface Props { searchParams: { slugs?: string } }

// Brand accent gradients for comparison header cards
const BRAND_GRADIENTS: Record<string, { bg: string; accent: string; border: string }> = {
  BYD:      { bg: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", accent: "#16A34A", border: "#86EFAC" },
  MG:       { bg: "linear-gradient(135deg,#FFF1F2,#FFE4E6)", accent: "#E11D48", border: "#FECDD3" },
  Hyundai:  { bg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", accent: "#2563EB", border: "#93C5FD" },
  Tesla:    { bg: "linear-gradient(135deg,#F8FAFC,#F1F5F9)", accent: "#475569", border: "#CBD5E1" },
  Changan:  { bg: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", accent: "#059669", border: "#6EE7B7" },
  Honri:    { bg: "linear-gradient(135deg,#F5F3FF,#EDE9FE)", accent: "#7C3AED", border: "#C4B5FD" },
  Deepal:   { bg: "linear-gradient(135deg,#FDF4FF,#FAE8FF)", accent: "#9333EA", border: "#D8B4FE" },
};

function brandStyle(brand: string) {
  return BRAND_GRADIENTS[brand] ?? { bg: "linear-gradient(135deg,#EEF2FF,#E0E7FF)", accent: "#4F46E5", border: "#A5B4FC" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBestIdx(models: any[], getNum: (m: any) => number | null | undefined, mode: "max" | "min"): number {
  const nums = models.map(m => getNum(m) ?? null);
  const valid = nums.filter((n): n is number => n !== null);
  if (!valid.length) return -1;
  const best = mode === "max" ? Math.max(...valid) : Math.min(...valid);
  return nums.indexOf(best);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Row({ label, models, getValue, highlight, getNum }: {
  label: string; models: any[];
  getValue: (m: any) => string;
  highlight?: "max" | "min";
  getNum?: (m: any) => number | null | undefined;
}) {
  const bestIdx = highlight && getNum ? getBestIdx(models, getNum, highlight) : -1;
  return (
    <tr style={{ borderTop: "1px solid #F1F5F9", transition: "background 0.15s" }}
      className="group hover:bg-[#F6F8FF]">
      <td className="px-5 py-3.5 text-xs font-semibold text-slate-500 sticky left-0 bg-white group-hover:bg-[#F6F8FF] z-10 whitespace-nowrap min-w-[150px]">
        {label}
      </td>
      {models.map((m, i) => (
        <td key={m.id} className="px-5 py-3.5 text-sm text-center">
          {i === bestIdx ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold" style={{ color: "#16A34A" }}>{getValue(m)}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }}>
                best
              </span>
            </span>
          ) : (
            <span className="text-slate-600">{getValue(m)}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <tr style={{ background: "#F6F8FF", borderTop: "2px solid #E6E9F2" }}>
        <td colSpan={99} className="px-5 py-2.5">
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#6366F1" }}>{label}</span>
        </td>
      </tr>
      {children}
    </>
  );
}

export default async function ComparePage({ searchParams }: Props) {
  const allModels = await prisma.evModel.findMany({
    select: { slug: true, brand: true, model: true, variant: true, powertrain: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });

  // Cap at 3 models maximum
  const slugs = searchParams.slugs
    ? searchParams.slugs.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  const rawModels = slugs.length >= 2
    ? await prisma.evModel.findMany({
        where: { slug: { in: slugs } },
        include: { specs: true, battery: true, charging: true },
      })
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const models = slugs.map(s => rawModels.find((m: any) => m.slug === s)).filter(Boolean) as typeof rawModels;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rangeEstimates = models.map((m: any) => {
    const batt = m.battery?.capacityKwh ?? m.specs?.batteryCapKwh;
    const wltp = m.specs?.rangeWltp ?? m.specs?.rangeRealWorld;
    if (!batt || !wltp) return null;
    return estimateRange({ batteryCapacityKwh: batt, wltpRange: wltp, efficiencyWhKm: m.specs?.efficiencyWhKm });
  });

  const popular = [
    { label: "Atto 3 vs MG ZS",         slugs: "byd-atto-3,mg-zs-ev" },
    { label: "BYD Seal vs Tesla 3",      slugs: "byd-seal,tesla-model-3" },
    { label: "Seal vs Ioniq 5",          slugs: "byd-seal,hyundai-ioniq-5" },
    { label: "Lumin vs Honri VE",        slugs: "changan-lumin,honri-ve" },
    { label: "Atto 3 vs Seal vs MG ZS",  slugs: "byd-atto-3,byd-seal,mg-zs-ev" },  // 3-way
  ];

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid gradient hero header ── */}
      <div style={{ background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 50%,#8B5CF6 100%)", position: "relative", overflow: "hidden" }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: "20%", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(40px)", pointerEvents: "none" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.20)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }}>
            ⚖️ Comparison Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Compare EVs</h1>
          <p className="text-blue-100 text-sm max-w-lg mb-6">
            Pick up to 3 EVs and compare specs, battery, range, and charging side-by-side.
          </p>

          {/* Popular comparison chips */}
          <div className="flex flex-wrap gap-2">
            {popular.map(pc => (
              <Link
                key={pc.slugs}
                href={`/compare?slugs=${pc.slugs}`}
                className="text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                style={searchParams.slugs === pc.slugs
                  ? { background: "#FFFFFF", color: "#4F46E5", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                  : { background: "rgba(255,255,255,0.18)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.30)" }
                }
              >
                {pc.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── EV Picker ── */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "16px", padding: "1.25rem", boxShadow: "0 2px 8px rgba(99,102,241,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select EVs to Compare</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: slugs.length >= 3 ? "#FEF3C7" : "#EEF2FF", color: slugs.length >= 3 ? "#92400E" : "#4F46E5", border: `1px solid ${slugs.length >= 3 ? "#FCD34D" : "#C7D2FE"}` }}>
                {slugs.length}/3 selected
              </span>
            </div>
            {slugs.length > 0 && (
              <Link href="/compare" className="text-xs font-medium transition-colors text-slate-400 hover:text-red-500">
                Clear all ×
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(allModels as any[]).map((m: any) => {
              const isSelected = slugs.includes(m.slug);
              const atMax = !isSelected && slugs.length >= 3;
              const newSlugs = isSelected
                ? slugs.filter(s => s !== m.slug)
                : slugs.length < 3 ? [...slugs, m.slug] : slugs;
              return (
                <Link
                  key={m.slug}
                  href={atMax ? "#" : `/compare?slugs=${newSlugs.join(",")}`}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                  style={isSelected ? {
                    background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(99,102,241,0.30)",
                  } : atMax ? {
                    background: "#F1F5F9",
                    color: "#CBD5E1",
                    border: "1px solid #E2E8F0",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  } : {
                    background: "#F6F8FF",
                    color: "#475569",
                    border: "1px solid #E6E9F2",
                  }}
                >
                  {isSelected && "✓ "}
                  {m.brand} {m.model}
                  {m.variant && <span style={{ color: isSelected ? "rgba(255,255,255,0.75)" : "#94A3B8" }}> {m.variant}</span>}
                </Link>
              );
            })}
          </div>
          {slugs.length === 1 && (
            <p className="mt-3 text-xs rounded-xl px-3 py-2 font-medium"
              style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FCD34D" }}>
              ⚡ Select one more EV to start comparing.
            </p>
          )}
          {slugs.length >= 3 && (
            <p className="mt-3 text-xs rounded-xl px-3 py-2 font-medium"
              style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #86EFAC" }}>
              ✓ 3 EVs selected — maximum reached. Deselect one to swap.
            </p>
          )}
        </div>

        {/* ── Empty state ── */}
        {models.length < 2 && slugs.length !== 1 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "20px", padding: "5rem 2rem", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}
            className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-5"
              style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", border: "1px solid #C7D2FE" }}>
              ⚖️
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">Pick 2 or 3 EVs above</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Select 2 or 3 EV models to see a detailed side-by-side comparison of specs, battery, range, and charging.
            </p>
          </div>
        )}

        {/* ── Comparison ── */}
        {models.length >= 2 && (
          <div className="space-y-5">

            {/* EV header cards — scrollable on mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="flex gap-4 px-4 sm:px-0 pb-1" style={{ minWidth: `${models.length * 200}px` }}>
                {(models as any[]).map((m: any, i: number) => {
                  const bs = brandStyle(m.brand);
                  return (
                    <div key={m.id} className="flex-1 rounded-2xl p-5 relative overflow-hidden"
                      style={{ minWidth: 180, background: bs.bg, border: `1px solid ${bs.border}`, boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
                      {/* Accent bar top */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                        style={{ background: `linear-gradient(90deg, ${bs.accent}, ${bs.accent}88)` }} />
                      {/* Remove button */}
                      <Link href={`/compare?slugs=${slugs.filter(s => s !== m.slug).join(",")}`}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-opacity opacity-40 hover:opacity-100"
                        style={{ background: "rgba(0,0,0,0.12)", color: "#1e293b" }}>
                        ×
                      </Link>

                      <p className="text-xs font-bold mt-1 mb-0.5" style={{ color: bs.accent }}>{m.brand}</p>
                      <Link href={`/ev/${m.slug}`}>
                        <h3 className="font-black text-base leading-tight text-slate-900 hover:underline pr-6">{m.model}</h3>
                      </Link>
                      {m.variant && <p className="text-slate-500 text-xs mt-0.5">{m.variant}</p>}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(255,255,255,0.70)", color: "#475569", border: "1px solid rgba(0,0,0,0.08)" }}>
                          {m.powertrain}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "rgba(255,255,255,0.70)", color: "#475569", border: "1px solid rgba(0,0,0,0.08)" }}>
                          {m.year}
                        </span>
                      </div>

                      {rangeEstimates[i] && (
                        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${bs.border}` }}>
                          <p className="text-xs text-slate-400 mb-0.5">🇵🇰 Pakistan est.</p>
                          <p className="text-2xl font-black" style={{ color: bs.accent }}>
                            {rangeEstimates[i]!.realWorldEstimate}
                            <span className="text-sm font-normal text-slate-400 ml-1">km</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-3 flex gap-3">
                        <Link href={`/ev/${m.slug}`}
                          className="text-xs font-semibold transition-colors hover:underline"
                          style={{ color: bs.accent }}>
                          Full specs →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spec table */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: `${160 + models.length * 200}px` }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #E6E9F2" }}>
                      <th className="px-5 py-3.5 text-left sticky left-0 z-10 text-xs font-bold text-slate-400 uppercase tracking-wider"
                        style={{ background: "#F6F8FF", width: 150 }}>
                        Specification
                      </th>
                      {(models as any[]).map((m: any) => (
                        <th key={m.id} className="px-5 py-3.5 text-center"
                          style={{ background: "#F6F8FF", minWidth: 200 }}>
                          <span className="font-bold text-slate-900 text-sm">{m.brand} {m.model}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rangeEstimates.some(r => r !== null) && (
                      <Section label="🇵🇰 Pakistan Real-World Range">
                        <Row label="City Driving" models={models}
                          getValue={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i] ? `${rangeEstimates[i]!.scenarios.city.rangeKm} km` : "—"; }}
                          highlight="max" getNum={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i]?.scenarios.city.rangeKm ?? null; }} />
                        <Row label="Highway 110 km/h" models={models}
                          getValue={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i] ? `${rangeEstimates[i]!.scenarios.highway110.rangeKm} km` : "—"; }}
                          highlight="max" getNum={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i]?.scenarios.highway110.rangeKm ?? null; }} />
                        <Row label="Summer 40°C" models={models}
                          getValue={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i] ? `${rangeEstimates[i]!.scenarios.hotWeather.rangeKm} km` : "—"; }}
                          highlight="max" getNum={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i]?.scenarios.hotWeather.rangeKm ?? null; }} />
                        <Row label="Avg Consumption" models={models}
                          getValue={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i] ? `${rangeEstimates[i]!.avgConsumptionWhKm} Wh/km` : "—"; }}
                          highlight="min" getNum={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i]?.avgConsumptionWhKm ?? null; }} />
                        <Row label="Cost per km" models={models}
                          getValue={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i] ? `PKR ${rangeEstimates[i]!.pkrPerKm}` : "—"; }}
                          highlight="min" getNum={(m: any) => { const i = models.indexOf(m); return rangeEstimates[i]?.pkrPerKm ?? null; }} />
                      </Section>
                    )}
                    <Section label="Pricing">
                      <Row label="Starting Price" models={models}
                        getValue={(m: any) => m.pricePkrMin ? `PKR ${(m.pricePkrMin / 1_000_000).toFixed(1)}M` : "—"}
                        highlight="min" getNum={(m: any) => m.pricePkrMin} />
                    </Section>
                    <Section label="Official Range">
                      <Row label="WLTP Range" models={models} getValue={(m: any) => m.specs?.rangeWltp ? `${m.specs.rangeWltp} km` : "—"} highlight="max" getNum={(m: any) => m.specs?.rangeWltp} />
                      <Row label="Real-World" models={models} getValue={(m: any) => m.specs?.rangeRealWorld ? `${m.specs.rangeRealWorld} km` : "—"} highlight="max" getNum={(m: any) => m.specs?.rangeRealWorld} />
                      <Row label="WLTP Efficiency" models={models} getValue={(m: any) => m.specs?.efficiencyWhKm ? `${m.specs.efficiencyWhKm} Wh/km` : "—"} highlight="min" getNum={(m: any) => m.specs?.efficiencyWhKm} />
                    </Section>
                    <Section label="Battery">
                      <Row label="Capacity" models={models} getValue={(m: any) => m.specs?.batteryCapKwh ? `${m.specs.batteryCapKwh} kWh` : "—"} highlight="max" getNum={(m: any) => m.specs?.batteryCapKwh} />
                      <Row label="Chemistry" models={models} getValue={(m: any) => m.battery?.chemistry || "—"} />
                      <Row label="Pack Voltage" models={models} getValue={(m: any) => m.specs?.batteryPackVolt ? `${m.specs.batteryPackVolt}V` : "—"} />
                      <Row label="Cycle Life" models={models} getValue={(m: any) => m.battery?.cycleLife ? `${m.battery.cycleLife.toLocaleString()}` : "—"} highlight="max" getNum={(m: any) => m.battery?.cycleLife} />
                      <Row label="Warranty" models={models} getValue={(m: any) => m.battery?.warrantyYears ? `${m.battery.warrantyYears} years` : "—"} highlight="max" getNum={(m: any) => m.battery?.warrantyYears} />
                    </Section>
                    <Section label="Performance">
                      <Row label="Motor Power" models={models} getValue={(m: any) => m.specs?.motorPowerKw ? `${m.specs.motorPowerKw} kW` : "—"} highlight="max" getNum={(m: any) => m.specs?.motorPowerKw} />
                      <Row label="Torque" models={models} getValue={(m: any) => m.specs?.torqueNm ? `${m.specs.torqueNm} Nm` : "—"} highlight="max" getNum={(m: any) => m.specs?.torqueNm} />
                      <Row label="0–100 km/h" models={models} getValue={(m: any) => m.specs?.accel0100 ? `${m.specs.accel0100}s` : "—"} highlight="min" getNum={(m: any) => m.specs?.accel0100} />
                      <Row label="Top Speed" models={models} getValue={(m: any) => m.specs?.topSpeed ? `${m.specs.topSpeed} km/h` : "—"} />
                      <Row label="Drive Type" models={models} getValue={(m: any) => m.specs?.driveType || "—"} />
                      <Row label="Weight" models={models} getValue={(m: any) => m.specs?.weight ? `${m.specs.weight} kg` : "—"} />
                    </Section>
                    <Section label="Charging">
                      <Row label="DC Fast Charge" models={models} getValue={(m: any) => m.specs?.chargingDcKw ? `${m.specs.chargingDcKw} kW` : "—"} highlight="max" getNum={(m: any) => m.specs?.chargingDcKw} />
                      <Row label="AC Charge" models={models} getValue={(m: any) => m.specs?.chargingAcKw ? `${m.specs.chargingAcKw} kW` : "—"} />
                      <Row label="10–80% Time" models={models} getValue={(m: any) => m.specs?.chargingTime080 || "—"} />
                      <Row label="Connectors" models={models} getValue={(m: any) => m.charging.map((c: any) => c.connectorType).join(", ") || "—"} />
                    </Section>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/trip-planner" className="rounded-2xl p-5 flex items-center gap-4 group hover-lift-sm"
                style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", boxShadow: "0 4px 16px rgba(34,197,94,0.25)" }}>
                <span className="text-3xl">🗺️</span>
                <div>
                  <p className="font-bold text-white">Plan a Trip</p>
                  <p className="text-green-100 text-sm">Test these EVs on your route</p>
                </div>
              </Link>
              <Link href="/cost-calculator" className="rounded-2xl p-5 flex items-center gap-4 group hover-lift-sm"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}>
                <span className="text-3xl">💰</span>
                <div>
                  <p className="font-bold text-white">Cost Calculator</p>
                  <p className="text-indigo-100 text-sm">EV vs petrol savings</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
