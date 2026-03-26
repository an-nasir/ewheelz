// src/app/community/page.tsx — Community Hub (JetBrains-inspired design)
import type { Metadata } from "next";
import CommunityClient from "./CommunityClient";
import { communityDb } from "@/lib/communityDb";

export const metadata: Metadata = {
  title: "EV Community Hub Pakistan — Real-World Data & Leaderboard",
  description:
    "Join Pakistan's EV community. Log trips, report charging sessions, submit efficiency data, and check charging station status. 100% anonymous.",
  alternates: { canonical: "/community" },
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const stats = await communityDb.stats.get();

  const validTabs = ["overview", "leaderboard", "log-trip", "charging", "station", "efficiency"] as const;
  type Tab = typeof validTabs[number];
  const rawTab = searchParams.tab ?? "overview";
  const initialTab: Tab = (validTabs as readonly string[]).includes(rawTab)
    ? (rawTab as Tab)
    : "overview";

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 35%,#6366F1 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          {/* Decorative blobs */}
          <div style={{
            position: "absolute", top: "-80px", right: "-60px",
            width: "300px", height: "300px", borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", filter: "blur(60px)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "10%",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(50px)",
            pointerEvents: "none",
          }} />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Pakistan EV Community
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              Community Data Hub
            </h1>
            <p className="text-green-100 text-lg mb-8 max-w-xl">
              Building Pakistan&apos;s most accurate EV dataset — together.
              No account needed, all data anonymised.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { v: stats.totalSessions,          l: "Charging Sessions",  icon: "⚡" },
                { v: stats.totalTrips,             l: "Trips Logged",       icon: "🗺️" },
                { v: stats.totalEfficiencyReports, l: "Efficiency Reports", icon: "📊" },
                { v: stats.totalStationReports,    l: "Station Reports",    icon: "📍" },
              ].map(s => (
                <div key={s.l} className="text-center py-3 px-2 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <div className="text-xl mb-0.5">{s.icon}</div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {s.v > 0 ? s.v : "—"}
                  </div>
                  <div className="text-xs text-green-100 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Client tabs */}
      <CommunityClient initialTab={initialTab} />
    </div>
  );
}
