"use client";
// src/components/NewsletterWidget.tsx
// Reusable email capture form.  Variants:
//   "footer"  — compact horizontal layout for the site footer
//   "banner"  — full-width gradient banner for inline page sections
// Fires a "Newsletter Signup" Mixpanel event on success.

import { useState } from "react";
import { track } from "@/lib/analytics";

type Variant = "footer" | "banner";

interface Props {
  source?: string;
  variant?: Variant;
}

export default function NewsletterWidget({ source = "footer", variant = "footer" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");

      track("Newsletter Signup", { source, alreadySubscribed: data.alreadySubscribed });
      setStatus("success");
      setMsg(data.alreadySubscribed ? "You're already subscribed 🎉" : "Welcome aboard! Check your inbox ⚡");
    } catch {
      setStatus("error");
      setMsg("Couldn't subscribe. Try again.");
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className={variant === "banner" ? "text-center py-2" : ""}>
        <p className={`text-sm font-semibold ${variant === "banner" ? "text-indigo-700" : "text-emerald-600"}`}>
          ✓ {msg}
        </p>
      </div>
    );
  }

  // ── Footer variant: compact ────────────────────────────────────────────────
  if (variant === "footer") {
    return (
      <div>
        <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-3">
          Weekly EV Digest
        </h3>
        <p className="text-slate-500 text-xs mb-3 leading-relaxed">
          New EVs, charging updates & Pakistan EV news — every Friday.
        </p>
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 text-sm border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-slate-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
          >
            {status === "loading" ? "…" : "→"}
          </button>
        </form>
        {status === "error" && <p className="text-xs text-red-500 mt-1">{msg}</p>}
      </div>
    );
  }

  // ── Banner variant: full-width CTA section ─────────────────────────────────
  return (
    <section
      className="rounded-[32px] p-8 sm:p-12 text-center"
      style={{
        background: "linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 50%,#ECFDF5 100%)",
        border: "1px solid #E0E7FF",
      }}
    >
      <div className="max-w-lg mx-auto">
        <div className="text-3xl mb-3">⚡</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          Stay ahead of Pakistan&apos;s EV market
        </h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Weekly digest — new model launches, charging station updates, price alerts and guides. No spam.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 text-sm border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400 bg-white shadow-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.30)" }}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe Free →"}
          </button>
        </form>
        {status === "error" && <p className="text-xs text-red-500 mt-2">{msg}</p>}
        <p className="text-slate-400 text-xs mt-4">Join 1,000+ EV enthusiasts · Unsubscribe any time</p>
      </div>
    </section>
  );
}
