"use client";
// src/components/ChargerReportButtons.tsx
// One-tap charger status reporter — 👍 Working · ⚡ Slow · 👎 Broken

import { useState } from "react";

interface Props {
  stationId: string;
  stationName?: string;
  compact?: boolean;
}

type Status = "available" | "busy" | "broken";

const BUTTONS: {
  status: Status;
  label: string;
  emoji: string;
  activeStyle: React.CSSProperties;
  idleStyle: React.CSSProperties;
  hoverStyle: React.CSSProperties;
}[] = [
  {
    status: "available",
    label:  "Working",
    emoji:  "👍",
    activeStyle: { background: "#22C55E",  color: "#FFFFFF", borderColor: "#16A34A" },
    idleStyle:   { background: "#F6F8FF",  color: "#475569", borderColor: "#E6E9F2" },
    hoverStyle:  { background: "#F0FDF4",  color: "#16A34A", borderColor: "#86EFAC" },
  },
  {
    status: "busy",
    label:  "Slow",
    emoji:  "⚡",
    activeStyle: { background: "#F59E0B",  color: "#FFFFFF", borderColor: "#D97706" },
    idleStyle:   { background: "#F6F8FF",  color: "#475569", borderColor: "#E6E9F2" },
    hoverStyle:  { background: "#FFFBEB",  color: "#B45309", borderColor: "#FCD34D" },
  },
  {
    status: "broken",
    label:  "Broken",
    emoji:  "👎",
    activeStyle: { background: "#EF4444",  color: "#FFFFFF", borderColor: "#DC2626" },
    idleStyle:   { background: "#F6F8FF",  color: "#475569", borderColor: "#E6E9F2" },
    hoverStyle:  { background: "#FEF2F2",  color: "#B91C1C", borderColor: "#FECACA" },
  },
];

export default function ChargerReportButtons({ stationId, stationName, compact = false }: Props) {
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const [chosen, setChosen] = useState<Status | null>(null);
  const [hovered, setHovered] = useState<Status | null>(null);

  async function report(status: Status) {
    setChosen(status);
    setState("pending");
    try {
      await fetch("/api/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "station_report",
          stationId,
          stationName: stationName ?? stationId,
          status,
          sessionToken:
            typeof window !== "undefined"
              ? (localStorage.getItem("ewheelz_token") ?? "anon")
              : "anon",
        }),
      });
      setState("done");
    } catch {
      setState("idle");
      setChosen(null);
    }
  }

  function getStyle(btn: typeof BUTTONS[0]) {
    if (state === "pending" && chosen === btn.status) return { ...btn.activeStyle, border: `1px solid ${btn.activeStyle.borderColor}` };
    if (hovered === btn.status) return { ...btn.hoverStyle, border: `1px solid ${btn.hoverStyle.borderColor}` };
    return { ...btn.idleStyle, border: `1px solid ${btn.idleStyle.borderColor}` };
  }

  // Done state
  if (state === "done") {
    const btn = BUTTONS.find(b => b.status === chosen);
    return (
      <div
        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3 py-1.5"
        style={compact
          ? { background: "#F6F8FF", color: "#475569", border: "1px solid #E6E9F2" }
          : { background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }}
      >
        {btn?.emoji} {btn?.label} — saved for other drivers
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {BUTTONS.map(btn => (
          <button
            key={btn.status}
            onClick={() => report(btn.status)}
            onMouseEnter={() => setHovered(btn.status)}
            onMouseLeave={() => setHovered(null)}
            disabled={state === "pending"}
            title={btn.label}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-all disabled:opacity-40"
            style={getStyle(btn)}
          >
            {state === "pending" && chosen === btn.status ? (
              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{btn.emoji}</span>
            )}
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Full mode
  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-400 font-medium">Is this charger working today?</p>
      <div className="flex gap-2">
        {BUTTONS.map(btn => (
          <button
            key={btn.status}
            onClick={() => report(btn.status)}
            onMouseEnter={() => setHovered(btn.status)}
            onMouseLeave={() => setHovered(null)}
            disabled={state === "pending"}
            className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl font-semibold text-xs transition-all disabled:opacity-40"
            style={getStyle(btn)}
          >
            <span className="text-xl leading-none">
              {state === "pending" && chosen === btn.status ? (
                <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : btn.emoji}
            </span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
