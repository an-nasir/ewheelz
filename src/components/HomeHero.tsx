"use client";
// src/components/HomeHero.tsx — Interactive EV discovery hero
// Receives all EVs from server, filters/sorts in browser

import { useState, useMemo } from "react";
import Link from "next/link";
import { EvModel } from "@/types";

// ─── Brand visual config ──────────────────────────────────────────────────────

const BRAND_STYLE: Record<string, { grad: string; accent: string }> = {
  BYD:     { grad: "135deg, #0c2461 0%, #1e3a8a 100%",  accent: "#93c5fd" },
  MG:      { grad: "135deg, #7f1d1d 0%, #b91c1c 100%",  accent: "#fca5a5" },
  Hyundai: { grad: "135deg, #0f172a 0%, #1e3a5f 100%",  accent: "#7dd3fc" },
  Toyota:  { grad: "135deg, #7f1d1d 0%, #1c1917 100%",  accent: "#fca5a5" },
  Honda:   { grad: "135deg, #18181b 0%, #3f3f46 100%",  accent: "#d4d4d8" },
  BMW:     { grad: "135deg, #172554 0%, #1e3a8a 100%",  accent: "#bfdbfe" },
  Audi:    { grad: "135deg, #1c1917 0%, #44403c 100%",  accent: "#e7e5e4" },
  Changan: { grad: "135deg, #7c2d12 0%, #c2410c 100%",  accent: "#fdba74" },
  Proton:  { grad: "135deg, #0c4a6e 0%, #0369a1 100%",  accent: "#7dd3fc" },
  Tesla:   { grad: "135deg, #1c1917 0%, #292524 100%",  accent: "#f87171" },
};
function brandStyle(brand: string) {
  return BRAND_STYLE[brand] ?? { grad: "135deg, #18181b 0%, #27272a 100%", accent: "#a1a1aa" };
}

const POWERTRAIN_COLORS: Record<string, string> = {
  BEV:  "bg-ev-500/20 text-ev-400 border-ev-500/30",
  PHEV: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  REEV: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  HEV:  "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ─── Car silhouette SVG ────────────────────────────────────────────────────────

function CarSilhouette({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 300 100" fill={accent} className="w-full h-16 opacity-25">
      <path d="M30 78 L50 50 Q70 26 108 22 L188 22 Q224 22 244 50 L262 76
               C250 82 226 86 210 86 L198 70 Q190 60 170 60 Q150 60 144 70
               L130 86 C100 86 30 84 30 78Z"/>
      <ellipse cx="132" cy="87" rx="18" ry="7"/>
      <ellipse cx="208" cy="87" rx="18" ry="7"/>
      <path d="M108 22 L122 52 L186 52 L200 24Z" opacity="0.5"/>
    </svg>
  );
}

// ─── EV Discovery Card ────────────────────────────────────────────────────────

function EvDiscoveryCard({ ev, maxRange }: { ev: EvModel; maxRange: number }) {
  const style = brandStyle(ev.brand);
  const specs = (ev.specs ?? {}) as Record<string, number | null>;
  const range = specs.rangeRealWorld ?? specs.rangeWltp ?? 0;
  const battery = specs.batteryCapKwh ?? 0;
  const dcKw = specs.chargingDcKw ?? 0;
  const accel = specs.accel0100 ?? null;
  const rangePct = maxRange > 0 ? Math.round((range / maxRange) * 100) : 0;
  const pMin = ev.pricePkrMin;

  return (
    <Link href={`/ev/${ev.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-ev-500/50 transition-all hover:shadow-[0_0_0_1px_#22c55e40,0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Brand image area */}
        <div
          className="px-5 pt-4 pb-2 relative"
          style={{ background: `linear-gradient(${style.grad})` }}
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="text-xs font-bold text-content/70 uppercase tracking-widest">{ev.brand}</span>
              <div className="text-[10px] text-content/40 mt-0.5">{ev.year} · {ev.bodyType ?? ev.segment ?? "EV"}</div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${POWERTRAIN_COLORS[ev.powertrain] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"}`}>
              {ev.powertrain}
            </span>
          </div>
          <CarSilhouette accent={style.accent} />
        </div>

        {/* Data area */}
        <div className="p-4">
          {/* Model name */}
          <div className="font-bold text-content text-base leading-tight mb-3 group-hover:text-ev-400 transition-colors">
            {ev.model}
            {ev.variant && <span className="text-zinc-400 font-normal text-sm ml-1">{ev.variant}</span>}
          </div>

          {/* Range bar — DOMINANT VISUAL */}
          <div className="mb-3">
            <div className="flex items-end justify-between mb-1.5">
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Range</span>
              <span className="text-2xl font-black text-content tabular-nums">
                {range ? range : "—"}
                {range ? <span className="text-sm font-medium text-zinc-400 ml-1">km</span> : null}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ev-600 to-ev-400 transition-all"
                style={{ width: `${rangePct}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">{rangePct}% of longest-range EV</div>
          </div>

          {/* Spec chips */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {battery > 0 && (
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
                <span className="text-[10px]">🔋</span>
                <span className="text-xs font-semibold text-zinc-300">{battery} kWh</span>
              </div>
            )}
            {dcKw > 0 && (
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
                <span className="text-[10px]">⚡</span>
                <span className="text-xs font-semibold text-zinc-300">{dcKw} kW DC</span>
              </div>
            )}
            {accel && (
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-1">
                <span className="text-[10px]">🏁</span>
                <span className="text-xs font-semibold text-zinc-300">{accel}s</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <div className="text-ev-400 font-bold text-sm">
              {pMin ? `PKR ${(pMin / 1_000_000).toFixed(1)}M` : "TBD"}
              {ev.pricePkrMax && ev.pricePkrMax !== pMin
                ? <span className="text-zinc-500 font-normal"> – {(ev.pricePkrMax / 1_000_000).toFixed(1)}M</span>
                : null}
            </div>
            <span className="text-xs text-zinc-500 group-hover:text-ev-400 transition-colors">
              View specs →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Hero Component ──────────────────────────────────────────────────────

interface Props {
  evModels: EvModel[];
}

const RANGE_OPTIONS = [
  { label: "Any range", value: 0 },
  { label: "200+ km", value: 200 },
  { label: "300+ km", value: 300 },
  { label: "400+ km", value: 400 },
  { label: "500+ km", value: 500 },
];
const PRICE_OPTIONS = [
  { label: "Any price", value: 0 },
  { label: "Under PKR 5M", value: 5 },
  { label: "Under PKR 8M", value: 8 },
  { label: "Under PKR 12M", value: 12 },
];

export default function HomeHero({ evModels }: Props) {
  const [search, setSearch] = useState("");
  const [minRange, setMinRange] = useState(0);
  const [maxPriceM, setMaxPriceM] = useState(0);
  const [powertrain, setPowertrain] = useState("");
  const [sort, setSort] = useState<"range" | "price" | "battery">("range");

  const specs = (ev: EvModel) => (ev.specs ?? {}) as Record<string, number | null>;

  const maxRange = useMemo(
    () => Math.max(...evModels.map((ev) => specs(ev).rangeRealWorld ?? specs(ev).rangeWltp ?? 0), 1),
    [evModels]
  );

  const filtered = useMemo(() => {
    let list = evModels.filter((ev) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${ev.brand} ${ev.model} ${ev.variant ?? ""}`.toLowerCase().includes(q)) return false;
      }
      if (minRange > 0) {
        const r = specs(ev).rangeRealWorld ?? specs(ev).rangeWltp ?? 0;
        if (!r || r < minRange) return false;
      }
      if (maxPriceM > 0 && ev.pricePkrMin) {
        if (ev.pricePkrMin > maxPriceM * 1_000_000) return false;
      }
      if (powertrain && ev.powertrain !== powertrain) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "range") {
        const ra = specs(a).rangeRealWorld ?? specs(a).rangeWltp ?? 0;
        const rb = specs(b).rangeRealWorld ?? specs(b).rangeWltp ?? 0;
        return rb - ra;
      }
      if (sort === "price") return (a.pricePkrMin ?? Infinity) - (b.pricePkrMin ?? Infinity);
      if (sort === "battery") {
        const ba = specs(a).batteryCapKwh ?? 0;
        const bb = specs(b).batteryCapKwh ?? 0;
        return bb - ba;
      }
      return 0;
    });
    return list;
  }, [evModels, search, minRange, maxPriceM, powertrain, sort]);

  const anyFilterActive = search || minRange || maxPriceM || powertrain;

  return (
    <section className="bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-0">
        {/* Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-ev-500/15 border border-ev-500/25 text-ev-400 text-xs font-semibold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-ev-400 animate-pulse" />
              Pakistan&apos;s EV Intelligence Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-content tracking-tight leading-none">
              Find your<br />
              <span className="text-ev-400">perfect EV.</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-3 max-w-sm leading-relaxed">
              Real specs, battery chemistry, charging data and trip planning — all in one place.
            </p>
          </div>
          {/* Desktop quick actions */}
          <div className="hidden sm:flex flex-col gap-2 text-right">
            <Link href="/trip-planner" className="text-sm text-ev-400 hover:text-ev-300 font-medium">
              🗺️ Plan a trip →
            </Link>
            <Link href="/cost-calculator" className="text-sm text-zinc-400 hover:text-content">
              💰 Calculate savings →
            </Link>
            <Link href="/charging-map" className="text-sm text-zinc-400 hover:text-content">
              📍 Charging map →
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search EV model… (BYD, MG, Hyundai…)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-content placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-ev-500/50 focus:border-ev-500/50"
              />
            </div>
            {/* Filters row */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={minRange}
                onChange={(e) => setMinRange(Number(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-ev-500/50 cursor-pointer"
              >
                {RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={maxPriceM}
                onChange={(e) => setMaxPriceM(Number(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-ev-500/50 cursor-pointer"
              >
                {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={powertrain}
                onChange={(e) => setPowertrain(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-ev-500/50 cursor-pointer"
              >
                <option value="">All types</option>
                <option value="BEV">BEV (Pure electric)</option>
                <option value="PHEV">PHEV</option>
                <option value="REEV">REEV</option>
                <option value="HEV">HEV (Hybrid)</option>
              </select>
            </div>
          </div>

          {/* Results header row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-content">{filtered.length}</span>
              <span className="text-sm text-zinc-500">EV{filtered.length !== 1 ? "s" : ""} found</span>
              {anyFilterActive && (
                <button
                  onClick={() => { setSearch(""); setMinRange(0); setMaxPriceM(0); setPowertrain(""); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 underline ml-1"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span>Sort:</span>
              {(["range", "price", "battery"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-2 py-1 rounded-md capitalize transition-colors ${
                    sort === s ? "bg-ev-500/20 text-ev-400 font-medium" : "hover:text-zinc-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EV Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm">No EVs match your filters.</div>
            <button
              onClick={() => { setSearch(""); setMinRange(0); setMaxPriceM(0); setPowertrain(""); }}
              className="text-ev-400 text-sm hover:underline mt-2 inline-block"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
            {filtered.map((ev) => (
              <EvDiscoveryCard key={ev.id} ev={ev} maxRange={maxRange} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
