"use client";
// src/components/PriceAlertModal.tsx
// Two modes:
//   alertType="PRICE_DROP"   → "Alert me when price drops"
//   alertType="AVAILABILITY" → "Notify me when available in Pakistan"

import { useState } from "react";
import { track } from "@/lib/analytics";

interface Props {
  evModelId?: string;
  evSlug: string;
  evName: string;
  currentPricePkr?: number;
  alertType?: "PRICE_DROP" | "AVAILABILITY";
}

export default function PriceAlertModal({
  evModelId, evSlug, evName, currentPricePkr,
  alertType = "PRICE_DROP",
}: Props) {
  const [open, setOpen]     = useState(false);
  const [email, setEmail]   = useState("");
  const [target, setTarget] = useState(
    currentPricePkr ? String(Math.round(currentPricePkr * 0.9 / 100000) * 100000) : ""
  );
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg]   = useState("");

  const isAvailability = alertType === "AVAILABILITY";

  function openModal() {
    setOpen(true);
    track("Lead Form Opened", { type: alertType, evName });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, evModelId, evSlug, evName,
          targetPrice: target ? parseInt(target) : null,
          alertType,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error); setStatus("error"); return; }
      track("Newsletter Signup", { source: alertType === "AVAILABILITY" ? "availability_alert" : "price_alert", evName });
      setStatus("success");
    } catch {
      setErrMsg("Connection error. Please try again."); setStatus("error");
    }
  }

  // ── Trigger button ─────────────────────────────────────────────────────────
  const trigger = isAvailability ? (
    <button onClick={openModal}
      className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 shadow"
      style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>
      🔔 Notify Me When Available in Pakistan
    </button>
  ) : (
    <button onClick={openModal}
      className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
      📉 Alert me if price drops
    </button>
  );

  return (
    <>
      {trigger}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.60)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="relative w-full max-w-sm rounded-[28px] p-8 shadow-2xl bg-white border border-[#E6E9F2]">
            <button onClick={() => setOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100">
              ✕
            </button>

            {status === "success" ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🔔</div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Alert Set!</h3>
                <p className="text-slate-500 text-sm">
                  {isAvailability
                    ? `We'll email you the moment ${evName} becomes available in Pakistan.`
                    : `We'll email you when the ${evName} price drops.`}
                </p>
                <button onClick={() => setOpen(false)}
                  className="mt-5 px-6 py-2 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <span className="text-xs font-black uppercase tracking-widest"
                    style={{ color: isAvailability ? "#F59E0B" : "#6366F1" }}>
                    {isAvailability ? "Availability Alert" : "Price Drop Alert"}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{evName}</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    {isAvailability
                      ? "This EV isn't in Pakistan yet. We'll be the first to tell you when it arrives."
                      : "We'll email you the moment this EV's price drops in Pakistan."}
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@email.com" required
                      className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
                  </div>

                  {!isAvailability && currentPricePkr && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Alert me when price is below (PKR)
                      </label>
                      <input type="number" value={target} onChange={e => setTarget(e.target.value)}
                        placeholder={String(Math.round(currentPricePkr * 0.9))}
                        className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Current: PKR {(currentPricePkr / 1_000_000).toFixed(1)}M
                      </p>
                    </div>
                  )}

                  {errMsg && <p className="text-xs text-red-500">{errMsg}</p>}

                  <button type="submit" disabled={status === "loading"}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-60 transition-all hover:opacity-90"
                    style={{ background: isAvailability
                      ? "linear-gradient(135deg,#F59E0B,#EF4444)"
                      : "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                    {status === "loading" ? "Setting alert…" : "Set Alert →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
