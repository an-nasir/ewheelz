"use client";
// src/components/CommunityQuickReport.tsx — quick contribute buttons for homepage

import { useState } from "react";

async function postReport(body: Record<string, unknown>) {
  const token = typeof window !== "undefined"
    ? (localStorage.getItem("ewheelz_token") || (() => {
        const t = "anon_" + Math.random().toString(36).slice(2);
        localStorage.setItem("ewheelz_token", t);
        return t;
      })())
    : "anon";
  return fetch("/api/community/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sessionToken: token }),
  });
}

export default function CommunityQuickReport() {
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  async function submitEfficiency(vehicleModel: string, whKm: number) {
    try {
      await postReport({ type: "efficiency_report", vehicleModel, efficiencyWhKm: whKm });
      setState("sent");
      setTimeout(() => setState("idle"), 3000);
    } catch { setState("error"); }
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl px-4 py-3 text-center"
        style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
        <p className="text-sm font-semibold" style={{ color: "#16A34A" }}>✓ Logged!</p>
        <p className="text-slate-500 text-xs mt-0.5">See your full score on the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">How efficient is your EV?</p>
      <p className="text-xs text-slate-400 mb-3">Tap to confirm your real-world kWh/100km</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { model: "BYD Atto 3",    whKm: 162 },
          { model: "MG ZS EV",      whKm: 175 },
          { model: "BYD Seal",      whKm: 155 },
          { model: "Hyundai Ioniq", whKm: 148 },
        ].map(e => {
          const isHovered = hoveredModel === e.model;
          return (
            <button
              key={e.model}
              onClick={() => submitEfficiency(e.model, e.whKm)}
              onMouseEnter={() => setHoveredModel(e.model)}
              onMouseLeave={() => setHoveredModel(null)}
              className="text-left rounded-xl p-2.5 transition-all"
              style={isHovered
                ? { background: "#F0FDF4", border: "1px solid #86EFAC" }
                : { background: "#F6F8FF", border: "1px solid #E6E9F2" }}
            >
              <p className="text-[10px] font-medium truncate transition-colors"
                style={{ color: isHovered ? "#16A34A" : "#64748B" }}>
                {e.model}
              </p>
              <p className="text-sm font-black text-slate-900 tabular-nums">{(e.whKm / 10).toFixed(1)} kWh</p>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">
        One tap · No account needed · Your data stays private
      </p>
    </div>
  );
}
