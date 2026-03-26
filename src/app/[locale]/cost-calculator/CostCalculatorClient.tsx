"use client";
// src/app/cost-calculator/CostCalculatorClient.tsx — all interactive calculator logic

import { useState, useEffect, useRef } from "react";

interface EvOption {
  slug: string;
  label: string;
  range: number | null;
}

interface CalcResult {
  evModel: string;
  distanceKm: number;
  efficiencyWhKm: number;
  energyKwh: number;
  electricityPricePkr: number;
  evCostPkr: number;
  petrolCostPkr: number;
  savingsPkr: number;
  savingsPct: number;
  co2SavedKg: number;
  co2EvKg: number;
  co2PetrolKg: number;
  chargesNeeded: number;
  costPerKm: number;
  monthly: { evCostPkr: number; petrolCostPkr: number; savingsPkr: number };
  annual: { evCostPkr: number; petrolCostPkr: number; savingsPkr: number; co2SavedKg: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pkr(n: number) {
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `PKR ${(n / 1000).toFixed(0)}K`;
  return `PKR ${n.toLocaleString()}`;
}

function SavingBar({ pct }: { pct: number }) {
  return (
    <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
      <div
        className="h-3 rounded-full transition-all duration-700"
        style={{ background: "linear-gradient(90deg,#22C55E,#10B981)", width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

function MetricCard({
  label,
  ev,
  petrol,
  unit,
  lower = "is better",
}: {
  label: string;
  ev: number;
  petrol: number;
  unit: string;
  lower?: string;
}) {
  const evWins = ev < petrol;
  return (
    <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
      <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">{label}</div>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <div className="text-xs text-slate-500 mb-1">⚡ EV</div>
          <div className={`text-xl font-bold`} style={evWins ? { color: "#16A34A" } : { color: "#475569" }}>
            {ev.toFixed(1)} {unit}
          </div>
          {evWins && <div className="text-xs font-medium mt-0.5" style={{ color: "#16A34A" }}>✓ {lower}</div>}
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-600 mb-1">⛽ Petrol</div>
          <div className="text-xl font-bold text-red-400">
            {petrol.toFixed(1)} {unit}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CostCalculatorClient() {
  const [evOptions, setEvOptions] = useState<EvOption[]>([]);
  const [evSlug, setEvSlug] = useState("");
  const [distance, setDistance] = useState(420); // Karachi→Lahore-ish
  const [electricityPrice, setElectricityPrice] = useState(50);
  const [petrolPrice, setPetrolPrice] = useState(293);
  const [petrolKmPerL, setPetrolKmPerL] = useState(12);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"trip" | "monthly" | "annual">("monthly");
  const [evPremiumPkr, setEvPremiumPkr] = useState(1500000); // break-even input
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Pre-fill from URL params (linked from trip planner)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("evSlug");
    const dist = params.get("distance");
    if (slug) setEvSlug(slug);
    if (dist) setDistance(Number(dist));
  }, []);

  // Load EV list
  useEffect(() => {
    fetch("/api/trip-planner")
      .then((r) => r.json())
      .then((d) => {
        setEvOptions(d.evModels ?? []);
        if (!evSlug && d.evModels?.length) setEvSlug(d.evModels[0].slug);
      })
      .catch(() => {});
  }, []);

  async function calculate() {
    if (!evSlug) return;
    setLoading(true);
    try {
      const res = await fetch("/api/cost-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evSlug,
          distanceKm: distance,
          electricityPricePkr: electricityPrice,
          petrolPricePkr: petrolPrice,
          petrolCarKmPerLitre: petrolKmPerL,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  // Auto-calculate when inputs change
  useEffect(() => {
    if (evSlug) calculate();
  }, [evSlug, distance, electricityPrice, petrolPrice, petrolKmPerL]);

  // Share: copy a human-readable text summary to clipboard
  function shareResult() {
    if (!result) return;
    const monthly = result.monthly;
    const text = [
      `⚡ EV vs Petrol — Pakistan Reality Check`,
      ``,
      `EV (${result.evModel}): PKR ${monthly.evCostPkr.toLocaleString()}/month`,
      `Petrol car: PKR ${monthly.petrolCostPkr.toLocaleString()}/month`,
      `Monthly savings: PKR ${monthly.savingsPkr.toLocaleString()} (${result.savingsPct}% cheaper)`,
      `Annual savings: PKR ${result.annual.savingsPkr.toLocaleString()}`,
      `CO₂ saved/year: ${result.annual.co2SavedKg.toLocaleString()} kg`,
      ``,
      `Calculated at eWheelz.pk`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Break-even months (EV premium / monthly savings)
  const breakEvenMonths = result && result.monthly.savingsPkr > 0
    ? Math.round(evPremiumPkr / result.monthly.savingsPkr) : null;

  const selectedEv = evOptions.find((e) => e.slug === evSlug);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#22C55E 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "15%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
              💰 Cost Calculator
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">EV vs Petrol</h1>
            <p className="text-indigo-100 text-lg max-w-xl">
              See exactly how much you save every month by switching to an EV — with real Pakistan electricity &amp; petrol prices.
            </p>
          </div>
        </div>
      </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="lg:w-[340px] flex-shrink-0 space-y-5">
          {/* EV selector */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Your EV
            </div>
            <div>
              <label className="text-xs font-medium text-content-muted mb-1 block">Select EV</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                style={{ background: "#FFFFFF", border: "1px solid #C7D2FE" }}
                value={evSlug}
                onChange={(e) => setEvSlug(e.target.value)}
              >
                {evOptions.map((ev) => (
                  <option key={ev.slug} value={ev.slug}>
                    {ev.label}
                  </option>
                ))}
              </select>
              {selectedEv?.range && (
                <div className="text-xs mt-1" style={{ color: "#16A34A" }}>
                  Real-world range: {selectedEv.range} km
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-content-muted mb-1 flex justify-between">
                <span>Distance (km)</span>
                <span className="font-bold text-content">{distance.toLocaleString()} km</span>
              </label>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-neon-green"
              />
              <div className="flex justify-between text-xs text-content-muted mt-0.5">
                <span>10 km</span><span>1,000 km</span><span>2,000 km</span>
              </div>
              {/* Quick distance presets */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[
                  { label: "City Day", km: 50 },
                  { label: "Lahore–ISB", km: 380 },
                  { label: "KHI–LHR", km: 1250 },
                ].map((p) => (
                  <button
                    key={p.km}
                    onClick={() => setDistance(p.km)}
                    className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                    style={distance === p.km
                      ? { background: "#DCFCE7", borderColor: "#22C55E", color: "#16A34A" }
                      : { borderColor: "#E6E9F2", color: "#64748B" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Electricity + Petrol prices */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pakistan Prices
            </div>

            <div>
              <label className="text-xs font-medium text-content-muted mb-1 flex justify-between">
                <span>Electricity (PKR/kWh)</span>
                <span className="font-bold text-content">PKR {electricityPrice}</span>
              </label>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(Number(e.target.value))}
                className="w-full accent-neon-cyan"
              />
              <div className="text-xs text-content-muted mt-0.5">
                Home charging: ~PKR 40–60 · Public: ~PKR 60–90
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-content-muted mb-1 flex justify-between">
                <span>Petrol (PKR/litre)</span>
                <span className="font-bold text-content">PKR {petrolPrice}</span>
              </label>
              <input
                type="range"
                min={200}
                max={400}
                step={5}
                value={petrolPrice}
                onChange={(e) => setPetrolPrice(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-content-muted mb-1 flex justify-between">
                <span>Petrol car fuel economy</span>
                <span className="font-bold text-content">{petrolKmPerL} km/L</span>
              </label>
              <input
                type="range"
                min={6}
                max={20}
                step={1}
                value={petrolKmPerL}
                onChange={(e) => setPetrolKmPerL(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="text-xs text-content-muted mt-0.5">
                City traffic: 8–10 km/L · Highway: 12–16 km/L
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading && !result && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#22C55E transparent transparent transparent" }} />
            </div>
          )}

          {result && (
            <div className="space-y-5" ref={resultRef}>
              {/* Big savings number */}
              <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg,#F0FDF4,#EEF2FF)", border: "1px solid #86EFAC" }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">
                      {tab === "monthly" ? "You save every month" : tab === "annual" ? "You save every year" : "You save on this trip"}
                    </div>
                    <div className="text-4xl font-black mb-1" style={{ color: "#16A34A" }}>
                      {pkr(tab === "monthly" ? result.monthly.savingsPkr : tab === "annual" ? result.annual.savingsPkr : result.savingsPkr)}
                    </div>
                    <div className="text-slate-500 text-sm">
                      {result.savingsPct}% cheaper than petrol · {result.evModel}
                    </div>
                  </div>
                  {/* Share button */}
                  <button onClick={shareResult}
                    className="flex-shrink-0 flex items-center gap-1.5 transition-colors text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.80)", border: "1px solid #E6E9F2" }}>
                    {copied ? "✓ Copied!" : "📤 Share"}
                  </button>
                </div>

                {/* Savings bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>⚡ EV: {pkr(result.evCostPkr)}</span>
                    <span>⛽ Petrol: {pkr(result.petrolCostPkr)}</span>
                  </div>
                  <SavingBar pct={result.savingsPct} />
                </div>
              </div>

              {/* Tabs: Trip / Monthly / Annual */}
              <div className="flex gap-1 rounded-xl p-1" style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                {(["trip", "monthly", "annual"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors capitalize ${
                      tab === t ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                    style={tab === t ? { background: "linear-gradient(135deg,#22C55E,#10B981)" } : {}}
                  >
                    {t === "trip" ? "This Trip" : t === "monthly" ? "Monthly (~22 days)" : "Annual (~260 days)"}
                  </button>
                ))}
              </div>

              {/* Cost breakdown for selected tab */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "EV Cost",
                    value: tab === "trip" ? result.evCostPkr : tab === "monthly" ? result.monthly.evCostPkr : result.annual.evCostPkr,
                    icon: "⚡",
                    color: "neon-green",
                  },
                  {
                    label: "Petrol Cost",
                    value: tab === "trip" ? result.petrolCostPkr : tab === "monthly" ? result.monthly.petrolCostPkr : result.annual.petrolCostPkr,
                    icon: "⛽",
                    color: "amber",
                  },
                  {
                    label: "Your Savings",
                    value: tab === "trip" ? result.savingsPkr : tab === "monthly" ? result.monthly.savingsPkr : result.annual.savingsPkr,
                    icon: "💰",
                    color: "neon-green",
                    highlight: true,
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl p-4 text-center"
                    style={c.highlight
                      ? { background: "#F0FDF4", border: "1px solid #86EFAC" }
                      : { background: "#FFFFFF", border: "1px solid #E6E9F2" }}
                  >
                    <div className="text-xl mb-1">{c.icon}</div>
                    <div className="text-xl font-bold" style={c.highlight ? { color: "#16A34A" } : { color: "#0F172A" }}>
                      {pkr(c.value)}
                    </div>
                    <div className="text-xs text-content-muted mt-0.5">{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Technical breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard
                  label="Cost per km"
                  ev={result.costPerKm}
                  petrol={result.petrolCostPkr / result.distanceKm}
                  unit="PKR"
                  lower="cheapest"
                />
                <MetricCard
                  label="CO₂ emissions"
                  ev={result.co2EvKg}
                  petrol={result.co2PetrolKg}
                  unit="kg CO₂"
                  lower="cleaner"
                />
              </div>

              {/* Energy details */}
              <div className="rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Energy Details — {result.evModel}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Efficiency", value: `${result.efficiencyWhKm} Wh/km` },
                    { label: "Energy used", value: `${result.energyKwh} kWh` },
                    { label: "Charges needed", value: result.chargesNeeded.toString() },
                    { label: "CO₂ saved", value: `${result.co2SavedKg} kg` },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-base font-bold" style={{ color: "#16A34A" }}>{s.value}</div>
                      <div className="text-xs text-content-muted">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annual CO2 highlight */}
              {tab === "annual" && (
                <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                  <div className="text-3xl">🌱</div>
                  <div>
                    <div className="font-semibold" style={{ color: "#16A34A" }}>
                      {result.annual.co2SavedKg.toLocaleString()} kg CO₂ saved per year
                    </div>
                    <div className="text-xs text-content-muted mt-0.5">
                      Equivalent to planting ~{Math.round(result.annual.co2SavedKg / 22)} trees annually.
                    </div>
                  </div>
                </div>
              )}

              {/* Break-even calculator */}
              <div className="rounded-xl p-5 space-y-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Break-even Calculator
                </div>
                <p className="text-xs text-content-muted">
                  How long until your EV&apos;s higher purchase price pays off through fuel savings?
                </p>
                <div>
                  <label className="text-xs font-medium text-content-muted mb-1 flex justify-between">
                    <span>EV premium over petrol car</span>
                    <span className="font-bold text-content">{pkr(evPremiumPkr)}</span>
                  </label>
                  <input type="range" min={0} max={5000000} step={100000}
                    value={evPremiumPkr}
                    onChange={e => setEvPremiumPkr(Number(e.target.value))}
                    className="w-full accent-neon-green" />
                  <div className="flex justify-between text-xs text-content-muted mt-0.5">
                    <span>0</span><span>PKR 25L</span><span>PKR 50L</span>
                  </div>
                </div>
                {breakEvenMonths !== null && (
                  <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                    style={breakEvenMonths <= 36
                      ? { background: "#F0FDF4", border: "1px solid #86EFAC" }
                      : { background: "#F6F8FF", border: "1px solid #E6E9F2" }}
                  >
                    <span className="text-2xl">{breakEvenMonths <= 36 ? "🎯" : "📅"}</span>
                    <div>
                      <p className="font-black text-lg" style={breakEvenMonths <= 36 ? { color: "#16A34A" } : { color: "#0F172A" }}>
                        {breakEvenMonths < 12
                          ? `${breakEvenMonths} months`
                          : `${(breakEvenMonths / 12).toFixed(1)} years`}
                      </p>
                      <p className="text-xs text-content-muted">
                        to break even based on {pkr(result.monthly.savingsPkr)}/month savings
                      </p>
                    </div>
                  </div>
                )}
                {evPremiumPkr === 0 && (
                  <p className="text-xs font-semibold text-center" style={{ color: "#16A34A" }}>
                    ✓ No premium — you&apos;re saving from day one
                  </p>
                )}
              </div>

              {/* Trip planner CTA */}
              <div className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                <div>
                  <div className="text-sm font-semibold text-content">Planning a long trip?</div>
                  <div className="text-xs text-content-muted mt-0.5">
                    Find charging stops along any Pakistan route.
                  </div>
                </div>
                <a
                  href={`/trip-planner?evSlug=${evSlug}`}
                  className="text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}
                >
                  Plan Trip →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
