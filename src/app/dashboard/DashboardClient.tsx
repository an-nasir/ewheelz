"use client";
// src/app/dashboard/DashboardClient.tsx — Personal EV Owner Dashboard
// Uses localStorage session token to show anonymised personal stats

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripEntry {
  vehicleModel: string; distanceKm: number; batteryUsedPct: number | null;
  kwhUsed: number | null; createdAt: string;
}
interface ChargingEntry {
  vehicleModel: string; kwhAdded: number | null; costPkr: number | null;
  chargingTimeMin: number | null; stationName: string | null; createdAt: string;
}

// ─── Petrol savings calc ──────────────────────────────────────────────────────

const PETROL_PKR_PER_L = 310;
const PETROL_L_PER_100KM = 12;

function calcSavings(trips: TripEntry[]) {
  const totalKm = trips.reduce((s, t) => s + t.distanceKm, 0);
  const totalKwh = trips.reduce((s, t) => s + (t.kwhUsed ?? 0), 0);
  const evCost = totalKwh * 35;
  const petrolCost = (totalKm / 100) * PETROL_L_PER_100KM * PETROL_PKR_PER_L;
  const savings = petrolCost - evCost;
  const co2SavedKg = totalKm * 0.21 / 1000; // 210g CO2/km for petrol, ~0g for EV
  return { totalKm: Math.round(totalKm), totalKwh: +totalKwh.toFixed(1), evCost: Math.round(evCost), petrolCost: Math.round(petrolCost), savings: Math.round(savings), co2SavedKg: +co2SavedKg.toFixed(1) };
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" }); }
  catch { return iso.slice(0, 10); }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, unit, sub, highlight = false }: {
  icon: string; label: string; value: string; unit?: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5"
      style={highlight
        ? { background: "#F0FDF4", border: "1px solid #86EFAC", boxShadow: "0 2px 8px rgba(34,197,94,0.08)" }
        : { background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
      <div className="text-xl mb-2">{icon}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tabular-nums" style={highlight ? { color: "#16A34A" } : { color: "#0F172A" }}>{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Efficiency Meter ─────────────────────────────────────────────────────────

function EfficiencyMeter({ whKm }: { whKm: number | null }) {
  if (!whKm) return null;
  const kwh100 = +(whKm / 10).toFixed(1);
  const score = Math.max(0, Math.min(100, 100 - (whKm - 100) / 3));
  const barColor = score > 70 ? "#22C55E" : score > 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Efficiency</p>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-black tabular-nums" style={{ color: "#16A34A" }}>{kwh100}</span>
        <span className="text-slate-500 mb-1">kWh/100km</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: barColor }} />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {score > 70 ? "Excellent efficiency" : score > 40 ? "Average efficiency" : "Room to improve"}
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const [trips, setTrips]       = useState<TripEntry[]>([]);
  const [sessions, setSessions] = useState<ChargingEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [token, setToken]       = useState<string>("");

  useEffect(() => {
    const t = localStorage.getItem("ewheelz_token") ?? "";
    setToken(t);
    if (!t) { setLoading(false); return; }

    // Fetch dashboard data
    fetch(`/api/dashboard?token=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(d => {
        setTrips(d.trips ?? []);
        setSessions(d.sessions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = calcSavings(trips);
  const avgEffWhKm = trips.length
    ? trips.reduce((s, t) => {
        if (t.kwhUsed && t.distanceKm) return s + (t.kwhUsed * 1000 / t.distanceKm);
        return s;
      }, 0) / trips.filter(t => t.kwhUsed && t.distanceKm).length || null
    : null;

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#6366F1 0%,#4F46E5 45%,#7C3AED 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
              📊 My Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">EV Owner Dashboard</h1>
            <p className="text-indigo-200 text-sm">
              Your personal driving stats — anonymised and private
            </p>
            {token && (
              <p className="text-indigo-300 text-[10px] mt-3 font-mono">
                Session: {token.slice(0, 12)}…
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#E6E9F2" }} />)}
          </div>
        )}

        {!loading && !token && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <p className="text-5xl mb-4">📊</p>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No data yet</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Start logging trips and charging sessions from the Community Hub.
              Your data is stored anonymously.
            </p>
            <Link href="/community?tab=log-trip"
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
              Log your first trip →
            </Link>
          </div>
        )}

        {!loading && token && trips.length === 0 && sessions.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <p className="text-5xl mb-4">🗺️</p>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No trips logged yet</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
              Log your first trip to see your driving stats, efficiency, and petrol savings.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/community?tab=log-trip"
                className="text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
                Log a Trip
              </Link>
              <Link href="/community?tab=charging"
                className="font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm text-slate-600"
                style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                Report Charging
              </Link>
            </div>
          </div>
        )}

        {!loading && (trips.length > 0 || sessions.length > 0) && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon="🗺️" label="Total distance" value={stats.totalKm.toLocaleString()} unit="km" />
              <StatCard icon="⚡" label="Energy used" value={String(stats.totalKwh)} unit="kWh" sub={`${trips.length} trip${trips.length !== 1 ? "s" : ""}`} />
              <StatCard icon="💰" label="Money saved" value={`PKR ${stats.savings.toLocaleString()}`} sub="vs petrol equivalent" highlight />
              <StatCard icon="🌱" label="CO₂ saved" value={String(stats.co2SavedKg)} unit="kg" sub="vs petrol car" />
            </div>

            {/* Cost comparison */}
            <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Fuel Cost Comparison</p>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Your EV fuel cost</p>
                  <p className="text-2xl font-black" style={{ color: "#16A34A" }}>PKR {stats.evCost.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">at PKR 35/kWh × {stats.totalKwh} kWh</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Equivalent petrol cost</p>
                  <p className="text-2xl font-black text-amber-500">PKR {stats.petrolCost.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-0.5">at 12L/100km × PKR 310/L</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                <span className="text-xl">💰</span>
                <p className="font-bold text-sm" style={{ color: "#16A34A" }}>
                  You&apos;ve saved PKR {stats.savings.toLocaleString()} vs driving a petrol car
                </p>
              </div>
            </div>

            {/* Efficiency + Recent trips side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <EfficiencyMeter whKm={avgEffWhKm ?? null} />

              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Trips</p>
                {trips.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 last:border-0" style={{ borderBottom: i < Math.min(trips.length, 5) - 1 ? "1px solid #E6E9F2" : "none" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>🗺️</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{t.vehicleModel}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(t.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-800">{Math.round(t.distanceKm)} km</p>
                      {t.kwhUsed && <p className="text-[10px] text-slate-400">{t.kwhUsed} kWh</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charging sessions */}
            {sessions.length > 0 && (
              <div className="rounded-2xl p-5" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Charging Sessions ({sessions.length})
                </p>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-4 py-2.5 last:border-0" style={{ borderBottom: i < Math.min(sessions.length, 5) - 1 ? "1px solid #E6E9F2" : "none" }}>
                      <span className="text-lg">⚡</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{s.stationName ?? "Unknown station"}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(s.createdAt)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {s.kwhAdded && <p className="text-sm font-bold text-slate-800">{s.kwhAdded} kWh</p>}
                        {s.costPkr && <p className="text-[10px] text-slate-400">PKR {s.costPkr}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex gap-3 flex-wrap">
              <Link href="/community?tab=log-trip"
                className="text-sm text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
                style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
                + Log Trip
              </Link>
              <Link href="/community?tab=charging"
                className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors text-slate-600"
                style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                + Charging Session
              </Link>
              <Link href="/community?tab=leaderboard"
                className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors text-slate-600"
                style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                Leaderboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
