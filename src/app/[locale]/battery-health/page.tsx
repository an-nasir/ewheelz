// src/app/[locale]/battery-health/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import BatteryHealthClient from "./BatteryHealthClient";

export const metadata: Metadata = {
  title: "EV Battery Health Check — Free | eWheelz",
  description: "Check your EV battery health before buying or selling. Get a graded A–F report in 30 seconds.",
};

const GRADES = [
  { grade: "A", range: "88–100%", label: "Excellent", color: "#16A34A", bg: "#F0FDF4", desc: "Like new. Minimal degradation." },
  { grade: "B", range: "76–87%", label: "Good",      color: "#6366F1", bg: "#EEF2FF", desc: "Normal wear. Still great value." },
  { grade: "C", range: "62–75%", label: "Fair",      color: "#D97706", bg: "#FFFBEB", desc: "Noticeable loss. Negotiate price." },
  { grade: "D", range: "48–61%", label: "Poor",      color: "#EA580C", bg: "#FFF7ED", desc: "Significant degradation. Inspect." },
  { grade: "F", range: "< 48%",  label: "Replace",   color: "#DC2626", bg: "#FEF2F2", desc: "Battery needs replacement soon." },
];

export default function BatteryHealthPage() {
  return (
    <div className="bg-[#F6F8FF] min-h-screen">

      {/* Dark image hero */}
      <div style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&q=80)",
        backgroundSize: "cover", backgroundPosition: "center 40%", position: "relative",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg,rgba(9,11,30,0.97) 0%,rgba(15,23,42,0.92) 50%,rgba(15,23,42,0.6) 100%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: "rgba(34,197,94,0.15)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.3)" }}>
            🔋 Free — takes 60 seconds
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-3">
            Is this battery<br />
            <span style={{ background: "linear-gradient(90deg,#34D399,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              actually healthy?
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto">
            Fill in what you know. Get a grade. Know before you buy or sell.
          </p>
        </div>
      </div>

      {/* 2-col desktop layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-20 grid lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left: form */}
        <Suspense>
          <BatteryHealthClient />
        </Suspense>

        {/* Right: grade guide sidebar — hidden on mobile */}
        <div className="hidden lg:flex flex-col gap-4">

          {/* Grade guide */}
          <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">What each grade means</div>
            <div className="space-y-3">
              {GRADES.map(g => (
                <div key={g.grade} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: g.bg }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: g.color }}>
                    {g.grade}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{g.label} <span className="font-normal text-slate-500">· {g.range}</span></div>
                    <div className="text-xs text-slate-500 mt-0.5">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why it matters */}
          <div className="bg-white rounded-3xl border border-[#E6E9F2] shadow-sm p-6">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Why this matters</div>
            <div className="space-y-3">
              {[
                { icon: "💰", text: "Battery is 40–60% of an EV's total value" },
                { icon: "🔍", text: "Dealers never disclose degradation honestly" },
                { icon: "📉", text: "Grade C vs A = PKR 3–8 lakh difference in resale" },
              ].map(item => (
                <div key={item.icon} className="flex gap-3 items-start">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm text-slate-600 leading-snug">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-sell */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5">
            <div className="font-black text-slate-900 text-sm mb-1">Already have a grade?</div>
            <div className="text-xs text-slate-500 mb-3">Find out what your EV is actually worth with that grade factored in.</div>
            <a href="/ev-valuation"
              className="block w-full py-3 rounded-xl font-black text-white text-sm text-center"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              Get Resale Value →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
