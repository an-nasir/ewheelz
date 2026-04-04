import { Link } from "@/navigation";
import NewsletterWidget from "@/components/NewsletterWidget";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #E6E9F2" }}>

      {/* ── Newsletter strip — dark, full width, prominent ───────────────── */}
      <div style={{ background: "#0F172A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
            <div className="shrink-0">
              <div className="text-xs font-black uppercase tracking-widest text-green-400 mb-1">Weekly · Free</div>
              <div className="text-xl font-black text-white">Pakistan EV Digest</div>
              <p className="text-slate-400 text-sm mt-1">Prices, new models, charging news — every Friday.</p>
            </div>
            <div className="flex-1 max-w-md">
              <NewsletterWidget source="footer" variant="footer" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Link columns ─────────────────────────────────────────────────── */}
      <div style={{ background: "#F8FAFC" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <span className="font-black text-slate-900">eWheelz</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Pakistan's verified EV marketplace. Battery grades on every listing.
              </p>
              <div className="flex gap-2">
                {["FB","TW","IG"].map(s => (
                  <a key={s} href="#"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    style={{ border: "1px solid #E6E9F2" }}>
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Marketplace</div>
              <nav className="space-y-2">
                {[
                  { href: "/listings",      label: "Browse Listings" },
                  { href: "/listings/post", label: "Sell Your EV" },
                  { href: "/ev-valuation",  label: "Get Valuation" },
                  { href: "/battery-health",label: "Battery Check" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href as any}
                    className="block text-sm text-slate-500 hover:text-indigo-600 transition-colors py-0.5">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Tools */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tools</div>
              <nav className="space-y-2">
                {[
                  { href: "/compare",         label: "Compare EVs" },
                  { href: "/cost-calculator", label: "Cost Calculator" },
                  { href: "/charging-map",    label: "Charging Map" },
                  { href: "/emi-calculator",  label: "EMI Calculator" },
                  { href: "/trip-planner",    label: "Trip Planner" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href as any}
                    className="block text-sm text-slate-500 hover:text-indigo-600 transition-colors py-0.5">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Learn */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Learn</div>
              <nav className="space-y-2">
                {[
                  { href: "/ev",         label: "EV Database" },
                  { href: "/batteries",  label: "Battery Guide" },
                  { href: "/articles",   label: "News & Articles" },
                  { href: "/community",  label: "Community" },
                  { href: "/pricing",    label: "Pricing" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href as any}
                    className="block text-sm text-slate-500 hover:text-indigo-600 transition-colors py-0.5">
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div style={{ background: "#F1F5F9", borderTop: "1px solid #E6E9F2" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap gap-4 items-center">
            <span>© {new Date().getFullYear()} eWheelz</span>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-slate-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Trusted by 10K+ EV owners in Pakistan</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
