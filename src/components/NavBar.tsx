"use client";
// src/components/NavBar.tsx
// Human-first nav: Compare / Plan / Insights / News / Buy & Sell
// Dropdown: 2-col card grid, Stripe/Linear style

import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

const GROUPS = [
  {
    id: "compare", label: "Compare",
    items: [
      { href: "/ev",       icon: "⚡", title: "EV Database",    desc: "17 EVs tracked in Pakistan",          color: "#6366F1" },
      { href: "/compare",  icon: "⚖️", title: "Compare EVs",    desc: "Side-by-side spec comparison",         color: "#8B5CF6" },
      { href: "/ev-range", icon: "📊", title: "Range Reality",   desc: "Real-world range in Pakistan",        color: "#3B82F6", badge: "New" },
      { href: "/peos",     icon: "🇵🇰", title: "EV Match Quiz",  desc: "Find your perfect EV in 2 mins",     color: "#22C55E" },
    ],
  },
  {
    id: "plan", label: "Plan",
    items: [
      { href: "/trip-planner",   icon: "🗺️", title: "Trip Planner",   desc: "Plan routes with charging stops",     color: "#6366F1" },
      { href: "/charging-map",   icon: "🔌", title: "Charging Map",    desc: "16+ live stations across Pakistan",   color: "#22C55E" },
      { href: "/emi-calculator", icon: "🏦", title: "EMI Calculator",  desc: "HBL, MCB, Meezan financing",          color: "#F59E0B", badge: "New" },
      { href: "/home-charging",  icon: "⚡", title: "Home Charging",   desc: "Wallbox, solar & load-shedding tips", color: "#3B82F6" },
    ],
  },
  {
    id: "insights", label: "Insights",
    items: [
      { href: "/battery-health",  icon: "🔋", title: "Battery Health",  desc: "A–F grade in 30 sec. #1 hidden cost", color: "#22C55E", badge: "Free" },
      { href: "/ev-valuation",    icon: "💰", title: "Resale Value",    desc: "Real PKR range, no dealer BS",         color: "#8B5CF6" },
      { href: "/import-duty",     icon: "📦", title: "Import Duty",     desc: "Exact duties on any EV to Pakistan",   color: "#EC4899", badge: "Only here" },
      { href: "/price-index",     icon: "📈", title: "Price Index",     desc: "6-month trend charts, live data",      color: "#34D399", badge: "Live" },
      { href: "/cost-calculator", icon: "⛽", title: "EV vs Petrol",   desc: "5-year savings vs a Corolla",          color: "#F59E0B" },
    ],
  },
] as const;

type GroupItem = { href: string; icon: string; title: string; desc: string; color: string; badge?: string };

const DIRECT = [
  { href: "/articles", label: "News",       icon: "📰" },
  { href: "/listings", label: "Buy & Sell", icon: "🚗" },
];

export default function NavBar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const locale     = useLocale();
  const { data: session, status } = useSession();
  const [active, setActive]       = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [mobileExp, setMobileExp]         = useState<string | null>(null);
  const [scrolled, setScrolled]           = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenu  = (id: string) => { if (closeTimer.current) clearTimeout(closeTimer.current); setActive(id); };
  const closeMenu = () => { closeTimer.current = setTimeout(() => setActive(null), 140); };
  const toggleLang = () => router.replace(pathname, { locale: locale === "en" ? "ur" : "en" });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "py-2" : "py-3"}`}
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226,232,240,0.8)",
        boxShadow: scrolled ? "0 4px 24px rgba(15,23,42,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-black tracking-tight text-[19px] text-slate-900 group-hover:text-indigo-600 transition-colors">eWheelz</span>
              <span className="text-[8.5px] font-black tracking-[0.2em] uppercase"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                PAKISTAN&apos;S EV MARKET
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {GROUPS.map(group => (
              <div key={group.id} className="relative" onMouseEnter={() => openMenu(group.id)} onMouseLeave={closeMenu}>
                <button className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                  active === group.id ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  {group.label}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${active === group.id ? "rotate-180 text-indigo-600" : "text-slate-400"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {active === group.id && (
                  <div
                    className="absolute top-full mt-2 z-50 rounded-2xl overflow-hidden"
                    style={{
                      left: "50%", transform: "translateX(-50%)",
                      minWidth: (group.items as readonly GroupItem[]).length >= 5 ? 500 : 440,
                      background: "#fff",
                      border: "1px solid rgba(226,232,240,0.9)",
                      boxShadow: "0 20px 60px rgba(15,23,42,0.12), 0 8px 20px rgba(99,102,241,0.08)",
                      animation: "dropIn 0.15s ease-out",
                    }}
                    onMouseEnter={() => openMenu(group.id)}
                    onMouseLeave={closeMenu}
                  >
                    {/* Header strip */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{group.label}</span>
                      <span className="text-[10px] text-slate-300">{(group.items as readonly GroupItem[]).length} tools</span>
                    </div>

                    {/* 2-col card grid */}
                    <div className={`grid gap-1 p-2.5 ${(group.items as readonly GroupItem[]).length >= 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {(group.items as readonly GroupItem[]).map(item => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                          <Link key={item.href} href={item.href} onClick={() => setActive(null)}
                            className="flex items-start gap-3 p-3 rounded-xl transition-all duration-150 hover:-translate-y-px hover:shadow-sm group/card"
                            style={{
                              background: isActive ? `${item.color}10` : "transparent",
                              border: `1px solid ${isActive ? `${item.color}25` : "transparent"}`,
                            }}
                            onMouseEnter={e => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.background = `${item.color}08`;
                              el.style.borderColor = `${item.color}20`;
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget as HTMLElement;
                              el.style.background = isActive ? `${item.color}10` : "transparent";
                              el.style.borderColor = isActive ? `${item.color}25` : "transparent";
                            }}
                          >
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] flex-shrink-0 transition-transform group-hover/card:scale-110"
                              style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className="text-[13px] font-bold text-slate-800 group-hover/card:text-indigo-700 transition-colors leading-tight">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none shrink-0"
                                    style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Direct links */}
            <div className="flex items-center gap-0.5 ml-1.5 pl-2 border-l border-slate-200">
              {DIRECT.map(link => (
                <Link key={link.href} href={link.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                    pathname?.startsWith(link.href)
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}>
                  <span>{link.icon}</span> {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              🌐 {locale === "en" ? "اردو" : "English"}
            </button>

            <Link href="/listings/post"
              className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-black rounded-xl text-white transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              List Your EV
            </Link>

            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="w-9 h-9 rounded-full border-2 border-indigo-100 flex items-center justify-center bg-white hover:border-indigo-300 transition-all overflow-hidden hover:scale-105">
                  {session?.user?.image
                    ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-sm font-black text-indigo-600">{session?.user?.name?.[0]?.toUpperCase()}</span>
                  }
                </Link>
                <button onClick={() => signOut()}
                  className="hidden md:block text-sm font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all">
                  Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => signIn()}
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
                Log In
              </button>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
              {mobileOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-100 mt-3 pt-4 pb-6 space-y-1">
            <Link href="/listings/post" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black text-white mb-4"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              List Your EV — Free
            </Link>

            {GROUPS.map(group => (
              <div key={group.id}>
                <button onClick={() => setMobileExp(mobileExp === group.id ? null : group.id)}
                  className="w-full flex items-center justify-between px-3 py-3 text-xs font-black uppercase tracking-[0.15em] text-slate-400 rounded-xl hover:bg-slate-50 transition-all">
                  {group.label}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${mobileExp === group.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {mobileExp === group.id && (
                  <div className="space-y-0.5 pl-2 pb-2">
                    {(group.items as readonly GroupItem[]).map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
                        style={{ color: pathname?.startsWith(item.href) ? item.color : "#475569" }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: `${item.color}12` }}>{item.icon}</div>
                        <div className="flex-1">
                          <div className="text-[13px] font-bold">{item.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                        </div>
                        {item.badge && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase"
                            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>{item.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-slate-100 pt-3 space-y-0.5">
              {DIRECT.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-lg">{link.icon}</div>
                  {link.label}
                </Link>
              ))}
              <button onClick={() => { toggleLang(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-lg">🌐</div>
                {locale === "en" ? "Switch to اردو" : "Switch to English"}
              </button>
              {status !== "authenticated" && (
                <button onClick={() => { signIn(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-bold text-indigo-600 hover:bg-indigo-50 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-lg">👤</div>
                  Log In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </header>
  );
}
