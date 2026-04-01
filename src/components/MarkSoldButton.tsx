"use client";
// src/components/MarkSoldButton.tsx
// Lets a seller mark their listing as sold + capture final sale price
// MVP: no auth check — seller just knows their listing URL

import { useState } from "react";

export default function MarkSoldButton({ listingId, price }: { listingId: string; price: number }) {
  const [open, setOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState(String(price));
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (done) return (
    <span className="text-[11px] font-bold text-slate-400 line-through">Sold</span>
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors">
        Mark as Sold
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-black text-slate-900 mb-1">Mark as Sold 🎉</h3>
            <p className="text-xs text-slate-500 mb-4">
              What was the final sale price? This helps us improve valuation accuracy for other sellers.
            </p>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Final Sale Price (PKR)</label>
            <input type="number" value={soldPrice} onChange={e => setSoldPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            {soldPrice && <p className="text-xs text-slate-400 mb-4">PKR {Number(soldPrice).toLocaleString()}</p>}
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button disabled={loading || !soldPrice}
                onClick={async () => {
                  setLoading(true);
                  await fetch(`/api/listings/${listingId}/sold`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ soldPrice: Number(soldPrice) }),
                  });
                  setLoading(false);
                  setOpen(false);
                  setDone(true);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
                {loading ? "Saving..." : "Confirm Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
