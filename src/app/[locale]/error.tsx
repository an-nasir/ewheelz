"use client";
// src/app/[locale]/error.tsx — 500 / runtime error page
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring in production
    console.error("[eWheelz error]", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden relative bg-[#F6F8FF]">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle,#EF4444,transparent)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle,#F59E0B,transparent)" }} />
      </div>

      <div className="relative text-center max-w-xl mx-auto">

        {/* Big 500 */}
        <div
          className="text-[8rem] sm:text-[11rem] font-black leading-none select-none mb-4"
          style={{
            background: "linear-gradient(135deg,#EF4444,#F59E0B,#6366F1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          500
        </div>

        {/* Emojis */}
        <div className="flex items-center justify-center gap-5 mb-6 text-4xl">
          {["💥","🔧","⚡"].map((e, i) => (
            <span key={e} className="inline-block animate-bounce"
              style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.2s" }}>
              {e}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
          Something blew a fuse 🔌
        </h1>
        <p className="text-slate-500 text-base mb-2 max-w-sm mx-auto leading-relaxed">
          Our servers hit an unexpected bump. Our team has been notified.
        </p>
        {error?.digest && (
          <p className="text-[11px] font-mono text-slate-400 mb-8">
            Error ID: {error.digest}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 20px rgba(99,102,241,0.35)" }}
          >
            ↻ Try again
          </button>
          <Link href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 bg-white border border-[#E6E9F2] hover:bg-slate-50 transition-all"
          >
            ← Home
          </Link>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { href: "/ev", label: "⚡ EVs" },
            { href: "/compare", label: "⚖️ Compare" },
            { href: "/charging-map", label: "🔌 Chargers" },
            { href: "/emi-calculator", label: "🏦 EMI Calc" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-[#E6E9F2] text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
