// src/app/charging/page.tsx — Charging station locator
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ChargingStation } from "@/types";

export const metadata: Metadata = {
  title: "EV Charging Stations",
  description:
    "Find electric vehicle charging stations across Pakistan — DC fast chargers, AC chargers, and public charging networks.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Connector & Power badge styles ──────────────────────────────────────────

const CONNECTOR_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  CCS2:    { bg: "#EEF2FF", color: "#4F46E5", border: "#A5B4FC" },
  CHAdeMO: { bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" },
  "Type 2":{ bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  GB_T:    { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
  "GB/T":  { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
};

function ConnectorBadge({ label }: { label: string }) {
  const s = CONNECTOR_STYLES[label] ?? { bg: "#F6F8FF", color: "#64748B", border: "#E6E9F2" };
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {label}
    </span>
  );
}

function PowerBadge({ kw }: { kw: number }) {
  const level = kw >= 100 ? "DC Fast" : kw >= 22 ? "DC" : "AC";
  const s = kw >= 100
    ? { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" }
    : kw >= 22
    ? { bg: "#EEF2FF", color: "#4F46E5", border: "#A5B4FC" }
    : { bg: "#F6F8FF", color: "#64748B", border: "#E6E9F2" };
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {level} · {kw} kW
    </span>
  );
}

// ─── Station Card ─────────────────────────────────────────────────────────────

function StationCard({ station }: { station: ChargingStation }) {
  const connectors = Array.isArray(station.connectorTypes)
    ? station.connectorTypes
    : (station.connectorTypes as string)?.split(",").map((s) => s.trim()) ?? [];

  return (
    <div className="rounded-xl p-5 flex flex-col gap-3 transition-all"
      style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.04)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-800 text-sm leading-tight">
            {station.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{station.network}</div>
        </div>
        <PowerBadge kw={station.maxPowerKw} />
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>
          {station.city}, {station.country}
        </span>
        {station.latitude && station.longitude && (
          <a
            href={`https://www.google.com/maps?q=${station.latitude},${station.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto font-medium text-indigo-600 hover:text-indigo-700"
          >
            Directions ↗
          </a>
        )}
      </div>

      {/* Connectors */}
      <div className="flex flex-wrap gap-1.5">
        {connectors.map((c) => (
          <ConnectorBadge key={c} label={c} />
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChargingPage({
  searchParams,
}: {
  searchParams: { city?: string; network?: string };
}) {
  const allStations = ((await prisma.chargingStation.findMany({
    orderBy: { city: "asc" },
  })) as unknown) as ChargingStation[];

  // Filter
  const cityFilter = searchParams.city ?? "";
  const networkFilter = searchParams.network ?? "";

  const stations = allStations.filter((s) => {
    if (cityFilter && s.city !== cityFilter) return false;
    if (networkFilter && !s.network.includes(networkFilter)) return false;
    return true;
  });

  // Group by city
  const byCity = stations.reduce<Record<string, ChargingStation[]>>((acc, s) => {
    const key = s.city;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const cities = Array.from(new Set(allStations.map((s) => s.city))).sort();
  const networks = Array.from(new Set(allStations.map((s) => s.network))).sort();

  const totalDcFast = allStations.filter((s) => s.maxPowerKw >= 50).length;
  const totalAc = allStations.filter((s) => s.maxPowerKw < 50).length;

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 40%,#3B82F6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
              🔋 Charging Network
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">EV Charging Stations</h1>
            <p className="text-green-100 text-lg">
              Pakistan&apos;s public charging network — DC fast chargers &amp; AC chargers
            </p>
          </div>
        </div>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Stations", value: allStations.length },
          { label: "DC Fast Chargers", value: totalDcFast },
          { label: "AC Chargers", value: totalAc },
          { label: "Cities Covered", value: cities.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-2xl font-black" style={{ color: "#16A34A" }}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="rounded-xl p-5 sticky top-20" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Filter by City
            </div>
            <div className="flex flex-col gap-1">
              <a
                href="/charging"
                className="text-sm px-3 py-1.5 rounded-lg transition-all font-medium"
                style={!cityFilter
                  ? { background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }
                  : { color: "#64748B" }}
              >
                All Cities
              </a>
              {cities.map((c) => (
                <a
                  key={c}
                  href={`/charging?city=${encodeURIComponent(c)}${
                    networkFilter ? `&network=${encodeURIComponent(networkFilter)}` : ""
                  }`}
                  className="text-sm px-3 py-1.5 rounded-lg transition-all"
                  style={cityFilter === c
                    ? { background: "#F0FDF4", color: "#16A34A", fontWeight: "600", border: "1px solid #86EFAC" }
                    : { color: "#64748B" }}
                >
                  {c}
                </a>
              ))}
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E6E9F2" }}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Filter by Network
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href={cityFilter ? `/charging?city=${encodeURIComponent(cityFilter)}` : "/charging"}
                  className="text-sm px-3 py-1.5 rounded-lg transition-all"
                  style={!networkFilter
                    ? { background: "#F0FDF4", color: "#16A34A", fontWeight: "600", border: "1px solid #86EFAC" }
                    : { color: "#64748B" }}
                >
                  All Networks
                </a>
                {networks.map((n) => (
                  <a
                    key={n}
                    href={`/charging?network=${encodeURIComponent(n)}${
                      cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : ""
                    }`}
                    className="text-sm px-3 py-1.5 rounded-lg transition-all"
                    style={networkFilter && n.includes(networkFilter)
                      ? { background: "#F0FDF4", color: "#16A34A", fontWeight: "600", border: "1px solid #86EFAC" }
                      : { color: "#64748B" }}
                  >
                    {n}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Map Placeholder */}
          <div className="rounded-xl mb-6 h-64 flex flex-col items-center justify-center text-center p-6" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="text-3xl mb-3">🗺️</div>
            <div className="text-sm font-semibold text-slate-800">Interactive Map Coming Soon</div>
            <div className="text-xs text-slate-500 mt-1 max-w-xs">
              Mapbox integration in progress. Set{" "}
              <code className="bg-slate-100 px-1 rounded text-indigo-600">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable
              the live map.
            </div>
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {allStations.map((s) => (
                <span
                  key={s.id}
                  className="text-xs rounded-full px-2.5 py-0.5 text-slate-500"
                  style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}
                >
                  📍 {s.city}
                </span>
              ))}
            </div>
          </div>

          {/* Stations grouped by city */}
          {Object.keys(byCity).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No stations match your filters.{" "}
              <a href="/charging" className="text-indigo-600 hover:underline">
                Clear filters
              </a>
            </div>
          ) : (
            Object.entries(byCity).map(([city, cityStations]) => (
              <div key={city} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
                  <h2 className="text-base font-semibold text-slate-800">{city}</h2>
                  <span className="text-xs text-slate-400">
                    {cityStations.length} station{cityStations.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cityStations.map((station) => (
                    <StationCard key={station.id} station={station} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-10 rounded-xl p-5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <div className="text-sm font-semibold text-blue-700 mb-1">
          Know a charging station not listed here?
        </div>
        <p className="text-xs text-blue-600">
          Pakistan&apos;s public charging network is growing rapidly. Data sourced from OpenChargeMap and
          verified station operators. Last updated March 2025.
        </p>
      </div>
    </div>
    </div>
  );
}
