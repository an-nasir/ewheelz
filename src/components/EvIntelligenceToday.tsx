// src/components/EvIntelligenceToday.tsx — Server Component
// "EV Intelligence Today" homepage section: live community feed

import Link from "next/link";
import { communityDb, CommunityStats } from "@/lib/communityDb";
import CommunityQuickReport from "./CommunityQuickReport";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ label, value, unit, sub, accent = false }: {
  label: string; value: string; unit?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5"
      style={accent
        ? { background: "#F0FDF4", border: "1px solid #86EFAC" }
        : { background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black tabular-nums" style={accent ? { color: "#16A34A" } : { color: "#0F172A" }}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

function CostBar({ evCost, petrolCost }: { evCost: number; petrolCost: number }) {
  const max = petrolCost;
  const evPct = Math.round((evCost / max) * 100);
  const savingsPct = Math.round(((petrolCost - evCost) / petrolCost) * 100);
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold" style={{ color: "#16A34A" }}>⚡ EV</span>
          <span className="font-bold" style={{ color: "#16A34A" }}>PKR {evCost.toLocaleString()}</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${evPct}%`, background: "#22C55E" }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-orange-600 font-semibold">⛽ Petrol</span>
          <span className="text-orange-600 font-bold">PKR {petrolCost.toLocaleString()}</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-400 rounded-full w-full" />
        </div>
      </div>
      <p className="text-xs text-slate-500 pt-1">
        Per 100 km · EV is <span className="font-bold" style={{ color: "#16A34A" }}>{savingsPct}% cheaper</span> than petrol
      </p>
    </div>
  );
}

function LeaderboardRow({ rank, model, kwh100, count }: {
  rank: number; model: string; kwh100: number; count: number;
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
  const barPct = Math.max(20, Math.min(100, 100 - (kwh100 - 10) * 5));
  return (
    <div className="flex items-center gap-3 py-2.5 last:border-0" style={{ borderBottom: rank < 5 ? "1px solid #E6E9F2" : "none" }}>
      <span className="text-base w-7 flex-shrink-0 text-center">{medal}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 truncate">{model}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${barPct}%`, background: "#22C55E" }} />
          </div>
          <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: "#16A34A" }}>{kwh100} kWh</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-400 flex-shrink-0">{count} {count === 1 ? "report" : "reports"}</span>
    </div>
  );
}

function ActivityFeed({ items }: { items: CommunityStats["recentActivity"] }) {
  if (!items.length) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-500 text-sm">No reports yet — be the first!</p>
        <Link href="/community" className="text-xs hover:underline mt-1 inline-block" style={{ color: "#16A34A" }}>
          See how you compare →
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.slice(0, 6).map((item, i) => (
        <div key={i} className="flex items-center gap-3 py-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: item.type === "efficiency" ? "#22C55E" : "#3B82F6" }} />
          <div className="flex-1 min-w-0">
            <span className="text-xs text-slate-700 font-medium truncate block">
              {item.vehicleModel}
            </span>
            <span className="text-[10px] text-slate-500">{item.text}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
            style={item.type === "efficiency"
              ? { background: "#DCFCE7", color: "#16A34A" }
              : { background: "#DBEAFE", color: "#1D4ED8" }}>
            {item.type === "efficiency" ? "⚡ Efficiency" : "🗺️ Trip"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default async function EvIntelligenceToday() {
  const [stats, leaderboard] = await Promise.all([
    communityDb.stats.get(),
    communityDb.efficiencyReport.getLeaderboard(5),
  ]);

  const evCost   = stats.avgCostPer100km    ?? 630;
  const petCost  = stats.petrolCostPer100km ?? 3720;
  const savings  = stats.evSavingsPct       ?? Math.round(((petCost - evCost) / petCost) * 100);
  const totalReports = stats.totalEfficiencyReports + stats.totalTrips + stats.totalStationReports;

  return (
    <section style={{ background: "#FFFFFF", borderTop: "1px solid #E6E9F2" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22C55E" }} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Community Data</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Real EV Performance</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {totalReports > 0
                ? `${totalReports} data points from real Pakistan EV drivers`
                : "See how EVs actually perform on Pakistani roads"}
            </p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: "#16A34A", border: "1px solid #86EFAC", background: "#F0FDF4" }}
          >
            EV Driver Insights →
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Column 1: Cost stats ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost per 100 km</h3>

            <div className="grid grid-cols-2 gap-3">
              <StatPill label="EV Cost" value={`PKR ${evCost.toLocaleString()}`} sub="per 100 km" accent />
              <StatPill label="Petrol Cost" value={`PKR ${petCost.toLocaleString()}`} sub="per 100 km" />
            </div>

            <div className="rounded-2xl p-5" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
              <p className="text-xs text-slate-500 font-medium mb-3">Cost comparison</p>
              <CostBar evCost={evCost} petrolCost={petCost} />
            </div>

            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-black text-xl" style={{ color: "#16A34A" }}>{savings}% cheaper</p>
                <p className="text-slate-600 text-xs">EV vs petrol · Pakistan rates</p>
              </div>
            </div>
          </div>

          {/* ── Column 2: Efficiency Leaderboard ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Efficiency Leaderboard
              </h3>
              <Link href="/community?tab=leaderboard" className="text-[10px] hover:underline" style={{ color: "#16A34A" }}>
                Full board →
              </Link>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
              {leaderboard.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm">No data yet</p>
                  <p className="text-slate-400 text-xs mt-1">Submit your kWh/100km to rank</p>
                </div>
              ) : (
                leaderboard.map(e => (
                  <LeaderboardRow
                    key={e.vehicleModel}
                    rank={e.rank}
                    model={e.vehicleModel}
                    kwh100={e.bestKwh100km}
                    count={e.reportCount}
                  />
                ))
              )}
              {leaderboard.length === 0 && (
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E6E9F2" }}>
                  <p className="text-[10px] text-slate-400 text-center">
                    Example: BYD Atto 3 city = 16.2 kWh/100km
                  </p>
                </div>
              )}
            </div>

            {/* Contribute CTA */}
            <CommunityQuickReport />
          </div>

          {/* ── Column 3: Activity Feed ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h3>

            <div className="rounded-2xl p-4" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
              <ActivityFeed items={stats.recentActivity} />
            </div>

            {/* Community stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sessions", value: stats.totalSessions, icon: "⚡" },
                { label: "Trips logged", value: stats.totalTrips, icon: "🗺️" },
                { label: "Eff. reports", value: stats.totalEfficiencyReports, icon: "📊" },
                { label: "Station reports", value: stats.totalStationReports, icon: "📍" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                  <p className="text-lg">{s.icon}</p>
                  <p className="text-lg font-black text-slate-900 tabular-nums">
                    {s.value > 0 ? s.value : "—"}
                  </p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-8 rounded-2xl p-5" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">See how your EV compares with other drivers</p>
              <p className="text-xs text-slate-500 mt-0.5">
                No account needed. Your data stays private. Takes 30 seconds.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              <Link href="/community?tab=efficiency"
                className="text-xs text-white font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
                Get my EV score
              </Link>
              <Link href="/community?tab=log-trip"
                className="text-xs text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                Log a trip
              </Link>
              <Link href="/community?tab=station"
                className="text-xs text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                Charger working?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
