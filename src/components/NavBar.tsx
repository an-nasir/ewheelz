// src/components/NavBar.tsx — JetBrains-inspired clean navbar
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  desc: string;
  badge?: string;
  color?: string;
}
interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { href: "/ev",       icon: "⚡", label: "EV Database",        desc: "9 EVs available in Pakistan", color: "#6366F1" },
      { href: "/compare",  icon: "⚖️", label: "Compare EVs",        desc: "Side-by-side spec comparison", color: "#8B5CF6" },
      { href: "/ev-range", icon: "📊", label: "Range Reality Index", desc: "Real-world range in Pakistan", badge: "New", color: "#3B82F6" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [
      { href: "/trip-planner",    icon: "🗺️", label: "Trip Planner",       desc: "Plan routes with charging stops", color: "#6366F1" },
      { href: "/charging-map",    icon: "🔌",  label: "Charging Map",       desc: "16+ live stations across Pakistan", color: "#22C55E" },
      { href: "/cost-calculator", icon: "💰",  label: "Cost Calculator",    desc: "EV vs petrol savings", color: "#10B981" },
      { href: "/emi-calculator",  icon: "🏦",  label: "EMI Calculator",     desc: "HBL, MCB, Meezan financing", badge: "New", color: "#F59E0B" },
      { href: "/home-charging",   icon: "🔌",  label: "Home Charging Guide",desc: "Wallbox, solar & load shedding tips", badge: "New", color: "#3B82F6" },
    ],
  },
  {
    id: "market",
    label: "Market",
    items: [
      { href: "/listings", icon: "🛒", label: "Buy & Sell", desc: "Used EV listings in Pakistan", color: "#F59E0B" },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      { href: "/community", icon: "🌱", label: "Community Hub",  desc: "Leaderboard, trip logs & reports", badge: "New", color: "#22C55E" },
      { href: "/dashboard", icon: "📊", label: "My Dashboard",   desc: "Personal EV stats & savings", color: "#6366F1" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { href: "/batteries", icon: "🔋", label: "Battery Guide",     desc: "LFP, NMC & chemistry explained", color: "#F59E0B" },
      { href: "/articles",  icon: "📰", label: "Articles & Guides", desc: "EV news and tutorials", color: "#6366F1" },
    ],
  },
];

export default function NavBar() {
  const pathname = usePathname();
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

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderColor: "#E6E9F2",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
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
              <span className="text-[9px] font-semibold tracking-widest uppercase"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Pakistan EV
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
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
                  {group.label}
                  <svg
                    className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeGroup === group.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {activeGroup === group.id && (
                  <div
                    className="absolute top-full left-0 mt-2 py-2 min-w-[270px] z-50 rounded-2xl"
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
                          className="flex items-start gap-3 px-4 py-2.5 mx-1 rounded-xl transition-all"
                          style={{
                            background: active ? `${item.color}12` : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!active) (e.currentTarget as HTMLElement).style.background = "#F6F8FF";
                          }}
                          onMouseLeave={(e) => {
                            if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          {/* Coloured icon dot */}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                            style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-semibold text-slate-900">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/listings"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all"
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.30)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.45)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(99,102,241,0.30)")}
            >
              + Post Listing
            </Link>

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

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[#E6E9F2] mt-1">
            {GROUPS.map((group) => (
              <div key={group.id}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  onClick={() => setMobileExpanded(mobileExpanded === group.id ? null : group.id)}
                >
                  {group.label}
                  <svg className={`w-3.5 h-3.5 transition-transform ${mobileExpanded === group.id ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ml-auto"
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

            <div className="px-3 pt-3 border-t border-[#E6E9F2] mt-2">
              <Link
                href="/listings"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-2.5 text-white text-sm font-semibold rounded-xl text-center transition-all"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
              >
                + Post Listing
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
