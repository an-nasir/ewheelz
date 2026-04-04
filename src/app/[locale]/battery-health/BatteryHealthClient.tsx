"use client";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { BatteryHealthReport } from "@/app/api/battery-health/route";
import Link from "next/link";

const CITIES = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad",
  "Multan","Peshawar","Quetta","Hyderabad","Sialkot","Gujranwala","Bahawalpur",
];
const YEARS = [2026,2025,2024,2023,2022,2021,2020,2019,2018];

const GRADE_COLOR: Record<string, string> = {
  A: "#16A34A", B: "#6366F1", C: "#D97706", D: "#EA580C", F: "#DC2626",
};
const GRADE_BG: Record<string, string> = {
  A: "#F0FDF4", B: "#EEF2FF", C: "#FFFBEB", D: "#FFF7ED", F: "#FEF2F2",
};

function scoreToGrade(pct: number) {
  if (pct >= 88) return "A";
  if (pct >= 76) return "B";
  if (pct >= 62) return "C";
  if (pct >= 48) return "D";
  return "F";
}

function BigPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="flex-1 py-4 rounded-xl text-sm font-black transition-all border-2"
      style={active
        ? { background: "#6366F1", color: "#fff", borderColor: "#6366F1" }
        : { background: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" }}>
      {children}
    </button>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
    </div>
  );
}

export default function BatteryHealthClient() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BatteryHealthReport | null>(null);
  const [showLead, setShowLead] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "", city: "" });

  const [evName, setEvName]        = useState(params.get("evName") || "");
  const [year, setYear]            = useState(Number(params.get("year")) || 2023);
  const [odometer, setOdometer]    = useState(Number(params.get("odometer")) || 0);
  const [originalRange, setOrig]   = useState(0);
  const [currentRange, setCurrent] = useState(0);
  const [dcFreq, setDcFreq]        = useState<"never"|"occasionally"|"regularly"|"daily">("occasionally");
  const [symptoms, setSymptoms]    = useState(false);

  // Validation constants
  const ODOMETER_MAX = 500000;
  const RANGE_MIN = 100;
  const RANGE_MAX = 1000;

  // Validation errors
  const odometerError = odometer < 0 || odometer > ODOMETER_MAX;
  const originalRangeError = originalRange > 0 && (originalRange < RANGE_MIN || originalRange > RANGE_MAX);
  const currentRangeError = currentRange > 0 && (currentRange < 0 || currentRange > RANGE_MAX);
  const rangeError = currentRange > 0 && originalRange > 0 && currentRange > originalRange;

  // Live grade preview — updates as user types
  const liveGrade = useMemo(() => {
    if (!originalRange || !currentRange || rangeError || originalRangeError || currentRangeError) return null;
    const pct = Math.min(100, Math.round((currentRange / originalRange) * 100));
    return { pct, grade: scoreToGrade(pct) };
  }, [originalRange, currentRange, rangeError, originalRangeError, currentRangeError]);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/battery-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evName, year, odometer, originalRange, currentRange,
        dcFrequency: dcFreq,
        chargeTo100: "sometimes",
        chargeTimeChange: symptoms ? "significantly" : "no",
        warningLights: symptoms,
        heatRangeLoss: "minimal",
      }),
    });
    setReport(await res.json());
    setLoading(false);
  }

  async function submitLead() {
    await fetch("/api/leads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evName, ...lead, message: `Grade ${report?.grade}`, source: "battery_health" }),
    });
    setLeadDone(true);
  }

  const canSubmit = evName.trim() && year && originalRange > 0 && currentRange > 0 && !rangeError && !odometerError && !originalRangeError && !currentRangeError;

  // ── REPORT ─────────────────────────────────────────────────────────────────
  if (report) {
    const gc = GRADE_COLOR[report.grade];
    const gbg = GRADE_BG[report.grade];
    return (
      <div className="space-y-4">
        {/* Grade card */}
        <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-8 text-center">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: gbg, border: `3px solid ${gc}` }}>
            <span className="text-6xl font-black" style={{ color: gc }}>{report.grade}</span>
          </div>
          <div className="text-slate-400 text-sm mb-1">{evName} · {year} · {odometer.toLocaleString()} km</div>
          <div className="text-5xl font-black text-slate-900 mb-1">{report.healthPct}%</div>
          <div className="text-slate-500 text-sm mb-4">Battery Health</div>
          <p className="text-slate-600 leading-relaxed">{report.verdict}</p>
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-6 space-y-5">
          {report.categories.map(cat => (
            <div key={cat.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 text-sm font-semibold">{cat.icon} {cat.label}</span>
                <span className="text-slate-900 font-black text-sm">{cat.score}<span className="text-slate-400 font-normal">/100</span></span>
              </div>
              <ScoreBar score={cat.score}
                color={cat.score >= 75 ? "#6366F1" : cat.score >= 50 ? "#F59E0B" : "#EF4444"} />
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="rounded-2xl p-5 border" style={{ background: gbg, borderColor: `${gc}40` }}>
          <p className="text-slate-700 leading-relaxed text-sm">{report.recommendation}</p>
        </div>

        {/* Workshop CTA */}
        {!leadDone ? (
          <div>
            {!showLead ? (
              <button onClick={() => setShowLead(true)}
                className="w-full py-4 rounded-2xl font-black text-white text-base"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                Get a verified workshop report →
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E6E9F2] shadow-sm p-5 space-y-3">
                {[
                  { ph: "Your name", val: lead.name, key: "name" },
                  { ph: "WhatsApp number", val: lead.phone, key: "phone" },
                ].map(f => (
                  <input key={f.key} value={f.val} placeholder={f.ph}
                    onChange={e => setLead(l => ({ ...l, [f.key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-base bg-white" />
                ))}
                <select value={lead.city} onChange={e => setLead(l => ({ ...l, city: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 text-base bg-white">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={submitLead} disabled={!lead.name || !lead.phone || !lead.city}
                  className="w-full py-4 rounded-xl font-black text-white disabled:opacity-30"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                  We&apos;ll WhatsApp you in 2 hours
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl text-center py-5">
            <div className="text-2xl mb-1">✅</div>
            <p className="text-emerald-700 font-bold">We&apos;ll WhatsApp you shortly.</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/ev-valuation?evName=${encodeURIComponent(evName)}&year=${year}&odometer=${odometer}&batteryGrade=${report.grade}`}
            className="flex-1 py-4 rounded-2xl font-black text-sm text-center bg-white border border-[#E6E9F2] text-slate-700 hover:bg-slate-50 transition-all">
            💰 What&apos;s it worth now?
          </Link>
          <button onClick={() => setReport(null)}
            className="flex-1 py-4 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-800 bg-white border border-[#E6E9F2] transition-all">
            ← Check another EV
          </button>
        </div>
      </div>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-[#E6E9F2] shadow-sm p-7 space-y-8 pt-8" style={{ background: "linear-gradient(135deg,#F5F3FF 0%,#FAFBFF 100%)" }}>

      {/* Live grade preview */}
      {liveGrade && (
        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all"
          style={{ background: GRADE_BG[liveGrade.grade], borderColor: `${GRADE_COLOR[liveGrade.grade]}50` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl text-white flex-shrink-0"
            style={{ background: GRADE_COLOR[liveGrade.grade] }}>
            {liveGrade.grade}
          </div>
          <div>
            <div className="font-black text-slate-900">{liveGrade.pct}% range retained</div>
            <div className="text-sm text-slate-500">Submit below for the full report</div>
          </div>
        </div>
      )}

      {/* EV name */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Your EV</label>
        <input value={evName} onChange={e => setEvName(e.target.value)}
          placeholder="e.g. BYD Atto 3"
          className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-2xl font-bold placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-colors bg-transparent" />
      </div>

      {/* Year + Odometer */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-colors bg-transparent appearance-none cursor-pointer">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Km on clock</label>
          <input type="number" value={odometer || ""} onChange={e => setOdometer(Number(e.target.value))}
            min="0" max={ODOMETER_MAX}
            placeholder="52000"
            className={`w-full border-b-2 pb-3 text-slate-900 text-2xl font-bold placeholder-slate-300 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${odometerError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
            style={{ background: "transparent", colorScheme: "light" }} />
          {odometerError && (
            <p className="text-red-500 text-xs mt-2">Odometer must be between 0 and {ODOMETER_MAX.toLocaleString()} km.</p>
          )}
        </div>
      </div>

      {/* Range — live grade appears when both filled */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Range (km)</label>
        <div className="text-slate-400 text-xs mb-4">Enter original range when bought, and what it shows on a full charge today</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-2">When bought</div>
            <input type="number" value={originalRange || ""} onChange={e => setOrig(Number(e.target.value))}
              min={RANGE_MIN} max={RANGE_MAX}
              placeholder="420"
              className={`w-full border-b-2 pb-3 text-slate-900 text-2xl font-bold placeholder-slate-300 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${originalRangeError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
              style={{ background: "transparent", colorScheme: "light" }} />
            {originalRangeError && (
              <p className="text-red-500 text-xs mt-2">Original range must be between {RANGE_MIN} and {RANGE_MAX} km.</p>
            )}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-2">Today (full charge)</div>
            <input type="number" value={currentRange || ""} onChange={e => setCurrent(Number(e.target.value))}
              min="0" max={RANGE_MAX}
              placeholder="365"
              className={`w-full border-b-2 pb-3 text-slate-900 text-2xl font-bold placeholder-slate-300 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${rangeError || currentRangeError ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-indigo-500"}`}
              style={{ background: "transparent", colorScheme: "light" }} />
          </div>
        </div>
        {currentRangeError && (
          <p className="text-red-500 text-xs mt-2">Current range must be between 0 and {RANGE_MAX} km.</p>
        )}
        {rangeError && !currentRangeError && (
          <p className="text-red-500 text-xs mt-2">Current range can&apos;t be more than original — a battery only degrades, not improves.</p>
        )}
      </div>

      {/* DC charging */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">DC fast charging frequency?</label>
        <div className="flex gap-2">
          {(["never","occasionally","regularly","daily"] as const).map(v => (
            <BigPill key={v} active={dcFreq === v} onClick={() => setDcFreq(v)}>
              {v === "occasionally" ? "1–2×" : v === "regularly" ? "3–5×" : v.charAt(0).toUpperCase() + v.slice(1)}
            </BigPill>
          ))}
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Warning lights or errors?</label>
        <div className="flex gap-3">
          <BigPill active={!symptoms} onClick={() => setSymptoms(false)}>All good</BigPill>
          <BigPill active={symptoms} onClick={() => setSymptoms(true)}>Yes, warnings</BigPill>
        </div>
      </div>

      <button onClick={submit} disabled={!canSubmit || loading}
        className="w-full py-5 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
        {loading ? "Analyzing..." : "Get My Grade →"}
      </button>
    </div>
  );
}
