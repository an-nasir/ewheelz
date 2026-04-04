"use client";
// src/app/[locale]/listings/manage/[id]/page.tsx
// Seller's private management page — accessed via token link shown after posting.

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ManageListingPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [soldPrice, setSoldPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const markSold = async () => {
    if (!token) return;
    setStatus("loading");
    const res = await fetch(`/api/listings/${params.id}/sold`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soldPrice: soldPrice ? Number(soldPrice) : null, sellerToken: token }),
    });
    setStatus(res.ok ? "done" : "error");
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Invalid Link</h1>
          <p className="text-slate-500 text-sm">This link is missing a seller token. Use the link you received after posting.</p>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>✓</div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Marked as Sold!</h1>
          <p className="text-slate-500 text-sm mb-6">Your listing has been closed. Thanks for selling on eWheelz.</p>
          <Link href="/listings" className="text-sm font-bold text-indigo-600 hover:underline">Browse listings →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl shadow-slate-200/50">
        <h1 className="text-xl font-black text-slate-900 mb-1">Manage Your Listing</h1>
        <p className="text-sm text-slate-400 mb-6">Only you have this link.</p>

        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
          Final Sale Price (PKR) — optional
        </label>
        <input
          type="number"
          value={soldPrice}
          onChange={e => setSoldPrice(e.target.value)}
          placeholder="e.g. 5500000"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        {soldPrice && (
          <p className="text-xs text-slate-400 mb-4">PKR {Number(soldPrice).toLocaleString()}</p>
        )}

        <button
          onClick={markSold}
          disabled={status === "loading"}
          className="w-full py-3 rounded-xl text-sm font-black text-white disabled:opacity-50 transition-all mt-4"
          style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>
          {status === "loading" ? "Saving..." : "Mark as Sold ✓"}
        </button>

        {status === "error" && (
          <p className="text-xs text-red-500 text-center mt-3">Invalid or expired token.</p>
        )}

        <Link href="/listings" className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors">
          ← Back to listings
        </Link>
      </div>
    </div>
  );
}
