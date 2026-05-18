// src/app/listings/page.tsx — EV Marketplace (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingsView from "@/components/ListingsView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Used Electric Cars for Sale in Pakistan — BYD, MG, Hyundai | eWheelz",
  description: "Browse active used EV listings across Pakistan with source labels, battery risk signals where available, and seller contact status.",
};

interface SearchParams { city?: string; brand?: string; min_price?: string; max_price?: string }

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: SearchParams;
}) {
  const locale = params.locale;
  const { city, brand, min_price, max_price } = searchParams;

  const where = {
    status: "ACTIVE" as const,
    ...(city && { city }),
    ...(min_price || max_price ? { price: {
      ...(min_price ? { gte: parseInt(min_price) } : {}),
      ...(max_price ? { lte: parseInt(max_price) } : {}),
    }} : {}),
    ...(brand ? { evModel: { brand } } : {}),
  };

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        evModel: { select: { brand: true, model: true, variant: true, slug: true, powertrain: true, imageUrl: true } },
        user:    { select: { name: true, city: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.listing.count({ where }),
  ]);

  const cities      = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar"];
  const brands      = ["BYD", "MG", "Hyundai", "Changan", "Honri", "Deepal", "Tesla"];
  const priceRanges = [
    { label: "Under 5M",  min: "0",        max: "5000000"  },
    { label: "5M – 10M",  min: "5000000",  max: "10000000" },
    { label: "10M – 15M", min: "10000000", max: "15000000" },
    { label: "15M+",      min: "15000000", max: ""         },
  ];

  function buildUrl(params: Record<string, string | undefined>) {
    const base   = new URLSearchParams();
    const merged = { city, brand, min_price, max_price, ...params };
    for (const [k, v] of Object.entries(merged)) { if (v) base.set(k, v); }
    const q = base.toString();
    return `/${locale}/listings${q ? `?${q}` : ""}`;
  }

  const hasFilters = !!(city || brand || min_price);

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 45%,#3B82F6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "280px", height: "280px", borderRadius: "50%",
            background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "20%",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none",
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              🛒 EV Marketplace
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 leading-tight">
              Buy &amp; Sell EVs
            </h1>
            <p className="text-green-100 text-lg">
              {totalCount} active listing{totalCount !== 1 ? "s" : ""} across Pakistan
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Filters sidebar ── */}
          <aside className="lg:w-56 shrink-0">
            <div className="sticky top-20 rounded-2xl p-5 space-y-5"
              style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>

              <FilterSection label="City">
                <FilterLink href={buildUrl({ city: undefined })} active={!city}>All Cities</FilterLink>
                {cities.map(c => <FilterLink key={c} href={buildUrl({ city: c })} active={city === c}>{c}</FilterLink>)}
              </FilterSection>

              <FilterSection label="Brand">
                <FilterLink href={buildUrl({ brand: undefined })} active={!brand}>All Brands</FilterLink>
                {brands.map(b => <FilterLink key={b} href={buildUrl({ brand: b })} active={brand === b}>{b}</FilterLink>)}
              </FilterSection>

              <FilterSection label="Price">
                <FilterLink href={buildUrl({ min_price: undefined, max_price: undefined })} active={!min_price && !max_price}>
                  Any Price
                </FilterLink>
                {priceRanges.map(r => (
                  <FilterLink
                    key={r.label}
                    href={buildUrl({ min_price: r.min, max_price: r.max || undefined })}
                    active={min_price === r.min && (max_price || "") === r.max}>
                    {r.label}
                  </FilterLink>
                ))}
              </FilterSection>

              {hasFilters && (
                <Link href={`/${locale}/listings`}
                  className="block text-xs text-center text-slate-400 hover:text-red-500 pt-3 transition-colors"
                  style={{ borderTop: "1px solid #E6E9F2" }}>
                  ✕ Clear all filters
                </Link>
              )}
            </div>
          </aside>

          {/* ── Listings (Card/Table + Lazy Loading) ── */}
          <ListingsView
            initialListings={JSON.parse(JSON.stringify(listings))}
            initialTotal={totalCount}
            searchParams={{ city, brand, min_price, max_price }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Filter components ────────────────────────────────────────────────────────

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className={`block text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
        active ? "font-semibold" : "hover:text-indigo-600 hover:bg-[#F6F8FF]"
      }`}
      style={active
        ? { background: "#EEF2FF", color: "#4F46E5", fontWeight: "600", border: "1px solid #C7D2FE" }
        : { color: "#64748B" }}>
      {children}
    </Link>
  );
}
