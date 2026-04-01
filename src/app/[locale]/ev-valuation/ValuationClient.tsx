"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ValuationInput, ValuationResult } from "@/app/api/ev-valuation/route";
import Link from "next/link";

const CITIES = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad",
  "Multan","Peshawar","Quetta","Hyderabad","Sialkot","Gujranwala","Bahawalpur",
];
const YEARS = [2026,2025,2024,2023,2022,2021,2020,2019,2018];

interface EvOption { slug: string; label: string; hasPrice: boolean; }

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

export default function ValuationClient({ evs }: { evs: EvOption[] }) {
  const params = useSearchParams();
  const [form, setForm] = useState<ValuationInput>({
    evSlug: "",
    year: Number(params.get("year")) || 2023,
    odometer: Number(params.get("odometer")) || 30000,
    batteryGrade: (params.get("batteryGrade") as any) || "unknown",
    city: "",
    condition: "good",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof ValuationInput>(k: K, v: ValuationInput[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.evSlug || !form.city) { setError("Select an EV and your city."); return; }
    setError(""); setLoading(true);
    const res = await fetch("/api/ev-valuation", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); setLoading(false); return; }
    setResult(data); setLoading(false);
  }

  const fmt = (n: number) => `PKR ${(n / 1_000_000).toFixed(2)}M`;

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (result) return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-8">

        <div className="text-center mb-8">
          <div className="text-slate-400 text-sm uppercase tracking-widest mb-2">{result.evName}</div>
          <div className="text-6xl font-black text-slate-900 mb-2">{fmt(result.midpoint)}</div>
          <div className="text-slate-500 text-sm">
            {fmt(result.estimatedMin)} &mdash; {fmt(result.estimatedMax)}
          </div>
          <div className="flex justify-center gap-10 mt-8 pt-8 border-t border-[#E6E9F2]">
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">New price</div>
              <div className="text-slate-900 font-black text-xl">{fmt(result.newPricePkr)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-widest mb-1">Depreciated</div>
              <div className="text-red-500 font-black text-xl">-{result.depreciationPct}%</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6 pb-6 border-b border-[#E6E9F2]">
          {result.breakdown.map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">{row.label}</span>
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${row.impact === "base" ? "text-slate-400" : row.impact.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>
                  {row.impact}
                </span>
                <span className="text-slate-900 font-black text-sm w-24 text-right">{row.value}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-600 leading-relaxed text-sm mb-6">{result.advice}</p>

        <div className="flex gap-3 mb-3">
          <Link href={`/listings/post?evSlug=${form.evSlug}&price=${result.midpoint}`}
            className="flex-1 py-4 rounded-2xl font-black text-white text-center text-sm"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
            List at {fmt(result.midpoint)} →
          </Link>
          <Link href={`/battery-health?evName=${encodeURIComponent(result.evName)}&year=${form.year}&odometer=${form.odometer}`}
            className="flex-1 py-4 rounded-2xl font-black text-sm text-center bg-slate-50 border border-[#E6E9F2] text-slate-700 hover:bg-slate-100 transition-all">
            🔋 Check Battery
          </Link>
        </div>
        <button onClick={() => setResult(null)}
          className="w-full py-3 text-slate-400 hover:text-slate-700 text-sm transition-colors">
          ← Value another
        </button>
      </div>
    </div>
  );

  // ── FORM ───────────────────────────────────────────────────────────────────
  const canSubmit = form.evSlug && form.city;
  return (
    <form onSubmit={submit}>
      <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-7 space-y-8">

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Which EV?</label>
          <select value={form.evSlug} onChange={e => set("evSlug", e.target.value)}
            className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-colors bg-transparent appearance-none cursor-pointer">
            <option value="">Select your EV</option>
            {evs.map(ev => (
              <option key={ev.slug} value={ev.slug} disabled={!ev.hasPrice}>
                {ev.label}{!ev.hasPrice ? " (no data)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Year</label>
            <select value={form.year} onChange={e => set("year", Number(e.target.value))}
              className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-colors bg-transparent appearance-none cursor-pointer">
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Km on clock</label>
            <input type="number" value={form.odometer} onChange={e => set("odometer", Number(e.target.value))}
              className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-2xl font-bold focus:outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={{ background: "transparent", colorScheme: "light" }} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Battery health grade</label>
          <div className="flex flex-wrap gap-2">
            {(["A","B","C","D","F","unknown"] as const).map(g => (
              <BigPill key={g} active={form.batteryGrade === g} onClick={() => set("batteryGrade", g)}>
                {g === "unknown" ? "Don't know" : g}
              </BigPill>
            ))}
          </div>
          {form.batteryGrade === "unknown" && (
            <Link href="/battery-health" className="block mt-3 text-indigo-600 text-sm font-bold hover:text-indigo-700">
              Check battery first — adds PKR 1–3 lakh accuracy →
            </Link>
          )}
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Condition</label>
          <div className="flex gap-2">
            {(["excellent","good","fair","rough"] as const).map(c => (
              <BigPill key={c} active={form.condition === c} onClick={() => set("condition", c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </BigPill>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">City</label>
          <select value={form.city} onChange={e => set("city", e.target.value)}
            className="w-full border-b-2 border-slate-200 pb-3 text-slate-900 text-xl font-bold focus:outline-none focus:border-indigo-500 transition-colors bg-transparent appearance-none cursor-pointer">
            <option value="">Select your city</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={!canSubmit || loading}
          className="w-full py-5 rounded-2xl font-black text-lg text-white transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
          {loading ? "Calculating..." : "Get Valuation →"}
        </button>
      </div>
    </form>
  );
}
