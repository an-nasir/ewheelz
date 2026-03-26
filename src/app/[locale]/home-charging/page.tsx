// src/app/home-charging/page.tsx — Pakistan Home Charging Guide
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home EV Charging Guide Pakistan",
  description:
    "Complete guide to home EV charging in Pakistan — wallbox selection, load shedding survival, solar compatibility, wiring costs, and WAPDA safety.",
};

const SECTIONS = [
  {
    id: "basics",
    icon: "🔌",
    title: "Level 1 vs Level 2 Charging",
    gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    content: [
      {
        heading: "Level 1 — 3-pin socket (no cost to install)",
        body: `You can charge any EV using the standard 3-pin socket (230V / 13A) included in the box. This delivers approximately 2.3 kW, adding roughly 10–15 km of range per hour. For most Pakistani EV owners doing under 60 km/day, overnight Level 1 charging is perfectly sufficient. No electrician required — just plug in.`,
        tip: "Best for: Changan Lumin, Honri VE, city commuters with overnight parking",
      },
      {
        heading: "Level 2 — Wallbox / Home Charger (recommended for large-battery EVs)",
        body: `A wallbox or wall-mounted EV charger connects to a dedicated 32A single-phase circuit and delivers 7.4 kW — fully charging a 77 kWh BYD Seal in 10–11 hours. Three-phase 11 kW units are also available. Cost in Pakistan ranges from PKR 80,000–200,000 installed (hardware + wiring + breaker).`,
        tip: "Best for: BYD Atto 3, BYD Seal, Hyundai Ioniq 5, MG ZS EV",
      },
    ],
  },
  {
    id: "loadshedding",
    icon: "⚡",
    title: "Surviving Load Shedding",
    gradient: "linear-gradient(135deg,#F59E0B,#EF4444)",
    content: [
      {
        heading: "Strategy 1 — Charge during off-peak / low-shedding hours",
        body: `In most Pakistani cities, load shedding follows a schedule. Set your EV's built-in timer (available on BYD, MG, Hyundai models) to begin charging at midnight to 5 AM when shedding is minimal. Most modern EVs allow departure-time scheduling from the app.`,
        tip: "BYD, MG, Hyundai apps all support scheduled charging",
      },
      {
        heading: "Strategy 2 — Keep battery above 40% as a buffer",
        body: `Avoid arriving home on a near-empty battery before a long shedding window. Maintaining 40%+ state of charge means you always have enough for emergency use even if charging is delayed by 6–8 hours.`,
        tip: "Set a 'minimum charge' reminder in the MG iSmart or BYD app",
      },
      {
        heading: "Strategy 3 — UPS / inverter bridging",
        body: `A 3 kVA UPS (like Osaka or Homage 3 kVA) can power Level 1 charging (2.3 kW) from its battery bank during short 1–2 hour outages. For longer outages, a solar-backed UPS (see below) is the solution. Never attempt Level 2 charging from a UPS — the surge load will trip it.`,
        tip: "PKR 60,000–90,000 for a 3 kVA UPS + 200 Ah batteries",
      },
    ],
  },
  {
    id: "solar",
    icon: "☀️",
    title: "Solar + EV: The Ultimate Combo",
    gradient: "linear-gradient(135deg,#22C55E,#10B981)",
    content: [
      {
        heading: "How much solar do you need?",
        body: `A typical 77 kWh EV battery adds 7–10 units (kWh) per day of charging load for 50–70 km of driving. A 3 kW rooftop solar system generates 12–15 kWh/day in most Pakistani cities, easily covering both home load and EV charging. The BYD Atto 3 and MG ZS EV are especially solar-compatible due to their smart scheduling.`,
        tip: "3 kW solar system costs PKR 450,000–600,000 installed (2024 prices)",
      },
      {
        heading: "Net Metering & NEPRA",
        body: `NEPRA's net metering policy allows you to sell excess solar units back to WAPDA/LESCO at PKR 17–22/unit. With a 5 kW system, you can realistically offset your entire electricity bill AND charge your EV for free. Net metering application is done via your DISCO (LESCO, HESCO, PESCO etc).`,
        tip: "Visit LESCO portal or NEPRA's website for current net metering rates",
      },
      {
        heading: "Bi-directional / V2H charging (coming)",
        body: `Vehicle-to-Home (V2H) technology allows your EV battery to power your house during outages. The BYD Shark PHEV already supports bidirectional AC output. Fully bi-directional DC charging (V2H adapters) is expected to arrive in Pakistan by 2026 with the next-gen BYD and Hyundai models.`,
        tip: "The BYD Shark 6 PHEV has a built-in 220V AC outlet",
      },
    ],
  },
  {
    id: "wiring",
    icon: "🔧",
    title: "Wiring, Costs & Safety",
    gradient: "linear-gradient(135deg,#3B82F6,#6366F1)",
    content: [
      {
        heading: "Dedicated circuit is mandatory for Level 2",
        body: `Never share a Level 2 wallbox circuit with other heavy appliances (AC, geyser). Run a dedicated 32A circuit from the main DB panel to the wallbox location using 6 mm² copper cable. Ensure your main panel can handle the additional load — most Pakistani homes have 32A or 60A service.`,
        tip: "A licensed electrician should inspect your panel before installation",
      },
      {
        heading: "Cost breakdown (Level 2 installation)",
        body: `Wallbox unit (7.4 kW): PKR 45,000–120,000\nCabling & conduit (10–20 meters): PKR 8,000–20,000\nDedicated MCB/RCBO: PKR 2,500–5,000\nElectrician labour: PKR 5,000–15,000\nTotal: PKR 60,000–160,000 depending on brand and distance from panel.`,
        tip: "Brands available in Pakistan: Wallbox, Autel, Evnotify, local OEM",
      },
      {
        heading: "WAPDA / LESCO Safety Requirements",
        body: `All EV charging installations must comply with Pakistan's Electricity Rules 1937 (amended 2022). Key requirements: earthing/grounding rod at charger location, RCBO (residual current circuit breaker) rated for EV charging, weatherproof IP54-rated enclosure for outdoor units. LESCO inspections are required before energising new circuits above 30A.`,
        tip: "Keep a copy of your electrician's license and installation report",
      },
    ],
  },
  {
    id: "tips",
    icon: "💡",
    title: "Pakistan-Specific Tips",
    gradient: "linear-gradient(135deg,#EC4899,#F97316)",
    content: [
      {
        heading: "Voltage fluctuations — use a stabilizer",
        body: `Pakistani grid voltage fluctuates between 180V–260V in many areas. Most EV onboard chargers can handle this range, but a CVR (constant voltage regulator) or AVR stabilizer on the Level 1 outlet is recommended in rural or industrial areas with frequent spikes. A 3 kVA stabilizer costs PKR 15,000–25,000.`,
        tip: "BYD, MG, Hyundai chargers accept 180–260V input",
      },
      {
        heading: "Monsoon / heat precautions",
        body: `Never charge outdoors in heavy rain without a proper IP65-rated enclosure. In Karachi/Multan summer heat (45°C+), avoid charging a hot battery immediately after a long drive — let it cool 15–20 minutes first. The BMS on all modern EVs will throttle charging speed to protect the battery in extreme heat.`,
        tip: "Park in shade or a covered garage when possible in summer",
      },
      {
        heading: "Emergency contacts & EV roadside in Pakistan",
        body: `Currently no dedicated EV roadside assistance exists in Pakistan, but BYD and MG dealers offer 24-hour helplines for stranded customers. Keep your dealer's service number saved. For a flat battery, the fastest option is locating the nearest DC fast charger via this map — most are within 60 km in major cities.`,
        tip: "eWheelz Charging Map shows real-time station status",
      },
    ],
  },
];

export default function HomeChargingPage() {
  return (
    <div className="bg-[#F6F8FF] min-h-screen">

      {/* Header */}
      <div className="py-14 px-4 text-white"
        style={{ background: "linear-gradient(135deg,#22C55E 0%,#6366F1 100%)" }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← Home
          </Link>
          <div className="inline-block bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-white/20">
            🔌 Home Charging Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">Home EV Charging in Pakistan</h1>
          <p className="text-white/75 text-base max-w-2xl leading-relaxed">
            Everything you need to know: wallbox selection, surviving load shedding, going solar,
            wiring costs, and WAPDA safety requirements — all written for Pakistani conditions.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {["⚡ Load Shedding Tips", "☀️ Solar + EV", "🔧 Wiring Costs", "🇵🇰 Pakistan Grid"].map((tag) => (
              <span key={tag} className="text-xs bg-white/15 border border-white/20 text-white px-3 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="border-b border-[#E6E9F2] bg-white sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap transition-colors flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-50">
              {s.icon} {s.title.split(" ").slice(0, 3).join(" ")}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {SECTIONS.map((section) => (
          <div key={section.id} id={section.id}>
            {/* Section header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: section.gradient }}>
                {section.icon}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{section.title}</h2>
              </div>
            </div>

            {/* Content items */}
            <div className="space-y-4">
              {section.content.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E6E9F2] p-6">
                  <h3 className="font-bold text-slate-900 text-base mb-3">{item.heading}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4">{item.body}</p>
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <span className="text-blue-500 text-sm mt-0.5">💡</span>
                    <p className="text-blue-800 text-xs font-medium leading-relaxed">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Comparison table */}
        <div id="comparison" className="bg-white rounded-2xl border border-[#E6E9F2] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#E6E9F2]">
            <h2 className="text-xl font-black text-slate-900">Charging Level Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E6E9F2]">
                  {["Feature", "Level 1 (3-pin)", "Level 2 (Wallbox)", "DC Fast (Public)"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E9F2]">
                {[
                  ["Power",              "2.3 kW",           "7.4–11 kW",             "50–150 kW"],
                  ["Range per hour",     "10–15 km",         "40–60 km",              "200–400 km"],
                  ["Full charge (77kWh)","34 hours",         "7–11 hours",            "30–60 min"],
                  ["Install cost",       "PKR 0",            "PKR 60,000–160,000",    "N/A (public)"],
                  ["Grid impact",        "Low",              "Moderate",              "Very high"],
                  ["Load shedding risk", "Low",              "Moderate",              "N/A"],
                  ["Best for",           "Daily commute",    "Large battery EVs",     "Long trips"],
                ].map(([label, l1, l2, dc]) => (
                  <tr key={label} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-700">{label}</td>
                    <td className="px-4 py-3 text-slate-600">{l1}</td>
                    <td className="px-4 py-3 text-slate-600">{l2}</td>
                    <td className="px-4 py-3 text-slate-600">{dc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center pb-6">
          <Link href="/charging-map" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold">
            Find Charging Stations →
          </Link>
          <Link href="/emi-calculator" className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold">
            💰 EV Financing Calculator
          </Link>
          <Link href="/ev" className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold">
            Compare EVs
          </Link>
        </div>
      </div>
    </div>
  );
}
