// src/app/ev/[slug]/page.tsx — EV Detail Page (JetBrains-inspired design)
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    select: { brand: true, model: true, variant: true, description: true },
  });
  if (!ev) return { title: "Not Found" };
  const name = `${ev.brand} ${ev.model}${ev.variant ? ` ${ev.variant}` : ""}`;
  return {
    title: `${name} — Specs & Battery`,
    description: ev.description || `Full specs for the ${name} electric vehicle.`,
  };
}

const PT_STYLES: Record<string, { bg: string; color: string; border: string; gradient: string }> = {
  BEV:  { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC", gradient: "linear-gradient(135deg,#22C55E,#10B981)" },
  PHEV: { bg: "#EEF2FF", color: "#4F46E5", border: "#A5B4FC", gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
  REEV: { bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)" },
  HEV:  { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)" },
};

export default async function EvDetailPage({ params }: Props) {
  const ev = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    include: {
      specs: true, battery: true, charging: true,
      reviews: {
        include: { author: { select: { name: true, city: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { listings: true, reviews: true } },
    },
  });

  if (!ev) notFound();
  const name = `${ev.brand} ${ev.model}${ev.variant ? ` ${ev.variant}` : ""}`;
  const ptStyle = PT_STYLES[ev.powertrain] ?? PT_STYLES.BEV;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Car",
    name, brand: { "@type": "Brand", name: ev.brand }, model: ev.model,
    vehicleEngine: { "@type": "EngineSpecification", fuelType: ev.powertrain },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

        {/* ── Vivid Gradient Hero ── */}
        <div style={{ background: ptStyle.gradient }}>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
              {/* Breadcrumb */}
              <nav className="text-xs mb-4 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.70)" }}>
                <Link href="/ev" className="hover:text-white transition-colors">EV Database</Link>
                <span>/</span>
                <span className="text-white font-medium">{name}</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div>
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white"
                      style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}>
                      {ev.powertrain}
                    </span>
                    {ev.availableInPk && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold text-white"
                        style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}>
                        🇵🇰 Available in Pakistan
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
                      {ev.year} · {ev.bodyType} · {ev.country}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{name}</h1>
                  {ev.description && (
                    <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.80)" }}>
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  {ev.pricePkrMin && (
                    <>
                      <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>Starting from</div>
                      <div className="text-3xl font-black text-white">
                        PKR {(ev.pricePkrMin / 1_000_000).toFixed(1)}M
                      </div>
                      {ev.pricePkrMax && ev.pricePkrMax !== ev.pricePkrMin && (
                        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                          up to PKR {(ev.pricePkrMax / 1_000_000).toFixed(1)}M
                        </div>
                      )}
                    </>
                  )}
                  <Link href={`/compare?slugs=${ev.slug}`}
                    className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.35)" }}>
                    ⚖️ Compare
                  </Link>
                </div>
              </div>

              {/* At-a-glance row */}
              {ev.specs && (
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mt-8 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
                  {[
                    { icon: "📍", label: "Range WLTP",  value: ev.specs.rangeWltp   ? `${ev.specs.rangeWltp} km`   : "—" },
                    { icon: "🔋", label: "Battery",     value: ev.specs.batteryCapKwh ? `${ev.specs.batteryCapKwh} kWh` : "—" },
                    { icon: "⚡", label: "DC Charge",   value: ev.specs.chargingDcKw  ? `${ev.specs.chargingDcKw} kW`   : "—" },
                    { icon: "🚗", label: "Motor",       value: ev.specs.motorPowerKw  ? `${ev.specs.motorPowerKw} kW`   : "—" },
                    { icon: "⏱", label: "0-100 km/h",  value: ev.specs.accel0100 ? `${ev.specs.accel0100}s` : "—" },
                    { icon: "🔝", label: "Top Speed",   value: ev.specs.topSpeed ? `${ev.specs.topSpeed} km/h` : "—" },
                    { icon: "🏎️", label: "Drive",       value: ev.specs.driveType || "—" },
                  ].map(s => (
                    <div key={s.label} className="text-center px-1">
                      <div className="text-lg mb-0.5">{s.icon}</div>
                      <div className="text-sm font-bold text-white">{s.value}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: Full specs + charging + reviews */}
            <div className="lg:col-span-2 space-y-6">

              {/* Full specs table */}
              {ev.specs && (
                <section style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
                  <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E6E9F2" }}>
                    <h2 className="font-bold text-slate-900">Full Specifications</h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: ptStyle.bg, color: ptStyle.color, border: `1px solid ${ptStyle.border}` }}>
                      {ev.powertrain}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3">
                    <SpecCell label="Range (WLTP)"       value={ev.specs.rangeWltp       ? `${ev.specs.rangeWltp} km`   : null} />
                    <SpecCell label="Range (Real World)"  value={ev.specs.rangeRealWorld  ? `${ev.specs.rangeRealWorld} km` : null} />
                    {ev.specs.combinedRange && <SpecCell label="Combined Range" value={`${ev.specs.combinedRange} km`} />}
                    <SpecCell label="Battery Capacity"   value={ev.specs.batteryCapKwh   ? `${ev.specs.batteryCapKwh} kWh` : null} />
                    <SpecCell label="Battery Type"       value={ev.specs.batteryType} />
                    <SpecCell label="Pack Voltage"       value={ev.specs.batteryPackVolt ? `${ev.specs.batteryPackVolt}V`  : null} />
                    <SpecCell label="Motor Power"        value={ev.specs.motorPowerKw    ? `${ev.specs.motorPowerKw} kW (${Math.round(ev.specs.motorPowerKw * 1.341)} hp)` : null} />
                    <SpecCell label="Torque"             value={ev.specs.torqueNm        ? `${ev.specs.torqueNm} Nm`      : null} />
                    <SpecCell label="Drive Type"         value={ev.specs.driveType} />
                    <SpecCell label="0–100 km/h"         value={ev.specs.accel0100       ? `${ev.specs.accel0100} sec`    : null} />
                    <SpecCell label="Top Speed"          value={ev.specs.topSpeed        ? `${ev.specs.topSpeed} km/h`    : null} />
                    <SpecCell label="Efficiency"         value={ev.specs.efficiencyWhKm  ? `${ev.specs.efficiencyWhKm} Wh/km` : null} />
                    <SpecCell label="DC Charging"        value={ev.specs.chargingDcKw    ? `${ev.specs.chargingDcKw} kW`  : null} />
                    <SpecCell label="AC Charging"        value={ev.specs.chargingAcKw    ? `${ev.specs.chargingAcKw} kW`  : null} />
                    <SpecCell label="10–80% Time"        value={ev.specs.chargingTime080} />
                    <SpecCell label="Kerb Weight"        value={ev.specs.weight          ? `${ev.specs.weight} kg`        : null} />
                    <SpecCell label="Platform"           value={ev.specs.platform} />
                    <SpecCell label="Cooling System"     value={ev.specs.coolingSystem} />
                    {ev.specs.towingCapacity && <SpecCell label="Towing Capacity" value={`${ev.specs.towingCapacity} kg`} />}
                  </div>
                </section>
              )}

              {/* Charging compatibility */}
              {ev.charging.length > 0 && (
                <section style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
                  <div className="px-5 py-4" style={{ borderBottom: "1px solid #E6E9F2" }}>
                    <h2 className="font-bold text-slate-900">Charging Compatibility</h2>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: "340px" }}>
                    <thead>
                      <tr style={{ background: "#F6F8FF", borderBottom: "1px solid #E6E9F2" }}>
                        {["Connector", "Max DC", "Max AC", "Standard"].map((h, i) => (
                          <th key={h} className={`px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i === 0 ? "text-left" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ev.charging.map(c => (
                        <tr key={c.id} className="hover:bg-[#F6F8FF] transition-colors" style={{ borderBottom: "1px solid #E6E9F2" }}>
                          <td className="px-5 py-3 font-medium text-slate-900">{c.connectorType}</td>
                          <td className="px-5 py-3 text-slate-500">{c.maxDcKw ? `${c.maxDcKw} kW` : "—"}</td>
                          <td className="px-5 py-3 text-slate-500">{c.maxAcKw ? `${c.maxAcKw} kW` : "—"}</td>
                          <td className="px-5 py-3 text-slate-500">{c.chargingStandard || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </section>
              )}

              {/* Reviews */}
              {ev.reviews.length > 0 && (
                <section>
                  <h2 className="font-bold text-slate-900 mb-4">
                    Owner Reviews
                    <span className="ml-2 text-slate-400 font-normal text-sm">({ev._count.reviews})</span>
                  </h2>
                  <div className="space-y-3">
                    {ev.reviews.map(r => (
                      <div key={r.id} className="rounded-xl p-5"
                        style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < r.rating ? "text-amber-400" : "text-slate-200"}>★</span>
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">{r.author.name} · {r.author.city}</span>
                        </div>
                        {r.pros && (
                          <p className="text-sm text-green-700 mb-1">
                            <span className="font-semibold">Pros: </span>{r.pros}
                          </p>
                        )}
                        {r.cons && (
                          <p className="text-sm text-red-500 mb-2">
                            <span className="font-semibold">Cons: </span>{r.cons}
                          </p>
                        )}
                        {r.reviewText && <p className="text-sm text-slate-600">{r.reviewText}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">

              {/* Battery card */}
              {ev.battery && (
                <section style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
                  <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #E6E9F2" }}>
                    <span>🔋</span>
                    <h2 className="font-bold text-slate-900">Battery</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    <BattStat label="Chemistry"   value={ev.battery.chemistry} />
                    <BattStat label="Capacity"    value={ev.battery.capacityKwh   ? `${ev.battery.capacityKwh} kWh`            : null} />
                    <BattStat label="Voltage"     value={ev.battery.voltage       ? `${ev.battery.voltage}V`                  : null} />
                    <BattStat label="Cell Format" value={ev.battery.cellFormat} />
                    <BattStat label="Cooling"     value={ev.battery.thermalManagement} />
                    <BattStat label="Cycle Life"  value={ev.battery.cycleLife     ? `${ev.battery.cycleLife.toLocaleString()} cycles` : null} />
                    <BattStat label="Degradation" value={ev.battery.degradationRate ? `~${ev.battery.degradationRate}% / yr` : null} />
                    <BattStat label="Warranty"    value={ev.battery.warrantyYears ? `${ev.battery.warrantyYears} years`       : null} />
                  </div>
                </section>
              )}

              {/* Actions */}
              <div className="rounded-2xl p-5 space-y-2.5"
                style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                <Link href={`/compare?slugs=${ev.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                  ⚖️ Add to Comparison
                </Link>
                <Link href={`/listings?brand=${encodeURIComponent(ev.brand)}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
                  🛒 View {ev._count.listings} Listing{ev._count.listings !== 1 ? "s" : ""}
                </Link>
              </div>

              {/* Pakistan insight */}
              <div className="rounded-2xl p-5"
                style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "1px solid #FCD34D" }}>
                <div className="text-sm font-bold text-amber-800 mb-2">🇵🇰 Pakistan Note</div>
                <p className="text-sm text-amber-700 leading-relaxed">
                  {ev.battery?.thermalManagement === "liquid"
                    ? "Liquid-cooled battery — handles Pakistan's heat well. Suitable for year-round use."
                    : ev.battery?.thermalManagement === "air"
                    ? "Air-cooled battery — monitor capacity in hot summers above 40°C."
                    : "Check thermal management before buying for hot climate use."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SpecCell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="px-5 py-3" style={{ borderBottom: "1px solid #E6E9F2", borderRight: "1px solid #E6E9F2" }}>
      <div className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wide font-semibold">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value || "—"}</div>
    </div>
  );
}

function BattStat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between text-sm py-1" style={{ borderBottom: "1px solid #F1F5F9" }}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value || "—"}</span>
    </div>
  );
}
