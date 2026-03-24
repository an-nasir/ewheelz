// src/app/emi-calculator/page.tsx — Pakistan EV EMI / Financing Calculator
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

/* ── Bank / Financing Products ───────────────────────────────────────────── */
const BANKS = [
  {
    id: "hbl",
    name: "HBL Car Finance",
    logo: "🏦",
    annualRate: 24.5,   // % p.a.
    minTenureYr: 1,
    maxTenureYr: 7,
    processingFee: 0.01, // 1% of loan
    minDownPct: 15,
    badge: "Conventional",
    color: "#2563EB",
    notes: "Variable rate tied to KIBOR + spread",
  },
  {
    id: "mcb",
    name: "MCB Car4U",
    logo: "🏦",
    annualRate: 23.0,
    minTenureYr: 1,
    maxTenureYr: 5,
    processingFee: 0.0075, // 0.75%
    minDownPct: 20,
    badge: "Conventional",
    color: "#7C3AED",
    notes: "Fixed rate for first year, then variable",
  },
  {
    id: "meezan",
    name: "Meezan Ijarah",
    logo: "☪️",
    annualRate: 23.5,
    minTenureYr: 1,
    maxTenureYr: 5,
    processingFee: 0.01,
    minDownPct: 20,
    badge: "Islamic / Shariah",
    color: "#16A34A",
    notes: "Diminishing Musharakah — no riba. Rental rate equiv to 23.5%",
  },
  {
    id: "bankislami",
    name: "BankIslami",
    logo: "☪️",
    annualRate: 22.5,
    minTenureYr: 1,
    maxTenureYr: 7,
    processingFee: 0.0075,
    minDownPct: 15,
    badge: "Islamic / Shariah",
    color: "#0D9488",
    notes: "EV-friendly lease product with lower documentation",
  },
  {
    id: "ubldriven",
    name: "UBL Driven",
    logo: "🏦",
    annualRate: 24.0,
    minTenureYr: 1,
    maxTenureYr: 5,
    processingFee: 0.01,
    minDownPct: 20,
    badge: "Conventional",
    color: "#EA580C",
    notes: "Promotional rates available for locally assembled EVs",
  },
];

/* ── Popular EV prices for quick-fill ─────────────────────────────────────── */
const EV_PRESETS = [
  { label: "BYD Atto 3",       price: 11_500_000 },
  { label: "MG ZS EV",         price: 9_800_000  },
  { label: "BYD Seal",         price: 13_500_000 },
  { label: "Hyundai Ioniq 5",  price: 17_000_000 },
  { label: "Changan Lumin",    price: 3_200_000  },
  { label: "BYD Dolphin",      price: 7_500_000  },
];

function fmtPkr(n: number) {
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `PKR ${(n / 100_000).toFixed(1)} L`;
  return `PKR ${n.toLocaleString()}`;
}

function calcEmi(principal: number, annualRate: number, tenureYears: number) {
  const r = annualRate / 100 / 12;
  const n = tenureYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function EmiCalculatorPage() {
  const [vehiclePrice, setVehiclePrice] = useState(11_500_000);
  const [downPct, setDownPct] = useState(20);
  const [tenure, setTenure] = useState(5);
  const [selectedBank, setSelectedBank] = useState("hbl");

  const bank = BANKS.find((b) => b.id === selectedBank) ?? BANKS[0];

  const downPayment  = Math.round(vehiclePrice * downPct / 100);
  const loanAmount   = vehiclePrice - downPayment;
  const processingFee = Math.round(loanAmount * bank.processingFee);
  const monthlyEmi   = calcEmi(loanAmount, bank.annualRate, tenure);
  const totalPaid    = monthlyEmi * tenure * 12 + downPayment + processingFee;
  const totalInterest = totalPaid - vehiclePrice - processingFee;
  const effectiveDownPct = downPct;

  // EV vs Petrol savings (estimate)
  const annualKm       = 15000;
  const petrolCostKmPkr = 18;   // ≈ PKR 18/km for petrol car
  const evCostKmPkr     = 4.5;  // ≈ PKR 4.5/km for EV
  const annualSavings   = (petrolCostKmPkr - evCostKmPkr) * annualKm;
  const tenureSavings   = annualSavings * tenure;

  const canAfford = effectiveDownPct >= bank.minDownPct;

  const onPriceInput = useCallback((v: string) => {
    const n = parseInt(v.replace(/,/g, ""), 10);
    if (!isNaN(n) && n > 0) setVehiclePrice(n);
  }, []);

  return (
    <div className="bg-[#F6F8FF] min-h-screen">

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }} className="text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← Home
          </Link>
          <div className="inline-block bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-white/20">
            💰 Financing Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">EV EMI Calculator</h1>
          <p className="text-white/70 text-base max-w-lg">
            Compare HBL, MCB, Meezan Ijarah & more. Find the best car finance deal for your EV in Pakistan.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* ── Quick-fill presets ─────────────────────────────── */}
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Quick-fill — Popular EVs</div>
          <div className="flex flex-wrap gap-2">
            {EV_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setVehiclePrice(p.price)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border"
                style={{
                  background: vehiclePrice === p.price ? "#6366F1" : "#FFFFFF",
                  color:      vehiclePrice === p.price ? "#FFFFFF" : "#475569",
                  borderColor: vehiclePrice === p.price ? "#6366F1" : "#E6E9F2",
                }}
              >
                {p.label} — {fmtPkr(p.price)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Left: Inputs ────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg">Loan Details</h2>

            {/* Vehicle price */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Vehicle Price (PKR)
              </label>
              <input
                type="number"
                value={vehiclePrice}
                onChange={(e) => onPriceInput(e.target.value)}
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-3 text-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
              />
              <div className="text-xs text-slate-400 mt-1">{fmtPkr(vehiclePrice)}</div>
            </div>

            {/* Down payment */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Down Payment</label>
                <span className="text-xs font-bold text-indigo-600">{downPct}% — {fmtPkr(downPayment)}</span>
              </div>
              <input
                type="range" min={5} max={70} value={downPct}
                onChange={(e) => setDownPct(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5%</span><span>70%</span>
              </div>
              {!canAfford && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ {bank.name} requires minimum {bank.minDownPct}% down payment
                </div>
              )}
            </div>

            {/* Tenure */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan Tenure</label>
                <span className="text-xs font-bold text-indigo-600">{tenure} year{tenure > 1 ? "s" : ""}</span>
              </div>
              <input
                type="range" min={1} max={7} value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 yr</span><span>7 yrs</span>
              </div>
            </div>
          </div>

          {/* ── Right: Bank Selector ─────────────────────────── */}
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6">
            <h2 className="font-bold text-slate-900 text-lg mb-4">Choose Financing</h2>
            <div className="space-y-2">
              {BANKS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBank(b.id)}
                  className="w-full text-left rounded-xl p-3 border transition-all"
                  style={{
                    background:   selectedBank === b.id ? `${b.color}0D` : "#F8FAFC",
                    borderColor:  selectedBank === b.id ? b.color : "#E6E9F2",
                    boxShadow:    selectedBank === b.id ? `0 0 0 2px ${b.color}30` : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{b.logo}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.badge}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black" style={{ color: b.color }}>{b.annualRate}%</div>
                      <div className="text-[10px] text-slate-400">p.a.</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              * Rates are indicative. Contact bank for current offers.
            </p>
          </div>
        </div>

        {/* ── Result card ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-white"
          style={{ background: `linear-gradient(135deg, ${bank.color} 0%, ${bank.color}CC 100%)`, boxShadow: `0 8px 32px ${bank.color}40` }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{bank.logo}</span>
            <div>
              <div className="font-bold text-base">{bank.name}</div>
              <div className="text-white/60 text-xs">{bank.annualRate}% p.a. · {tenure} year{tenure > 1 ? "s" : ""} · {downPct}% down</div>
            </div>
          </div>

          {/* EMI big number */}
          <div className="mb-6">
            <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Monthly EMI</div>
            <div className="text-5xl font-black tabular-nums">
              {fmtPkr(Math.round(monthlyEmi))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Loan Amount",    value: fmtPkr(loanAmount) },
              { label: "Down Payment",   value: fmtPkr(downPayment) },
              { label: "Processing Fee", value: fmtPkr(processingFee) },
              { label: "Total Cost",     value: fmtPkr(Math.round(totalPaid)) },
            ].map((item) => (
              <div key={item.label} className="bg-white/15 rounded-xl p-3 border border-white/20">
                <div className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{item.label}</div>
                <div className="text-white font-black text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white/10 border border-white/20 rounded-xl p-3">
            <div className="text-white/60 text-[10px] uppercase tracking-wider mb-0.5">Total Interest Paid</div>
            <div className="text-white font-bold">{fmtPkr(Math.round(totalInterest))}</div>
          </div>

          <p className="text-white/50 text-xs mt-4">{bank.notes}</p>
        </div>

        {/* ── EV Savings vs Petrol ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6">
          <h2 className="font-bold text-slate-900 text-lg mb-1">⚡ EV vs Petrol — Fuel Savings Over {tenure} Years</h2>
          <p className="text-slate-400 text-sm mb-5">Based on {annualKm.toLocaleString()} km/year average</p>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "Annual EV Fuel Cost",    value: fmtPkr(Math.round(evCostKmPkr * annualKm)),    color: "#22C55E" },
              { label: "Annual Petrol Cost",      value: fmtPkr(Math.round(petrolCostKmPkr * annualKm)), color: "#EF4444" },
              { label: `Saved over ${tenure} yrs`, value: fmtPkr(Math.round(tenureSavings)),             color: "#6366F1" },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
                <div className="text-lg font-black" style={{ color: item.color }}>{item.value}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
            🌱 Over {tenure} years your EV saves approx <strong>{fmtPkr(Math.round(tenureSavings))}</strong> in fuel — offsetting{" "}
            <strong>{Math.round((tenureSavings / Math.round(totalInterest)) * 100)}%</strong> of the total interest paid.
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center pb-4">
          <Link href="/ev" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold">
            Browse EVs →
          </Link>
          <Link href="/compare" className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold">
            Compare Models
          </Link>
          <Link href="/home-charging" className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold">
            Home Charging Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
