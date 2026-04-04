// src/app/[locale]/import-duty/page.tsx
"use client";
import type { Metadata } from "next";
import { useState } from "react";

const DUTY_BRACKETS = [
  { label: "Up to USD 30,000",    maxUsd: 30_000,  cd: 0,    art: 0,    gst: 18,  fev: 1    },
  { label: "USD 30–50K",          maxUsd: 50_000,  cd: 15,   art: 7,    gst: 18,  fev: 1    },
  { label: "USD 50–75K",          maxUsd: 75_000,  cd: 25,   art: 7,    gst: 18,  fev: 1    },
  { label: "USD 75–100K",         maxUsd: 100_000, cd: 45,   art: 15,   gst: 18,  fev: 2.5  },
  { label: "Over USD 100K",       maxUsd: Infinity, cd: 60,  art: 15,   gst: 18,  fev: 2.5  },
];

const POPULAR = [
  { name: "BYD Seal", usd: 28_000, icon: "🔵" },
  { name: "BYD Atto 3", usd: 32_000, icon: "🔵" },
  { name: "MG ZS EV", usd: 26_000, icon: "🔴" },
  { name: "Hyundai IONIQ 5", usd: 42_000, icon: "🟡" },
  { name: "Tesla Model 3", usd: 38_000, icon: "⚫" },
];

function calcDuty(fobUsd: number, rate: number = 278) {
  const b = DUTY_BRACKETS.find(x => fobUsd <= x.maxUsd) ?? DUTY_BRACKETS[DUTY_BRACKETS.length - 1];
  const fobPkr = fobUsd * rate;
  const cd = (b.cd / 100) * fobPkr;
  const art = (b.art / 100) * (fobPkr + cd);
  const gst = (b.gst / 100) * (fobPkr + cd + art);
  const fev = (b.fev / 100) * fobPkr;
  const wht = 0.01 * (fobPkr + cd + art + gst + fev);
  const freight = 0.08 * fobPkr;
  const totalDuty = cd + art + gst + fev + wht;
  const totalLanded = fobPkr + totalDuty + freight;
  return { fobPkr, cd, art, gst, fev, wht, freight, totalDuty, totalLanded };
}

export default function ImportDutyPage() {
  const [input, setInput] = useState<string>("28000");
  const [rate, setRate] = useState<string>("278");
  const usd = parseFloat(input) || 0;
  const result = calcDuty(usd, parseFloat(rate));

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-5xl font-black text-white mb-2">EV Import Duty Calculator</h1>
          <p className="text-slate-400 text-lg">Enter any EV price. Get instant duty breakdown.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ─── CALCULATOR ─── */}
        <div className="rounded-2xl p-6 bg-white border border-[#E6E9F2]">
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide">FOB Value (USD)</label>
              <input type="number" value={input} onChange={e => setInput(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-lg border border-[#E6E9F2] bg-white text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-400"
                placeholder="28000" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide">USD/PKR Rate</label>
              <input type="number" value={rate} onChange={e => setRate(e.target.value)}
                className="mt-2 w-full px-4 py-3 rounded-lg border border-[#E6E9F2] bg-white text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-400"
                placeholder="278" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Quick Pick</label>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {POPULAR.slice(0, 4).map(ev => (
                  <button key={ev.name} onClick={() => setInput(String(ev.usd))}
                    className="px-2 py-2 rounded-lg text-xs font-black text-slate-700 hover:bg-indigo-50 transition-all">
                    {ev.icon} {ev.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {usd > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Left: Total landed */}
              <div className="rounded-xl p-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F0FDF4)" }}>
                <div className="text-xs text-slate-500 uppercase tracking-wide font-black mb-1">Total Landed Cost</div>
                <div className="text-4xl font-black mb-1" style={{ background: "linear-gradient(90deg,#6366F1,#22C55E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  PKR {(result.totalLanded / 1_000_000).toFixed(1)}M
                </div>
                <div className="text-xs text-slate-500">FOB + duties + freight</div>
              </div>

              {/* Right: Duty breakdown mini */}
              <div className="rounded-xl p-4" style={{ background: "#F0FDF4" }}>
                <div className="text-xs text-slate-500 uppercase tracking-wide font-black mb-2">Duties Breakdown</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customs Duty:</span>
                    <span className="font-black">PKR {(result.cd / 1_000_000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">GST + ART:</span>
                    <span className="font-black">PKR {((result.gst + result.art) / 1_000_000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Freight:</span>
                    <span className="font-black">PKR {(result.freight / 1_000_000).toFixed(2)}M</span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(34,197,94,0.2)", paddingTop: "4px", marginTop: "4px" }}
                    className="flex justify-between font-black">
                    <span>Total Duty:</span>
                    <span className="text-green-700">+PKR {(result.totalDuty / 1_000_000).toFixed(2)}M</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── 2026 RATES TABLE ─── */}
        <details>
          <summary className="cursor-pointer text-lg font-black text-slate-900 py-4 px-4 -mx-4 rounded-xl hover:bg-slate-50">
            📋 2026 EV Import Duty Rates
          </summary>
          <div className="rounded-2xl overflow-hidden border border-[#E6E9F2]">
            <table className="w-full text-xs">
              <thead style={{ background: "#0F172A", color: "#94A3B8" }}>
                <tr>
                  <th className="px-4 py-3 text-left font-black">FOB Value</th>
                  <th className="px-4 py-3 text-left font-black">CD</th>
                  <th className="px-4 py-3 text-left font-black">ART</th>
                  <th className="px-4 py-3 text-left font-black">GST</th>
                  <th className="px-4 py-3 text-left font-black">FEV</th>
                </tr>
              </thead>
              <tbody>
                {DUTY_BRACKETS.map((b, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFF", borderTop: "1px solid #E6E9F2" }}>
                    <td className="px-4 py-2 font-bold text-slate-800">{b.label}</td>
                    <td className="px-4 py-2"><span className={b.cd === 0 ? "text-green-700 font-black" : "text-orange-700 font-black"}>{b.cd}%</span></td>
                    <td className="px-4 py-2 text-slate-600">{b.art}%</td>
                    <td className="px-4 py-2 text-slate-600">{b.gst}%</td>
                    <td className="px-4 py-2 text-slate-600">{b.fev}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* ─── HOW TO IMPORT ─── */}
        <details>
          <summary className="cursor-pointer text-lg font-black text-slate-900 py-4 px-4 -mx-4 rounded-xl hover:bg-slate-50">
            🚀 6-Step Import Process
          </summary>
          <div className="space-y-3 mt-4">
            {[
              ["01. Eligibility", "Personal baggage: abroad 2+ years = duty-free. Commercial import requires I-Form from SBP."],
              ["02. FOB Invoice", "Get authentic invoice from seller. FOB value is duty basis. Over-invoicing = penalties."],
              ["03. Shipping", "RORO shipping China→Karachi: USD 1,200–1,800. Time: 18–25 days. Always insure."],
              ["04. Clearing Agent", "Hire licensed Pakistan Customs agent at Karachi Port. Fee: PKR 25K–60K."],
              ["05. Pay Duties", "Pay via PSID at any bank within 21 days of GD filing, or storage charges apply."],
              ["06. Register", "Provincial Excise office: Bill of Entry + Invoice + CNIC. Fee: PKR 30K–50K."],
            ].map(([title, desc], i) => (
              <div key={i} className="rounded-xl p-4 bg-white border border-[#E6E9F2]">
                <div className="font-black text-slate-900 mb-1">{title}</div>
                <div className="text-sm text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </details>

        {/* ─── FAQ ─── */}
        <details>
          <summary className="cursor-pointer text-lg font-black text-slate-900 py-4 px-4 -mx-4 rounded-xl hover:bg-slate-50">
            ❓ FAQ
          </summary>
          <div className="space-y-3 mt-4">
            {[
              ["Can I import duty-free?", "Yes, if you've been abroad 2+ continuous years. One vehicle, any type, reduced/zero duty. Can't sell for 5 years."],
              ["Cheapest EV to import?", "EVs under USD 30K FOB have 0% customs duty. BYD Seal (USD 28K) and MG ZS (USD 26K) are sweet spots."],
              ["Why 8% freight?", "Standard RORO shipping estimate. Actual freight depends on shipper and timing."],
              ["Total time to own?", "~6–8 weeks: 2 weeks shipping + 2 weeks customs clearance + 1–2 weeks registration + buffer."],
            ].map(([q, a], i) => (
              <div key={i} className="rounded-xl p-4 bg-white border border-[#E6E9F2]">
                <div className="font-black text-slate-900 mb-1">{q}</div>
                <div className="text-sm text-slate-500">{a}</div>
              </div>
            ))}
          </div>
        </details>

        {/* CTA */}
        <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}>
          <div className="text-white font-black text-lg mb-2">Still confused?</div>
          <p className="text-slate-400 text-sm mb-4">Talk to a Pakistan Customs clearing agent — they handle the paperwork.</p>
          <a href="/articles" className="inline-block px-6 py-3 rounded-xl text-sm font-black text-white"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
            Read More EV Guides →
          </a>
        </div>

      </div>
    </div>
  );
}
