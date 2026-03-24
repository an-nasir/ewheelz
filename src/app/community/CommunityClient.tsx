"use client";
// src/app/community/CommunityClient.tsx
// EV Driver Insights — tabs: overview, leaderboard, efficiency, log-trip, charging, station

import { useState, useEffect } from "react";
import Link from "next/link";
import ChargerReportButtons from "@/components/ChargerReportButtons";

type Tab = "overview" | "leaderboard" | "log-trip" | "charging" | "station" | "efficiency";

const EV_MODELS = [
  "BYD Atto 3", "BYD Seal", "BYD Dolphin", "MG ZS EV", "MG 4 EV",
  "Hyundai Ioniq 5", "Tesla Model 3", "Changan Lumin", "Honri VE",
];

// ─── Numeric validation helpers ───────────────────────────────────────────────

function validNum(s: string, min: number, max: number): boolean {
  if (!s.trim()) return true; // optional fields allowed empty
  const n = Number(s);
  return Number.isFinite(n) && n >= min && n <= max;
}

function toNum(s: string): number | undefined {
  const n = Number(s);
  return s.trim() && Number.isFinite(n) ? n : undefined;
}

// ─── Session token ────────────────────────────────────────────────────────────

function getToken(): string {
  if (typeof window === "undefined") return "anon";
  let t = localStorage.getItem("ewheelz_token");
  if (!t) {
    t = "anon_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("ewheelz_token", t);
  }
  return t;
}

async function postReport(body: Record<string, unknown>) {
  const res = await fetch("/api/community/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sessionToken: getToken() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).error ?? "Failed");
  }
  return res.json();
}

// ─── Shared: NumericInput with validation ─────────────────────────────────────

function NumInput({
  label, placeholder, value, onChange, min, max, required, hint,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void;
  min: number; max: number; required?: boolean; hint?: string;
}) {
  const invalid = value.trim() !== "" && !validNum(value, min, max);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && " *"}
      </label>
      <input
        type="number" min={min} max={max} step="any"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-colors ${
          invalid ? "border-red-400 bg-red-50" : "border-[#D1D9F0]"
        }`}
      />
      {invalid && <p className="text-xs text-red-500 mt-1">Must be {min}–{max}</p>}
      {hint && !invalid && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Tab: Leaderboard ─────────────────────────────────────────────────────────

function LeaderboardTab() {
  const [rows, setRows] = useState<{
    rank: number; vehicleModel: string; bestKwh100km: number; reportCount: number;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    fetch("/api/community/leaderboard")
      .then(r => r.json())
      .then(d => { setRows(d.leaderboard ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Efficiency Leaderboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Lowest kWh/100km wins</p>
        </div>
        <Link href="/community?tab=efficiency"
          className="text-xs bg-green-500 text-white font-semibold px-3 py-1.5 rounded-xl hover:bg-green-600 transition-colors">
          Submit mine →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-[#E6E9F2]">
          <p className="text-5xl mb-3">🏆</p>
          <p className="font-bold text-slate-700">No entries yet</p>
          <p className="text-slate-500 text-sm mt-1">Be the first on the leaderboard</p>
          <Link href="/community?tab=efficiency"
            className="mt-4 inline-block text-green-600 text-sm font-semibold hover:underline">
            Get my score →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E6E9F2] rounded-2xl overflow-hidden">
          {rows.map((r, i) => (
            <div key={r.vehicleModel}
              className={`flex items-center gap-4 px-5 py-4 border-b border-zinc-100 last:border-0 transition-colors ${
                i === 0 ? "bg-amber-50" : "hover:bg-slate-50"
              }`}>
              <span className="text-2xl w-8 text-center flex-shrink-0">
                {i < 3 ? medals[i] : `#${r.rank}`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{r.vehicleModel}</p>
                <p className="text-xs text-slate-500">{r.reportCount} {r.reportCount === 1 ? "driver" : "drivers"}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black text-green-600 tabular-nums">{r.bestKwh100km}</p>
                <p className="text-[10px] text-slate-400">kWh/100km</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-400 text-center">Real data from Pakistan EV drivers · No account needed</p>
    </div>
  );
}

// ─── Tab: Trip Log ────────────────────────────────────────────────────────────

interface TripResult {
  distanceKm: number;
  effKwh100: number;
  avgEffKwh100: number;
  diffPct: number;
}

function TripLogTab() {
  const [model, setModel]           = useState(EV_MODELS[0]);
  const [distance, setDistance]     = useState("");
  const [batteryPct, setBatteryPct] = useState("");
  const [speed, setSpeed]           = useState("");
  const [temp, setTemp]             = useState("30");
  const [acOn, setAcOn]             = useState(true);
  const [routeType, setRouteType]   = useState("mixed");
  const [state, setState]           = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult]         = useState<TripResult | null>(null);
  const [errMsg, setErrMsg]         = useState("");

  const kwhUsed = batteryPct ? (Number(batteryPct) / 100) * 58 : undefined;
  const effKwh100 = kwhUsed && Number(distance)
    ? +((kwhUsed * 100) / Number(distance)).toFixed(1) : null;

  const canSubmit =
    validNum(distance, 0.1, 2000) && !!distance &&
    validNum(batteryPct, 1, 100) &&
    validNum(speed, 0, 250) &&
    validNum(temp, -20, 60);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("loading");
    try {
      await postReport({
        type: "trip_log",
        vehicleModel:   model,
        distanceKm:     Number(distance),
        batteryUsedPct: toNum(batteryPct),
        avgSpeedKmh:    toNum(speed),
        temperatureC:   Number(temp),
        acOn,
        kwhUsed,
        efficiencyWhKm: effKwh100 ? Math.round(effKwh100 * 10) : undefined,
      });
      const statsRes = await fetch("/api/community/stats").then(r => r.json()).catch(() => null);
      const avgWhKm: number = statsRes?.stats?.avgEfficiencyWhKm ?? 1600;
      const avgKwh100 = +(avgWhKm / 10).toFixed(1);
      const myKwh100 = effKwh100 ?? avgKwh100;
      const diffPct = Math.round(((avgKwh100 - myKwh100) / avgKwh100) * 100);
      setResult({ distanceKm: Number(distance), effKwh100: myKwh100, avgEffKwh100: avgKwh100, diffPct });
      setState("done");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to submit");
      setState("error");
    }
  }

  if (state === "done" && result) {
    const better = result.diffPct > 0;
    return (
      <div className="max-w-lg space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-3xl mb-2">{better ? "🌟" : "📊"}</p>
          <p className="text-3xl font-black text-green-700">{result.effKwh100} kWh/100km</p>
          <p className="text-sm text-slate-600 mt-1">Your efficiency on this {result.distanceKm} km trip</p>
        </div>
        <div className="bg-white border border-[#E6E9F2] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">vs average driver</span>
            <span className={`text-sm font-black ${better ? "text-green-600" : "text-orange-500"}`}>
              {better ? `${result.diffPct}% more efficient` : `${Math.abs(result.diffPct)}% above average`}
            </span>
          </div>
          {[
            { label: "You", val: result.effKwh100, color: better ? "bg-green-500" : "bg-orange-400" },
            { label: "Avg", val: result.avgEffKwh100, color: "bg-slate-200" },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-500 w-8">{row.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3">
                <div className={`h-3 rounded-full ${row.color}`}
                  style={{ width: `${Math.min(100, (row.val / 25) * 100)}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-800 w-14 text-right tabular-nums">{row.val} kWh</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setState("idle"); setResult(null); }}
            className="flex-1 py-2.5 border border-[#E6E9F2] rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Log another
          </button>
          <Link href="/community?tab=leaderboard"
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold text-center hover:bg-green-600">
            View leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-slate-900">See how your trip compares</h2>
        <p className="text-sm text-slate-500 mt-0.5">Just distance and battery used. Takes 20 seconds.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your EV</label>
        <select className="w-full border border-[#D1D9F0] rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          value={model} onChange={e => setModel(e.target.value)}>
          {EV_MODELS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Distance driven" placeholder="e.g. 80" value={distance}
          onChange={setDistance} min={0.1} max={2000} required hint="km" />
        <NumInput label="Battery used" placeholder="e.g. 25" value={batteryPct}
          onChange={setBatteryPct} min={1} max={100} hint="% of full charge" />
      </div>

      {effKwh100 && effKwh100 >= 5 && effKwh100 <= 50 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-green-700">Live efficiency</span>
          <span className="text-lg font-black text-green-600">{effKwh100} kWh/100km</span>
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer text-xs text-slate-400 font-medium list-none flex items-center gap-1.5 hover:text-slate-600">
          <span className="group-open:hidden">▸</span><span className="hidden group-open:inline">▾</span>
          More details (optional)
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <NumInput label="Avg speed" placeholder="e.g. 60" value={speed}
            onChange={setSpeed} min={0} max={250} hint="km/h" />
          <NumInput label="Temperature" placeholder="30" value={temp}
            onChange={setTemp} min={-20} max={60} hint="°C" />
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Route type</label>
            <div className="flex gap-2">
              {["city", "highway", "mixed"].map(r => (
                <button key={r} type="button" onClick={() => setRouteType(r)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                    routeType === r ? "bg-green-500 text-white border-green-500" : "border-[#E6E9F2] text-slate-600 bg-slate-50"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setAcOn(!acOn)}
                className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${acOn ? "bg-green-500" : "bg-slate-200"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${acOn ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm text-slate-700">AC was on</span>
            </label>
          </div>
        </div>
      </details>

      {state === "error" && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errMsg}</p>
      )}

      <button type="submit" disabled={state === "loading" || !distance || !canSubmit}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors text-sm">
        {state === "loading" ? "Calculating your score…" : "See how I compare →"}
      </button>
      <p className="text-xs text-slate-400 text-center">No account needed · Your data stays private</p>
    </form>
  );
}

// ─── Tab: Charging Report ─────────────────────────────────────────────────────

function ChargingReportTab() {
  const [form, setForm] = useState({
    vehicleModel: EV_MODELS[0], stationName: "",
    startBatteryPct: "", endBatteryPct: "",
    kwhAdded: "", costPkr: "", chargingTimeMin: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const fields: { key: keyof typeof form; label: string; ph: string; min: number; max: number }[] = [
    { key: "startBatteryPct", label: "Start battery %", ph: "e.g. 20",  min: 0, max: 100    },
    { key: "endBatteryPct",   label: "End battery %",   ph: "e.g. 80",  min: 0, max: 100    },
    { key: "kwhAdded",        label: "kWh added",       ph: "e.g. 35",  min: 0, max: 200    },
    { key: "costPkr",         label: "Cost (PKR)",      ph: "e.g. 1200", min: 0, max: 200000 },
    { key: "chargingTimeMin", label: "Time (min)",      ph: "e.g. 45",  min: 0, max: 600    },
  ];

  const allValid = fields.every(f => validNum(form[f.key] as string, f.min, f.max));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allValid) return;
    setState("loading");
    try {
      await postReport({
        type: "charging_session",
        vehicleModel:    form.vehicleModel,
        stationName:     form.stationName || undefined,
        startBatteryPct: toNum(form.startBatteryPct),
        endBatteryPct:   toNum(form.endBatteryPct),
        kwhAdded:        toNum(form.kwhAdded),
        costPkr:         toNum(form.costPkr),
        chargingTimeMin: toNum(form.chargingTimeMin),
      });
      setState("done");
    } catch { setState("error"); }
  }

  if (state === "done") {
    const kwh = Number(form.kwhAdded);
    const cost = Number(form.costPkr);
    const perKwh = kwh && cost ? (cost / kwh).toFixed(0) : null;
    return (
      <div className="text-center py-10 max-w-lg space-y-4">
        <p className="text-5xl">⚡</p>
        <p className="text-xl font-bold text-slate-900">Charging session saved</p>
        {perKwh && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-green-700 text-sm">You paid <span className="font-black text-lg">PKR {perKwh}/kWh</span></p>
            <p className="text-slate-500 text-xs mt-0.5">Typical Pakistan rate: PKR 35–60/kWh</p>
          </div>
        )}
        <button onClick={() => setState("idle")} className="text-green-600 text-sm hover:underline">
          Log another session
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-slate-900">What did you pay per kWh?</h2>
        <p className="text-sm text-slate-500 mt-0.5">Track your real charging cost across Pakistan.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your EV</label>
        <select className="w-full border border-[#E6E9F2] rounded-xl px-3 py-2.5 text-sm bg-slate-50"
          value={form.vehicleModel} onChange={e => setForm(f => ({ ...f, vehicleModel: e.target.value }))}>
          {EV_MODELS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Station (optional)</label>
        <input type="text" maxLength={120}
          className="w-full border border-[#D1D9F0] rounded-xl px-3.5 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          value={form.stationName} onChange={e => setForm(f => ({ ...f, stationName: e.target.value }))}
          placeholder="e.g. Shell Karachi, HPOW Lahore" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <NumInput key={f.key} label={f.label} placeholder={f.ph}
            value={form[f.key] as string}
            onChange={v => setForm(prev => ({ ...prev, [f.key]: v }))}
            min={f.min} max={f.max} />
        ))}
      </div>

      {state === "error" && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          Failed to save. Please check your inputs.
        </p>
      )}

      <button type="submit" disabled={state === "loading" || !allValid}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors text-sm">
        {state === "loading" ? "Saving…" : "Save session →"}
      </button>
      <p className="text-xs text-slate-400 text-center">No account needed · Your data stays private</p>
    </form>
  );
}

// ─── Tab: Station Status ──────────────────────────────────────────────────────

const KNOWN_STATIONS = [
  { id: "karachi-shell-1",  name: "Shell EV — Karachi" },
  { id: "lahore-hpow-1",    name: "HPOW — Lahore" },
  { id: "islamabad-nust-1", name: "NUST DC Fast — Islamabad" },
  { id: "m2-motorway-1",    name: "M2 Motorway Stop" },
  { id: "islamabad-f10-1",  name: "F-10 Charging — Islamabad" },
  { id: "lahore-dha-1",     name: "DHA EV Station — Lahore" },
];

function StationStatusTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Is this charger working today?</h2>
        <p className="text-sm text-slate-500 mt-0.5">One tap. Helps every driver heading there right now.</p>
      </div>
      <div className="space-y-3">
        {KNOWN_STATIONS.map(s => (
          <div key={s.id} className="bg-white border border-[#E6E9F2] rounded-2xl px-5 py-4">
            <p className="font-semibold text-slate-900 text-sm mb-3">{s.name}</p>
            <ChargerReportButtons stationId={s.id} stationName={s.name} />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">
        Don&apos;t see your station?{" "}
        <Link href="/charging-map" className="text-green-600 hover:underline">Find it on the map →</Link>
      </p>
    </div>
  );
}

// ─── Tab: Efficiency Score ────────────────────────────────────────────────────

interface EffResult {
  kwhPer100: number;
  avgKwhPer100: number;
  diffPct: number;
  rank: number | null;
  totalDrivers: number;
}

function EfficiencyTab() {
  const [model, setModel]         = useState(EV_MODELS[0]);
  const [distance, setDistance]   = useState("");
  const [kwhUsed, setKwhUsed]     = useState("");
  const [temp, setTemp]           = useState("30");
  const [routeType, setRouteType] = useState("mixed");
  const [state, setState]         = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult]       = useState<EffResult | null>(null);

  const effKwh100 = kwhUsed && distance
    ? +((Number(kwhUsed) * 100) / Number(distance)).toFixed(1) : null;

  const valid =
    validNum(distance, 1, 2000) && !!distance &&
    validNum(kwhUsed, 0.1, 200) && !!kwhUsed &&
    validNum(temp, -20, 60) &&
    !!effKwh100 && effKwh100 >= 5 && effKwh100 <= 50;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !effKwh100) return;
    setState("loading");
    try {
      await postReport({
        type: "efficiency_report",
        vehicleModel:   model,
        efficiencyWhKm: Math.round(effKwh100 * 10),
        distanceKm:     Number(distance),
        temperatureC:   Number(temp),
        routeType,
      });

      const [lbRes, statsRes] = await Promise.all([
        fetch("/api/community/leaderboard").then(r => r.json()).catch(() => null),
        fetch("/api/community/stats").then(r => r.json()).catch(() => null),
      ]);
      const lb: { vehicleModel: string; bestKwh100km: number }[] = lbRes?.leaderboard ?? [];
      const avgWhKm: number = statsRes?.stats?.avgEfficiencyWhKm ?? 1600;
      const avgKwh100 = +(avgWhKm / 10).toFixed(1);
      const diffPct = Math.round(((avgKwh100 - effKwh100) / avgKwh100) * 100);
      const modelEntry = lb.find(r => r.vehicleModel === model);
      const rank = modelEntry ? lb.indexOf(modelEntry) + 1 : null;

      setResult({ kwhPer100: effKwh100, avgKwhPer100: avgKwh100, diffPct, rank, totalDrivers: lb.length });
      setState("done");
    } catch { setState("idle"); }
  }

  if (state === "done" && result) {
    const better = result.diffPct > 0;
    return (
      <div className="max-w-lg space-y-4">
        <div className={`rounded-2xl p-6 text-center ${better ? "bg-green-500 text-white" : "bg-slate-100 text-slate-900"}`}>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Your EV Efficiency Score</p>
          <p className="text-5xl font-black tabular-nums">{result.kwhPer100}</p>
          <p className="text-sm opacity-80 mt-1">kWh per 100 km · {model}</p>
          {result.rank && (
            <p className="mt-3 text-sm font-bold opacity-90">
              #{result.rank} on the leaderboard{result.totalDrivers > 1 ? ` out of ${result.totalDrivers}` : ""}
            </p>
          )}
        </div>
        <div className="bg-white border border-[#E6E9F2] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">vs average driver</span>
            <span className={`text-sm font-black ${better ? "text-green-600" : "text-orange-500"}`}>
              {better ? `${result.diffPct}% more efficient` : `${Math.abs(result.diffPct)}% above average`}
            </span>
          </div>
          {[
            { label: "You", val: result.kwhPer100, color: better ? "bg-green-500" : "bg-orange-400" },
            { label: "Avg", val: result.avgKwhPer100, color: "bg-slate-200" },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-slate-500 w-8">{row.label}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3">
                <div className={`h-3 rounded-full ${row.color}`}
                  style={{ width: `${Math.min(100, (row.val / 25) * 100)}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-800 w-14 text-right tabular-nums">{row.val} kWh</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setState("idle"); setResult(null); }}
            className="flex-1 py-2.5 border border-[#E6E9F2] rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Submit again
          </button>
          <Link href="/community?tab=leaderboard"
            className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold text-center hover:bg-green-600 transition-colors">
            Full leaderboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-lg">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Your EV Efficiency Score</h2>
        <p className="text-sm text-slate-500 mt-0.5">See how your kWh/100km compares with other drivers.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your EV</label>
        <select className="w-full border border-[#D1D9F0] rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
          value={model} onChange={e => setModel(e.target.value)}>
          {EV_MODELS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Distance driven" placeholder="e.g. 200" value={distance}
          onChange={setDistance} min={1} max={2000} required hint="km" />
        <NumInput label="Energy used" placeholder="e.g. 32" value={kwhUsed}
          onChange={setKwhUsed} min={0.1} max={200} required hint="kWh" />
      </div>

      {effKwh100 && effKwh100 >= 5 && effKwh100 <= 50 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-green-700 font-medium">Your efficiency</span>
          <span className="text-xl font-black text-green-600">{effKwh100} kWh/100km</span>
        </div>
      )}
      {effKwh100 && (effKwh100 < 5 || effKwh100 > 50) && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {effKwh100} kWh/100km looks unusual — please double-check your inputs.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <NumInput label="Temperature (°C)" placeholder="30" value={temp}
          onChange={setTemp} min={-20} max={60} />
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Route type</label>
          <select className="w-full border border-[#D1D9F0] rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
            value={routeType} onChange={e => setRouteType(e.target.value)}>
            <option value="city">City</option>
            <option value="highway">Highway</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={state === "loading" || !valid}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-colors text-sm">
        {state === "loading" ? "Calculating your rank…" : "Get my efficiency score →"}
      </button>
      <p className="text-xs text-slate-400 text-center">No account needed · Your data stays private</p>
    </form>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

type TabSetter = (t: Tab) => void;

function OverviewTab({ setTab }: { setTab: TabSetter }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">EV Driver Insights</h2>
        <p className="text-slate-500 text-sm">
          See how your EV actually performs on Pakistani roads — compared with real drivers.
          No account needed. Your data stays private.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { tab: "efficiency" as Tab, icon: "🏆", title: "Your EV Efficiency Score", desc: "See how your kWh/100km compares. Takes 30 seconds.", cta: "Get my score", accent: true },
          { tab: "log-trip" as Tab,   icon: "📍", title: "See how your trip compares", desc: "Distance + battery used — see where you rank instantly.", cta: "Log a trip" },
          { tab: "station" as Tab,    icon: "⚡", title: "Is this charger working?", desc: "One tap helps every driver heading to that station today.", cta: "Report status" },
          { tab: "charging" as Tab,   icon: "💰", title: "What did you pay per kWh?", desc: "Log your last charge and compare with Pakistan averages.", cta: "Log session" },
        ].map(card => (
          <button key={card.tab} onClick={() => setTab(card.tab)}
            className={`group text-left rounded-2xl p-5 border transition-all ${
              card.accent
                ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                : "bg-slate-50 border-[#E6E9F2] hover:border-green-400 hover:bg-green-50"
            }`}>
            <p className="text-2xl mb-2">{card.icon}</p>
            <p className={`font-bold text-sm mb-1 ${card.accent ? "text-white" : "text-slate-900 group-hover:text-green-700"}`}>
              {card.title}
            </p>
            <p className={`text-xs leading-relaxed ${card.accent ? "text-green-100" : "text-slate-500"}`}>
              {card.desc}
            </p>
            <p className={`text-xs font-semibold mt-3 ${card.accent ? "text-green-200" : "text-green-600"}`}>
              {card.cta} →
            </p>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-[#E6E9F2]">
        <h3 className="font-bold text-base mb-3">Why track your EV?</h3>
        <div className="space-y-2.5">
          {[
            { icon: "📊", text: "See your real-world efficiency vs manufacturer claims" },
            { icon: "🏆", text: "Compete for the lowest kWh/100km in Pakistan" },
            { icon: "💰", text: "Know exactly what you pay per kWh at every station" },
            { icon: "🔒", text: "All data is private — no account, no tracking, no ads" },
          ].map(item => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview",    label: "Overview",    icon: "🏠" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { id: "efficiency",  label: "My Score",    icon: "📊" },
  { id: "log-trip",    label: "Log Trip",    icon: "🗺️" },
  { id: "charging",    label: "Charging",    icon: "⚡" },
  { id: "station",     label: "Stations",    icon: "📍" },
];

export default function CommunityClient({ initialTab }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "overview");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto pb-1 mb-8 scrollbar-hide" style={{ background: "#EEF2FF" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              tab === t.id
                ? "bg-white text-indigo-600 font-semibold shadow-sm"
                : "text-indigo-400 hover:text-indigo-600 hover:bg-white/50"
            }`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
      <div>
        {tab === "overview"    && <OverviewTab setTab={setTab} />}
        {tab === "leaderboard" && <LeaderboardTab />}
        {tab === "efficiency"  && <EfficiencyTab />}
        {tab === "log-trip"    && <TripLogTab />}
        {tab === "charging"    && <ChargingReportTab />}
        {tab === "station"     && <StationStatusTab />}
      </div>
    </div>
  );
}
