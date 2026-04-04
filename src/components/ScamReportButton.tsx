"use client";
// src/components/ScamReportButton.tsx
// Inline scam report — shows a modal, posts to /api/listings/[id]/report

import { useState } from "react";

const REASONS = [
  "Fake listing / photos stolen",
  "Price bait and switch",
  "Seller unreachable / phone off",
  "Already sold, still listed",
  "Odometer tampered",
  "Battery grade misrepresented",
  "Other fraud / scam",
];

export default function ScamReportButton({ listingId }: { listingId: string }) {
  const [open,    setOpen]    = useState(false);
  const [reason,  setReason]  = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  async function submit() {
    if (!reason) return;
    setLoading(true);
    try {
      await fetch(`/api/listings/${listingId}/report`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reason, details }),
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
        title="Report this listing">
        🚩 Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "#fff", border: "1px solid #E6E9F2" }}>

            {/* Header */}
            <div style={{ background: "#0F172A" }} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Report Listing</div>
                <div className="text-white font-black text-sm">Flag a suspicious ad</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-6">
              {done ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">✅</div>
                  <div className="font-black text-slate-900 mb-1">Report submitted</div>
                  <p className="text-sm text-slate-500">Our team will review within 24 hours. Thank you for keeping eWheelz safe.</p>
                  <button onClick={() => { setOpen(false); setDone(false); setReason(""); setDetails(""); }}
                    className="mt-4 text-sm text-indigo-600 font-bold">Close</button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</div>
                    <div className="space-y-1.5">
                      {REASONS.map(r => (
                        <button key={r}
                          onClick={() => setReason(r)}
                          className="w-full text-left text-sm px-3 py-2 rounded-xl transition-all"
                          style={reason === r
                            ? { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FCA5A5", fontWeight: "700" }
                            : { background: "#F8FAFF", color: "#475569", border: "1px solid #E6E9F2" }}>
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Additional details (optional)</div>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder="e.g. Seller sent payment link, photos taken from another listing..."
                      rows={3}
                      className="w-full text-sm rounded-xl px-3 py-2 resize-none focus:outline-none"
                      style={{ background: "#F8FAFF", border: "1px solid #E6E9F2", color: "#0F172A" }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                      style={{ border: "1px solid #E6E9F2" }}>
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={!reason || loading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40"
                      style={{ background: reason ? "linear-gradient(135deg,#EF4444,#DC2626)" : "#94A3B8" }}>
                      {loading ? "Submitting…" : "Submit Report"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
