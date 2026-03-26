"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan: string) => {
    if (!session?.user) {
      alert("Please login first to upgrade your account.");
      return;
    }
    setLoading(true);
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, userId: (session.user as any).id }),
      });
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error("Failed to subscribe", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }} className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Premium Plans</h1>
        <p className="text-slate-500 mb-12">Upgrade for advanced features and ad-free browsing.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <p className="text-slate-500 mb-6">Basic features</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex gap-2"><span>✅</span> EV specs & comparisons</li>
              <li className="flex gap-2"><span>✅</span> Basic charging map</li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl border border-slate-200 text-slate-400 font-bold">
              Current Plan
            </button>
          </div>

          <div className="bg-indigo-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-2">Premium</h2>
            <p className="text-indigo-200 mb-6 font-mono">PKR 500 / month</p>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex gap-2"><span>⚡</span> Advanced trip planner</li>
              <li className="flex gap-2"><span>🛡️</span> Ad-free experience</li>
              <li className="flex gap-2"><span>⭐</span> Expert reviews & early access</li>
            </ul>
            <button 
              onClick={() => handleSubscribe("premium")}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-neon-green hover:bg-emerald-400 text-slate-900 font-bold transition-colors disabled:opacity-50"
            >
              {loading ? "Saddle up..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
