"use client";
// src/app/trip-planner/TripPlannerClient.tsx — all client-side trip planner logic

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { TripPlanResult, ChargingStop, ChargingStation } from "@/types";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center text-sm text-slate-600">
      Loading map…
    </div>
  ),
});

const CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Hyderabad", "Bahawalpur",
  "Sialkot", "Gujranwala", "Gujrat", "Abbottabad", "Sukkur",
  "Sargodha", "Sahiwal", "Mardan", "Swat",
];

interface EvOption { slug: string; label: string; range: number | null }
interface FormState {
  originCity: string; destinationCity: string; evSlug: string;
  batteryPct: number; drivingStyle: string; temperatureC: number; acOn: boolean;
}

const DEFAULT: FormState = {
  originCity: "Karachi", destinationCity: "Lahore", evSlug: "",
  batteryPct: 80, drivingStyle: "normal", temperatureC: 30, acOn: true,
};

function ChargingStopCard({ stop, index, total }: { stop: ChargingStop; index: number; total: number }) {
  const connectors = Array.isArray(stop.station.connectorTypes)
    ? (stop.station.connectorTypes as string[])
    : String(stop.station.connectorTypes ?? "").split(",").map(c => c.trim()).filter(Boolean);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center text-content text-xs font-black shadow-sm flex-shrink-0">
          {index + 1}
        </div>
        {index < total - 1 && <div className="w-0.5 flex-1 bg-amber-500/20 mt-1 min-h-[24px]" />}
      </div>

      <div className="flex-1 pb-5">
        <div className="card border border-amber-500/20 bg-amber-50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="font-bold text-slate-900 text-sm">{stop.station.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                {stop.station.network} &middot; {stop.station.city}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-amber-400 font-black text-lg">{stop.chargeTimeMinutes}<span className="text-xs font-normal ml-0.5">min</span></p>
              {stop.estimatedCostPkr && (
                <p className="text-xs text-content-muted mt-0.5">~PKR {stop.estimatedCostPkr}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-[#E6E9F2]">
              <p className="font-bold text-slate-900">{stop.distanceFromStartKm} km</p>
              <p className="text-slate-600 mt-0.5">from start</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-[#E6E9F2]">
              <p className="font-bold text-slate-900">{stop.chargeFromPct}% → {stop.chargeToPct}%</p>
              <p className="text-slate-600 mt-0.5">charge level</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-[#E6E9F2]">
              <p className="font-bold text-slate-900">{stop.station.maxPowerKw} kW</p>
              <p className="text-slate-600 mt-0.5">DC fast</p>
            </div>
          </div>

          {connectors.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {connectors.map(c => (
                <span key={c} className="text-xs bg-slate-100 border border-amber-500/30 text-amber-600 px-2 py-0.5 rounded-lg">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TripPlannerClient() {
  const [form, setForm]               = useState<FormState>(DEFAULT);
  const [evOptions, setEvOptions]     = useState<EvOption[]>([]);
  const [result, setResult]           = useState<(TripPlanResult & { evModel?: string }) | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [evLoaded, setEvLoaded]       = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => { loadEvs(); }, []);

  async function loadEvs() {
    if (evLoaded) return;
    try {
      const data = await fetch("/api/trip-planner").then(r => r.json());
      setEvOptions(data.evModels ?? []);
      if (data.evModels?.length) setForm(f => ({ ...f, evSlug: data.evModels[0].slug }));
      setEvLoaded(true);
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.evSlug) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch("/api/trip-planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Unknown error");
      else setResult(data);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  const totalH = Math.floor((result?.estimatedTotalTimeMinutes ?? 0) / 60);
  const totalM = (result?.estimatedTotalTimeMinutes ?? 0) % 60;
  const driveH = Math.floor((result?.estimatedDrivingTimeMinutes ?? 0) / 60);
  const driveM = (result?.estimatedDrivingTimeMinutes ?? 0) % 60;

  const selectedEv = evOptions.find(e => e.slug === form.evSlug);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 40%,#3B82F6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
                  🛣️ Trip Planner
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Plan Your EV Trip
                </h1>
                <p className="text-green-100 mt-1.5 text-sm max-w-lg">
                  Enter your route and we&apos;ll calculate exact charging stops,
                  drive time, and energy usage for any EV in Pakistan.
                </p>
              </div>

              {(form.originCity && form.destinationCity) && (
                <div className="rounded-2xl px-5 py-3 text-sm hidden sm:flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)" }}>
                  <span className="font-semibold text-white">{form.originCity}</span>
                  <span style={{ color: "rgba(255,255,255,0.60)" }}>→</span>
                  <span className="font-semibold text-white">{form.destinationCity}</span>
                  {selectedEv && <span style={{ color: "rgba(255,255,255,0.70)", borderLeft: "1px solid rgba(255,255,255,0.25)", paddingLeft: "12px" }}>{selectedEv.label}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Form panel ── */}
          <div className="lg:w-[360px] flex-shrink-0 space-y-4">
            <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>

              {/* Route section */}
              <div className="px-5 pt-5 pb-4">
                <p className="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Route</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-content-muted mb-1 block">From</label>
                    <select
                      className="w-full border border-neon-green/20 bg-white rounded-xl px-3 py-2.5 text-sm text-content placeholder-slate-500 focus:outline-none focus:border-neon-green transition-colors"
                      value={form.originCity}
                      onChange={e => setForm(f => ({ ...f, originCity: e.target.value }))}
                    >
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, originCity: f.destinationCity, destinationCity: f.originCity }))}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-neon-green/10 flex items-center justify-center text-content-muted hover:text-neon-green transition-colors shadow-sm text-sm"
                      title="Swap"
                    >
                      ⇅
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-content-muted mb-1 block">To</label>
                    <select
                      className="w-full border border-neon-green/20 bg-white rounded-xl px-3 py-2.5 text-sm text-content placeholder-slate-500 focus:outline-none focus:border-neon-green transition-colors"
                      value={form.destinationCity}
                      onChange={e => setForm(f => ({ ...f, destinationCity: e.target.value }))}
                    >
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E6E9F2]" />

              {/* Your EV section */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-content-muted uppercase tracking-widest mb-3">Your EV</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-content-muted mb-1 block">EV Model</label>
                    <select
                      className="w-full border border-neon-green/20 bg-white rounded-xl px-3 py-2.5 text-sm text-content placeholder-slate-500 focus:outline-none focus:border-neon-green transition-colors"
                      value={form.evSlug}
                      onChange={e => setForm(f => ({ ...f, evSlug: e.target.value }))}
                    >
                      {!evLoaded && <option value="">Loading EVs…</option>}
                      {evOptions.map(ev => (
                        <option key={ev.slug} value={ev.slug}>
                          {ev.label}{ev.range ? ` — ${ev.range} km` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-content-muted">Current Battery</label>
                      <span className="text-sm font-black text-neon-green">{form.batteryPct}%</span>
                    </div>

                    <div className="relative h-3 bg-slate-200 rounded-full mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          form.batteryPct > 50 ? 'bg-neon-green' : form.batteryPct > 20 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${form.batteryPct}%` }}
                      />
                    </div>

                    <input
                      type="range" min={10} max={100} step={5}
                      value={form.batteryPct}
                      onChange={e => setForm(f => ({ ...f, batteryPct: Number(e.target.value) }))}
                      className="w-full accent-neon-green"
                    />
                    <div className="flex justify-between text-xs text-content-muted -mt-1">
                      <span>10%</span><span>50%</span><span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E6E9F2]" />

              {/* Advanced toggle */}
              <div className="px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <span>Advanced conditions</span>
                  <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▾</span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-content-muted mb-2 block">Driving Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: "eco",    label: "🌿 Eco" },
                          { key: "normal", label: "😊 Normal" },
                          { key: "sport",  label: "🏁 Sport" },
                        ].map(s => (
                          <button
                            key={s.key} type="button"
                            onClick={() => setForm(f => ({ ...f, drivingStyle: s.key }))}
                            className={`text-xs py-2 rounded-xl border font-medium transition-colors ${
                              form.drivingStyle === s.key
                                ? "bg-neon-green text-slate-900 border-neon-green"
                                : "border-slate-200 text-content-muted hover:border-slate-300 bg-white"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-content-muted">Temperature</label>
                        <span className="text-xs font-bold text-content">{form.temperatureC}°C</span>
                      </div>
                      <input
                        type="range" min={0} max={50} step={5}
                        value={form.temperatureC}
                        onChange={e => setForm(f => ({ ...f, temperatureC: Number(e.target.value) }))}
                        className="w-full accent-neon-green"
                      />
                      <div className="flex justify-between text-xs text-content-muted -mt-1">
                        <span>0°C</span><span>25°C</span><span>50°C</span>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        onClick={() => setForm(f => ({ ...f, acOn: !f.acOn }))}
                        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.acOn ? 'bg-neon-green' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.acOn ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-xs text-content-muted">Air conditioning on</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <button
                  type="submit"
                  disabled={loading || !form.evSlug}
                  className="w-full bg-neon-green hover:bg-neon-green/90 disabled:bg-slate-200 disabled:text-slate-400 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      Calculating route…
                    </span>
                  ) : (
                    "Plan My Trip →"
                  )}
                </button>

                {error && (
                  <p className="mt-2 text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/30">
                    {error}
                  </p>
                )}
              </div>
            </form>

            {/* Quick facts */}
            <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">How It Works</p>
              <div className="space-y-2.5">
                {[
                  ["🔋", "Reads your EV's real-world range from our database"],
                  ["📍", "Calculates haversine distance between cities"],
                  ["⚡", "Finds real charging stations within 80 km of your route"],
                  ["🧮", "Greedy algorithm picks the optimal stop sequence"],
                ].map(([icon, text]) => (
                  <div key={String(text)} className="flex items-start gap-2.5">
                    <span className="text-base mt-px">{icon}</span>
                    <span className="text-xs text-content-muted leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Results panel ── */}
          <div className="flex-1 min-w-0">

            {!result && !loading && (
              <div className="glass rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-4xl mb-5">🗺️</div>
                <h3 className="font-bold text-content text-lg mb-1">Ready to plan</h3>
                <p className="text-content-muted text-sm max-w-xs">
                  Select your route, pick your EV, and hit Plan My Trip to see exact
                  charging stops and drive time.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link href="/ev-range" className="text-xs text-neon-green hover:text-neon-green/80 font-medium border border-neon-green/20 hover:border-neon-green/40 rounded-xl px-4 py-2 transition-colors">
                    Check Real Range →
                  </Link>
                  <Link href="/cost-calculator" className="text-xs text-content-muted hover:text-slate-700 font-medium border border-slate-200 rounded-xl px-4 py-2 transition-colors">
                    Cost Calculator →
                  </Link>
                </div>
              </div>
            )}

            {loading && (
              <div className="glass rounded-2xl border border-slate-200 p-8 space-y-4">
                {[80, 60, 90, 70].map((w, i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {result && (
              <div className="space-y-5">
                {result.canReach ? (
                  <div className="bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 rounded-2xl p-6 text-content border border-neon-green/20 glass">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">✅</span>
                          <h2 className="text-xl font-black">You can reach {result.destinationCity}</h2>
                        </div>
                        <p className="text-slate-600 text-sm">
                          {result.stops.length === 0
                            ? "Non-stop — no charging needed on this route."
                            : `${result.stops.length} charging stop${result.stops.length > 1 ? "s" : ""} along the way`}
                        </p>
                      </div>
                      {result.evModel && (
                        <div className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700" style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(0,0,0,0.06)" }}>
                          {result.evModel}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl p-6 text-content glass">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">⚠️</span>
                      <h2 className="text-xl font-black">Trip not fully feasible</h2>
                    </div>
                    <p className="text-amber-700 text-sm">
                      {result.warning ?? "Insufficient charging infrastructure on this route. Try Eco mode or a higher starting battery."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Distance",    value: `${result.totalDistanceKm}`, unit: "km", sub: `${result.originCity} → ${result.destinationCity}` },
                    { label: "Energy",      value: `${result.totalEnergyKwh}`, unit: "kWh", sub: "estimated usage" },
                    { label: "Drive time",  value: `${driveH}h ${driveM}m`, unit: "", sub: "at 90 km/h avg" },
                    { label: "Total time",  value: `${totalH}h ${totalM}m`, unit: "", sub: result.totalChargingTimeMinutes > 0 ? `+${result.totalChargingTimeMinutes}m charging` : "no charging stops" },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 text-center">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-2xl font-black text-content">{s.value}</span>
                        {s.unit && <span className="text-sm text-content-muted">{s.unit}</span>}
                      </div>
                      {s.sub && <p className="text-xs text-content-muted mt-0.5">{s.sub}</p>}
                      <p className="text-xs text-content-muted font-medium mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-content">Route Timeline</h3>
                    {result.stops.length > 0 && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2.5 py-1 rounded-full border border-amber-500/30">
                        {result.stops.length} stop{result.stops.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex gap-4 mb-2">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center text-slate-900 text-sm shadow-sm flex-shrink-0">🚀</div>
                        {result.stops.length > 0 && <div className="w-0.5 flex-1 bg-neon-green/20 mt-1 min-h-[24px]" />}
                      </div>
                      <div className="pb-5">
                        <p className="font-bold text-content">{result.originCity}</p>
                        <p className="text-xs text-content-muted mt-0.5">Start · Battery {form.batteryPct}%</p>
                      </div>
                    </div>

                    {result.stops.map((stop, i) => (
                      <ChargingStopCard key={stop.station.id} stop={stop} index={i} total={result.stops.length} />
                    ))}

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm flex-shrink-0" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>🏁</div>
                      <div>
                        <p className="font-bold text-content">{result.destinationCity}</p>
                        <p className="text-xs text-content-muted mt-0.5">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.stops.length > 0 && (
                  <div className="rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200">
                      <h3 className="font-bold text-content text-sm">Route Map</h3>
                    </div>
                    <div className="p-4">
                      <LeafletMap
                        stations={result.stops.map(s => s.station) as ChargingStation[]}
                        height="340px"
                      />
                      <p className="text-xs text-content-muted mt-2">
                        Showing {result.stops.length} charging station{result.stops.length !== 1 ? "s" : ""} on your route. &nbsp;
                        <Link href="/charging-map" className="text-neon-green hover:underline">View full charging map →</Link>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href={`/cost-calculator?evSlug=${form.evSlug}&distance=${result.totalDistanceKm}`}
                    className="bg-neon-green hover:bg-neon-green/90 text-slate-900 rounded-2xl p-4 flex items-center gap-3 transition-colors font-bold"
                  >
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-bold text-sm">See Cost Savings</p>
                      <p className="text-slate-600 text-xs">vs petrol for this trip</p>
                    </div>
                  </Link>
                  <Link
                    href={`/ev-range/${form.evSlug}`}
                    className="glass border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-bold text-sm text-content">Range Reality</p>
                      <p className="text-content-muted text-xs">Full Pakistan range data</p>
                    </div>
                  </Link>
                  <Link
                    href="/charging-map"
                    className="glass border border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-sm text-content">Charging Map</p>
                      <p className="text-content-muted text-xs">All stations in Pakistan</p>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
