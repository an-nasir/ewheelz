"use client";
// src/components/NavBar.tsx

import {useTranslations, useLocale} from 'next-intl';
import {Link, usePathname, useRouter} from "@/navigation";
import { useState, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

interface NavItem {
  href: string;
  icon: string;
  labelKey: string;
  descKey: string;
  badge?: string;
  color?: string;
}
interface NavGroup {
  id: string;
  labelKey: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "explore",
    labelKey: "explore",
    items: [
      { href: "/ev",       icon: "⚡", labelKey: "evDatabase",   descKey: "evDatabaseDesc",  color: "#6366F1" },
      { href: "/compare",  icon: "⚖️", labelKey: "compare",      descKey: "compareDesc",     color: "#8B5CF6" },
      { href: "/ev-range", icon: "📊", labelKey: "range",        descKey: "rangeDesc",       badge: "New", color: "#3B82F6" },
      { href: "/peos",     icon: "🇵🇰", labelKey: "readiness",    descKey: "readinessDesc",   badge: "P4", color: "#22C55E" },
    ],
  },
  {
    id: "tools",
    labelKey: "tools",
    items: [
      { href: "/trip-planner",    icon: "🗺️", labelKey: "tripPlanner",      descKey: "tripPlannerDesc",      color: "#6366F1" },
      { href: "/charging-map",    icon: "🔌", labelKey: "chargingStations", descKey: "chargingStationsDesc", color: "#22C55E" },
      { href: "/cost-calculator", icon: "💰", labelKey: "costCalculator",   descKey: "costCalculatorDesc",   color: "#10B981" },
      { href: "/emi-calculator",  icon: "🏦", labelKey: "emiCalculator",    descKey: "emiCalculatorDesc",    badge: "New", color: "#F59E0B" },
      { href: "/home-charging",   icon: "⚡", labelKey: "homeCharging",     descKey: "homeChargingDesc",     badge: "New", color: "#3B82F6" },
    ],
  },
];

// Direct links visible in the nav bar (no dropdown)
const DIRECT_LINKS = [
  { href: "/articles",    labelKey: "news",      icon: "📰" },
  { href: "/listings",    labelKey: "listings",  icon: "🚗" },
  { href: "/for-dealers", labelKey: "forDealers", icon: "🏪" },
];

export default function NavBar() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openGroup = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveGroup(id);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveGroup(null), 130);
  };
  const isGroupActive = (items: NavItem[]) => items.some((i) => pathname?.startsWith(i.href));

  // Use useLocale() — pathname from next-intl navigation has NO locale prefix
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ur' : 'en';
    router.replace(pathname, {locale: newLocale});
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderColor: "#E6E9F2",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg shrink-0 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="flex flex-col leading-none">
              <span className="text-slate-900 font-bold tracking-tight text-[15px]">eWheelz</span>
              <span
                className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                Pakistan EV
              </span>
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5">

            {/* Dropdown groups */}
            {GROUPS.map((group) => (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => openGroup(group.id)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium flex items-center gap-1 transition-all duration-150 ${
                    isGroupActive(group.items)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {t(group.labelKey)}
                  <svg
                    className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeGroup === group.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeGroup === group.id && (
                  <div
                    className={`absolute top-full mt-2 py-2 min-w-[270px] z-50 rounded-2xl ${t('dir') === 'rtl' ? 'right-0' : 'left-0'}`}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E6E9F2",
                      boxShadow: "0 16px 48px rgba(15,23,42,0.12), 0 4px 12px rgba(99,102,241,0.08)",
                    }}
                    onMouseEnter={() => openGroup(group.id)}
                    onMouseLeave={scheduleClose}
                  >
                    {group.items.map((item) => {
                      const active = pathname?.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setActiveGroup(null)}
                          className="flex items-start gap-3 px-4 py-2.5 mx-1 rounded-xl transition-all hover:bg-slate-50"
                          style={{ background: active ? `${item.color}12` : "transparent" }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                            style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-slate-900">{t(item.labelKey)}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">{t(item.descKey)}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* ── Direct flat links ─────────────────────────────── */}
            <div className="flex items-center gap-0.5 ml-1 pl-2 border-l border-slate-100">
              {DIRECT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium flex items-center gap-1.5 transition-all ${
                    pathname?.startsWith(link.href)
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs">{link.icon}</span>
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </nav>

          {/* ── Right actions ─────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Language toggle — desktop only */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex px-2.5 py-1.5 text-[12px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all items-center gap-1.5"
            >
              🌐 {t('languageName')}
            </button>

            {/* Primary CTA — "Sell Your EV" — visible on ≥md */}
            <Link
              href="/listings/post"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold rounded-xl text-white transition-all hover:opacity-90 shadow-sm shadow-indigo-200"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t('sellYourEv')}
            </Link>

            {/* Auth */}
            {status === "authenticated" ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="w-9 h-9 rounded-full border border-indigo-100 flex items-center justify-center bg-white shadow-sm hover:border-indigo-300 transition-all overflow-hidden"
                  title="Dashboard"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-indigo-600">{session?.user?.name?.[0]?.toUpperCase()}</span>
                  )}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden sm:flex text-[12px] font-semibold text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-50 transition-all"
                >
                  {t('signOut')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center px-3 py-2 text-[13px] font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
              >
                {t('signIn')}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[#E6E9F2] mt-1">

            {/* Mobile CTA */}
            <div className="px-3 pt-3 pb-1">
              <Link
                href="/listings/post"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
              >
                + {t('sellYourEv')}
              </Link>
            </div>

            {/* Dropdown groups */}
            {GROUPS.map((group) => (
              <div key={group.id}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  onClick={() => setMobileExpanded(mobileExpanded === group.id ? null : group.id)}
                >
                  {t(group.labelKey)}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === group.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileExpanded === group.id && (
                  <div className="ml-2 space-y-0.5 mb-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                        style={{
                          background: pathname?.startsWith(item.href) ? `${item.color}12` : "transparent",
                          color: pathname?.startsWith(item.href) ? item.color : "#475569",
                        }}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium">{t(item.labelKey)}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Direct links in mobile */}
            <div className="border-t border-[#E6E9F2] mt-1 pt-1 space-y-0.5">
              {DIRECT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all mx-1"
                  style={{
                    color: pathname?.startsWith(link.href) ? "#6366F1" : "#475569",
                    background: pathname?.startsWith(link.href) ? "#6366F115" : "transparent",
                  }}
                >
                  <span>{link.icon}</span>
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Language toggle in mobile */}
            <div className="px-3 pt-3">
              <button
                onClick={() => { toggleLanguage(); setMobileOpen(false); }}
                className="w-full py-2 text-[12px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
              >
                🌐 {t('languageName')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
