// src/app/charging-map/page.tsx — Interactive charging station map
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { ChargingStation } from "@/types";
import ChargerReportButtons from "@/components/ChargerReportButtons";

export const metadata: Metadata = {
  title: "EV Charging Map Pakistan",
  description:
    "Interactive map of all EV charging stations in Pakistan. Find CCS2, CHAdeMO, and Type 2 chargers near you.",
};

// Load map client-side only (Leaflet requires browser APIs)
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl flex items-center justify-center h-[520px]"
      style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
      <div className="text-sm text-slate-500">Loading interactive map…</div>
    </div>
  ),
});

// ─── Station List Card ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  OPERATIONAL: { label: "Open", dot: "bg-green-500", text: "text-green-700" },
  BUSY: { label: "Busy", dot: "bg-amber-400", text: "text-amber-700" },
  OFFLINE: { label: "Offline", dot: "bg-red-400", text: "text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.OPERATIONAL;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StationRow({ s }: { s: ChargingStation }) {
  const connectors = Array.isArray(s.connectorTypes)
    ? (s.connectorTypes as string[])
    : (s.connectorTypes as string)?.split(",").map((c) => c.trim()) ?? [];

  const isDcFast = s.maxPowerKw >= 50;

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-[#E6E9F2] last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
          style={isDcFast
            ? { background: "#DCFCE7", color: "#15803D" }
            : { background: "#DBEAFE", color: "#1D4ED8" }}
        >
          {isDcFast ? "⚡" : "🔌"}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-slate-900 text-sm truncate">{s.name}</div>
          <div className="text-xs text-slate-500">{s.network} · {s.city}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {connectors.map((c) => (
              <span key={c} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-semibold text-slate-900">{s.maxPowerKw} kW</div>
        {s.pricePerKwh && (
          <div className="text-xs text-blue-600 font-medium">PKR {s.pricePerKwh}/kWh</div>
        )}
        <StatusBadge status={s.liveStatus} />
        <div className="text-xs text-slate-400 mt-0.5">{s.operationalHours}</div>
        <div className="mt-2">
          <ChargerReportButtons stationId={s.id} stationName={s.name} compact />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChargingMapPage() {
  const stations = ((await prisma.chargingStation.findMany({})) as unknown) as ChargingStation[];

  const totalDcFast = stations.filter((s) => s.maxPowerKw >= 50).length;
  const totalAc = stations.filter((s) => s.maxPowerKw < 50).length;
  const cities = Array.from(new Set(stations.map((s) => s.city))).sort();
  const operational = stations.filter((s) => s.liveStatus === "OPERATIONAL").length;

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 45%,#3B82F6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
              ⚡ Charging Map
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">EV Charging Map</h1>
            <p className="text-green-100 text-lg">
              Live charging station locations across Pakistan — click any pin for details
            </p>
          </div>
        </div>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Stations", value: stations.length, icon: "📍" },
          { label: "DC Fast Chargers", value: totalDcFast, icon: "⚡" },
          { label: "AC Chargers", value: totalAc, icon: "🔌" },
          { label: "Cities", value: cities.length, icon: "🏙️" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-2xl">{s.icon}</div>
            <div>
              <div className="text-xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Map + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <div className="flex-1 min-w-0">
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow" />
              Open ({operational})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow" />
              Busy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 border-2 border-white shadow" />
              Offline
            </span>
            <span className="ml-auto text-slate-400 italic">Click pin for details</span>
          </div>
          <LeafletMap stations={stations} height="520px" />

          {/* CTA below map */}
          <div className="mt-4 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
            <div>
              <div className="text-sm font-semibold text-green-800">Plan a long trip?</div>
              <div className="text-xs text-green-700 mt-0.5">Use the Trip Planner to find exactly where to stop and charge.</div>
            </div>
            <a
              href="/trip-planner"
              className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}
            >
              Open Trip Planner →
            </a>
          </div>
        </div>

        {/* Sidebar: station list */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="rounded-xl p-4 sticky top-20 max-h-[600px] overflow-y-auto" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              All Stations ({stations.length})
            </div>
            {stations.map((s) => (
              <StationRow key={s.id} s={s} />
            ))}
          </div>
        </div>
      </div>

      {/* Future features teaser */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: "🔮",
            title: "Congestion Prediction",
            desc: "Coming soon — AI-based forecast of station availability by time of day and day of week.",
            badge: "Phase 2",
          },
          {
            icon: "🛣️",
            title: "Route-Aware Planning",
            desc: "Enter your destination and get the optimal charging stop sequence based on live availability.",
            badge: "Try Now",
            href: "/trip-planner",
          },
          {
            icon: "💰",
            title: "Cost Comparison",
            desc: "See exactly how much you save per trip vs a petrol car — with Pakistan electricity prices.",
            badge: "Try Now",
            href: "/cost-calculator",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{f.icon}</span>
              {f.href ? (
                <a
                  href={f.href}
                  className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                  style={{ background: "#DCFCE7", color: "#15803D" }}
                >
                  {f.badge}
                </a>
              ) : (
                <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
                  {f.badge}
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-1">{f.title}</div>
            <div className="text-xs text-slate-600 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}
