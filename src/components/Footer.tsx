import {useTranslations} from 'next-intl';
import {Link} from "@/navigation";
import NewsletterWidget from "@/components/NewsletterWidget";

export default function Footer() {
  const t = useTranslations('common');
  const th = useTranslations('home');

  return (
    <footer className="mt-16 border-t bg-white" style={{ borderColor: "#E6E9F2" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

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
              {th('description').split('.')[0]}.<br />
              Data-driven. Always free.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">{t('explore')}</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/ev",       label: t('evDatabase') },
                { href: "/compare",  label: t('compare') },
                { href: "/ev-range", label: t('range') },
              ].map(l => (
                <Link key={l.href} href={l.href as any}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">{t('tools')}</h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: "/trip-planner",    label: t('tripPlanner') },
                { href: "/charging-map",    label: t('chargingStations') },
                { href: "/cost-calculator", label: t('costCalculator') },
              ].map(l => (
                <Link key={l.href} href={l.href as any}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-slate-900 text-xs font-bold uppercase tracking-widest mb-4">Learn</h3>
            <nav className="flex flex-col gap-2.5 mb-6">
              {[
                { href: "/batteries", label: t('battery') },
                { href: "/articles",  label: "Articles" },
              ].map(l => (
                <Link key={l.href} href={l.href as any}
                  className="text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </nav>
            {/* Newsletter signup — compact footer variant */}
            <NewsletterWidget source="footer" variant="footer" />
          </div>
        </div>

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
