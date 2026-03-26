"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripEntry {
  vehicleModel: string; distanceKm: number; batteryUsedPct: number | null;
  kwhUsed: number | null; createdAt: string;
}
interface ChargingEntry {
  vehicleModel: string; kwhAdded: number | null; costPkr: number | null;
  chargingTimeMin: number | null; stationName: string | null; createdAt: string;
}
interface SavedEV {
  brand: string; model: string; variant: string | null; slug: string; pricePkrMin: number | null; imageUrl: string | null;
}
interface SavedStation {
  id: string; name: string; city: string | null; network: string | null; maxPowerKw: number | null; liveStatus: string | null;
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
  const co2SavedKg = (totalKm * 0.21) / 1000;
  return { totalKm: Math.round(totalKm), totalKwh: +totalKwh.toFixed(1), evCost: Math.round(evCost), petrolCost: Math.round(petrolCost), savings: Math.round(savings), co2SavedKg: +co2SavedKg.toFixed(1) };
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" }); }
  catch { return iso.slice(0, 10); }
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, unit, sub, highlight = false }: {
  icon: string; label: string; value: string; unit?: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5 bg-white border border-[#E6E9F2] shadow-sm hover:shadow-md transition-all">
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<TripEntry[]>([]);
  const [sessions, setSessions] = useState<ChargingEntry[]>([]);
  const [savedEVs, setSavedEVs] = useState<SavedEV[]>([]);
  const [savedStations, setSavedStations] = useState<SavedStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then(r => r.json())
        .then(d => {
          setTrips(d.trips ?? []);
          setSessions(d.sessions ?? []);
          setSavedEVs(d.savedEVs ?? []);
          setSavedStations(d.savedStations ?? []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#F6F8FF" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const stats = calcSavings(trips);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }} className="pb-12">

      {/* ── Profile Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#6366F1 0%,#4F46E5 45%,#7C3AED 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative overflow-hidden">
             <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl border-4 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{session?.user?.name?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">{session?.user?.name}</h1>
                <p className="text-indigo-200 text-sm">{session?.user?.email}</p>
                <button onClick={() => signOut()} className="mt-2 text-[11px] font-bold text-white uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 transition-all">Sign Out</button>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/listings/post" className="bg-white text-indigo-600 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:scale-[1.02] transition-all">+ Post Listing</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">

        {/* ── Stats ── */}
        <section>
          <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Stats & Savings
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🗺️" label="Total distance" value={stats.totalKm.toLocaleString()} unit="km" />
            <StatCard icon="⚡" label="Energy used" value={String(stats.totalKwh)} unit="kWh" sub={`${trips.length} trips`} />
            <StatCard icon="💰" label="Money saved" value={`PKR ${stats.savings.toLocaleString()}`} sub="vs petrol equivalent" highlight />
            <StatCard icon="🌱" label="CO₂ saved" value={String(stats.co2SavedKg)} unit="kg" />
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* ── Saved EVs ── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">⭐</span> Saved EVs
                </h2>
                <Link href="/ev" className="text-xs font-bold text-indigo-600 hover:underline">Explore More →</Link>
              </div>
              {savedEVs.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedEVs.map(ev => (
                    <Link key={ev.slug} href={`/ev/${ev.slug}`} className="group p-4 rounded-2xl bg-white border border-[#E6E9F2] hover:border-indigo-300 transition-all flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                        {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{ev.brand}</p>
                        <h3 className="font-bold text-slate-900 truncate">{ev.model} {ev.variant}</h3>
                        {ev.pricePkrMin && <p className="text-xs text-slate-500">PKR {(ev.pricePkrMin / 1_000_000).toFixed(1)}M+</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white/50">
                  <p className="text-sm text-slate-500">You haven&apos;t saved any EVs yet.</p>
                </div>
              )}
            </section>

            {/* ── Saved Stations ── */}
            <section>
               <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">🔌</span> Saved Stations
                </h2>
                <Link href="/charging-map" className="text-xs font-bold text-indigo-600 hover:underline">View Map →</Link>
              </div>
               {savedStations.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {savedStations.map(st => (
                    <div key={st.id} className="p-4 rounded-2xl bg-white border border-[#E6E9F2] flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0 text-indigo-600">🔌</div>
                       <div className="min-w-0 flex-1">
                         <h3 className="font-bold text-slate-900 truncate">{st.name}</h3>
                         <p className="text-xs text-slate-500">{st.city} · {st.network}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">{st.maxPowerKw}kW</span>
                           <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: st.liveStatus === "OPERATIONAL" ? "#16A34A" : "#EF4444" }}>{st.liveStatus}</span>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
               ) : (
                <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center bg-white/50">
                  <p className="text-sm text-slate-500">No saved charging stations.</p>
                </div>
               )}
            </section>
          </div>

          <div className="space-y-8">
             {/* ── Recent Activity ── */}
             <section className="bg-white rounded-3xl border border-[#E6E9F2] overflow-hidden shadow-sm">
               <div className="px-6 py-5 border-b border-[#E6E9F2]">
                 <h2 className="font-bold text-slate-900">Recent Activity</h2>
               </div>
               <div className="divide-y divide-[#E6E9F2]">
                 {trips.slice(0, 5).map((t, i) => (
                   <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                     <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-lg">🗺️</div>
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-900 truncate">{t.vehicleModel}</p>
                       <p className="text-xs text-slate-500">{formatDate(t.createdAt)} · Trip</p>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-bold text-green-600">{Math.round(t.distanceKm)}km</p>
                     </div>
                   </div>
                 ))}
                 {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">⚡</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{s.stationName || "Charging"}</p>
                        <p className="text-xs text-slate-500">{formatDate(s.createdAt)} · Charge</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{s.kwhAdded}kWh</p>
                      </div>
                    </div>
                 ))}
               </div>
               {trips.length === 0 && sessions.length === 0 && (
                 <div className="px-6 py-12 text-center text-slate-400">
                   <p className="text-xs">No activity yet</p>
                 </div>
               )}
             </section>
          </div>
        </div>
      </div>
    </div>
  );
}
