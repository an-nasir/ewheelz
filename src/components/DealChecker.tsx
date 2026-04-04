"use client";
// src/components/DealChecker.tsx — "Should I buy this?" paste box

import { useState } from "react";
import { track } from "@/components/providers/AnalyticsProvider";

type Verdict = "GOOD_DEAL" | "FAIR_DEAL" | "OVERPRICED" | "RED_FLAGS" | "UNKNOWN";

const VERDICT_STYLE: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
  GOOD_DEAL:  { label: "Good Deal ✓",  color: "#16A34A", bg: "#F0FDF4", border: "#86EFAC" },
  FAIR_DEAL:  { label: "Fair Deal",    color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC" },
  OVERPRICED: { label: "Overpriced ↑", color: "#D97706", bg: "#FFFBEB", border: "#FCD34D" },
  RED_FLAGS:  { label: "Red Flags ⚠",  color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5" },
  UNKNOWN:    { label: "Unclear",      color: "#64748B", bg: "#F6F8FF", border: "#E2E8F0" },
};

export default function DealChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const check = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    track("deal_check_submitted");
    try {
      const res = await fetch("/api/deal-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      track("deal_check_result", { verdict: data.analysis?.verdict, score: data.analysis?.score });
      setResult(data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const v = result?.analysis?.verdict as Verdict | undefined;
  const style = v ? VERDICT_STYLE[v] ?? VERDICT_STYLE.UNKNOWN : null;

  return (
    <div className="w-full">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={"Paste any WhatsApp or OLX EV ad here...\n\ne.g. \"2023 BYD Atto 3, Lahore, 45k km, 8.5M, battery grade A, serious buyers only\""}
        rows={4}
        className="w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none bg-white transition-all"
      />

      <button
        onClick={check}
        disabled={loading || !text.trim()}
        className="mt-3 w-full py-3.5 rounded-2xl text-sm font-black text-white disabled:opacity-40 transition-all"
        style={{ background: loading ? "#6366F1" : "linear-gradient(135deg,#6366F1,#4F46E5)" }}>
        {loading ? "Analysing..." : "Should I Buy This? →"}
      </button>

      {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

      {result && style && (
        <div className="mt-5 rounded-2xl border-2 p-5 space-y-4 transition-all"
          style={{ background: style.bg, borderColor: style.border }}>

          {/* Verdict header */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-black" style={{ color: style.color }}>{style.label}</span>
            <span className="text-2xl font-black" style={{ color: style.color }}>
              {result.analysis.score}/100
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-700">{result.analysis.priceVerdict}</p>

          {/* Market range */}
          {result.avgMarketPrice && (
            <div className="text-xs text-slate-500">
              {result.compsCount} similar listings found · avg market price:{" "}
              <strong className="text-slate-700">PKR {result.avgMarketPrice.toLocaleString()}</strong>
            </div>
          )}

          {/* Flags */}
          {result.analysis.flags?.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-red-600 mb-1.5">Red Flags</div>
              <ul className="space-y-1">
                {result.analysis.flags.map((f: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-red-500">✗</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Positives */}
          {result.analysis.positives?.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-1.5">Positives</div>
              <ul className="space-y-1">
                {result.analysis.positives.map((p: string, i: number) => (
                  <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-green-500">✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Negotiation tip */}
          {result.analysis.negotiationTip && (
            <div className="rounded-xl px-4 py-3 text-xs font-semibold text-indigo-700 bg-white border border-indigo-100">
              💡 {result.analysis.negotiationTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
