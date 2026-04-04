// src/app/[locale]/ev-valuation/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ValuationClient from "./ValuationClient";

export const metadata: Metadata = {
  title: "EV Resale Value Calculator Pakistan | eWheelz",
  description: "What's your used EV worth in Pakistan? Get a real PKR valuation in seconds.",
};

export default async function EvValuationPage() {
  const evs = await prisma.evModel.findMany({
    where: { availableInPk: true } as any,
    select: { slug: true, brand: true, model: true, variant: true, pricePkrMin: true },
    orderBy: { brand: "asc" },
  });

  const evOptions = (evs as any[]).map(ev => ({
    slug: ev.slug,
    label: `${ev.brand} ${ev.model}${ev.variant ? " " + ev.variant : ""}`,
    hasPrice: !!ev.pricePkrMin,
  }));

  return (
    <div className="bg-[#F6F8FF] min-h-screen">

      {/* Dark image hero */}
      <div style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1400&q=80)",
        backgroundSize: "cover", backgroundPosition: "center 35%", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(9,11,30,0.97) 0%,rgba(30,27,75,0.93) 50%,rgba(15,23,42,0.6) 100%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: "rgba(167,139,250,0.15)", color: "#C4B5FD", border: "1px solid rgba(167,139,250,0.3)" }}>
            💰 Free — real PKR numbers
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
            What&apos;s your EV<br />
            <span style={{ background: "linear-gradient(90deg,#A78BFA,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              actually worth?
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Dealers lowball. PakWheels has no EV data. Get the real PKR range in 30 seconds.
          </p>
        </div>
      </div>

      {/* 2-col desktop layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left: form */}
        <Suspense>
          <ValuationClient evs={evOptions} />
        </Suspense>

        {/* Right: sidebar */}
        <div className="hidden lg:flex flex-col gap-4">

          {/* How we calculate */}
          <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">How we calculate</div>
            <div className="space-y-4">
              {[
                { icon: "📅", label: "Age", desc: "Year-over-year depreciation curve for each EV model" },
                { icon: "🛣️", label: "Mileage", desc: "Beyond 20,000 km/year reduces value further" },
                { icon: "🔋", label: "Battery grade", desc: "Grade C vs A = PKR 3–8 lakh swing" },
                { icon: "📍", label: "City market", desc: "Karachi vs Lahore demand differences" },
                { icon: "⭐", label: "Condition", desc: "Cosmetic and mechanical state" },
              ].map(item => (
                <div key={item.icon} className="flex gap-3 items-start">
                  <span className="text-base mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5">
            <div className="font-black text-slate-900 text-sm mb-2">⚠️ Don&apos;t trust dealers</div>
            <div className="text-xs text-slate-600 leading-relaxed">
              Dealers typically offer 10–20% below market. Knowing the real value before you negotiate saves you PKR 2–5 lakh on average.
            </div>
          </div>

          {/* Cross-sell */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5">
            <div className="font-black text-slate-900 text-sm mb-1">Don&apos;t know your battery grade?</div>
            <div className="text-xs text-slate-500 mb-3">Run a free battery check first for a more accurate valuation.</div>
            <a href="/battery-health"
              className="block w-full py-3 rounded-xl font-black text-sm text-center border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-100 transition-all">
              🔋 Check Battery First
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
