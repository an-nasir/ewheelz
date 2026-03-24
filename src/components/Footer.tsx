// src/components/Footer.tsx — JetBrains-inspired footer
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white" style={{ borderColor: "#E6E9F2" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base leading-tight">eWheelz</div>
                <div
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  Pakistan EV
                </div>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Pakistan&apos;s EV Intelligence Platform.<br />
              Data-driven. Always free.
            </p>
            <div
              className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg,rgba(99,102,241,0.10),rgba(139,92,246,0.06))",
                border: "1px solid rgba(99,102,241,0.20)",
                color: "#4F46E5",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              EV Intelligence Platform
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">Explore</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/ev",       label: "EV Database" },
                { href: "/compare",  label: "Compare EVs" },
                { href: "/ev-range", label: "Range Index" },
                { href: "/listings", label: "Buy & Sell" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">Tools</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/trip-planner",    label: "Trip Planner" },
                { href: "/charging-map",    label: "Charging Map" },
                { href: "/cost-calculator", label: "Cost Calculator" },
                { href: "/community",       label: "Community" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">Learn</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/batteries", label: "Battery Guide" },
                { href: "/articles",  label: "Articles" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-3 gap-4 mb-8 py-5 px-6 rounded-2xl"
          style={{ background: "linear-gradient(135deg,#EEF2FF,#F5F3FF)", border: "1px solid rgba(99,102,241,0.12)" }}
        >
          {[
            { v: "9+", l: "EV Models",    g: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
            { v: "16+", l: "Charge Points", g: "linear-gradient(135deg,#22C55E,#10B981)" },
            { v: "0",  l: "CO₂ Emissions", g: "linear-gradient(135deg,#3B82F6,#6366F1)" },
          ].map((s, i) => (
            <div key={s.l} className={`text-center ${i === 1 ? "border-x" : ""}`} style={i === 1 ? { borderColor: "rgba(99,102,241,0.12)" } : {}}>
              <div
                className="font-bold text-xl"
                style={{ background: s.g, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                {s.v}
              </div>
              <div className="text-slate-500 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t pt-6" style={{ borderColor: "#E6E9F2" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} eWheelz · All rights reserved</span>
            <span>No account · No ads · Open data</span>
            <span>Built for Pakistan&apos;s EV future ⚡</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
