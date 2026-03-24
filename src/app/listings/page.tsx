// src/app/listings/page.tsx — EV Marketplace (JetBrains-inspired design)
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Buy & Sell EVs — Pakistan",
  description: "Browse EV listings across Pakistan. BYD, MG, Hyundai and more.",
};

interface SearchParams { city?: string; brand?: string; min_price?: string; max_price?: string }

const POWERTRAIN_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  BEV:  { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  PHEV: { bg: "#EEF2FF", color: "#4F46E5", border: "#A5B4FC" },
  REEV: { bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" },
  HEV:  { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
};

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { city, brand, min_price, max_price } = searchParams;

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(city && { city }),
      ...(min_price || max_price ? { price: {
        ...(min_price ? { gte: parseInt(min_price) } : {}),
        ...(max_price ? { lte: parseInt(max_price) } : {}),
      }} : {}),
      ...(brand ? { evModel: { brand } } : {}),
    },
    include: {
      evModel: { select: { brand: true, model: true, variant: true, slug: true, powertrain: true } },
      user:    { select: { name: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
    return `/listings${q ? `?${q}` : ""}`;
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
              {listings.length} active listing{listings.length !== 1 ? "s" : ""} across Pakistan
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
                <Link href="/listings"
                  className="block text-xs text-center text-slate-400 hover:text-red-500 pt-3 transition-colors"
                  style={{ borderTop: "1px solid #E6E9F2" }}>
                  ✕ Clear all filters
                </Link>
              )}
            </div>
          </aside>

          {/* ── Listings ── */}
          <div className="flex-1 space-y-3">
            {listings.length === 0 ? (
              <div className="rounded-2xl p-14 text-center"
                style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
                <div className="text-4xl mb-3">🔋</div>
                <p className="text-slate-500">No listings match these filters.</p>
                <Link href="/listings" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">Clear filters</Link>
              </div>
            ) : listings.map((l, idx) => {
              const pt = POWERTRAIN_STYLES[l.evModel.powertrain] ?? POWERTRAIN_STYLES.BEV;
              return (
                <div key={l.id}
                  className="group rounded-2xl p-5 hover-lift"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E6E9F2",
                    animationDelay: `${idx * 30}ms`,
                  }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Left accent bar */}
                    <div className="hidden sm:block w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: `linear-gradient(180deg,${pt.color},${pt.border})` }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/ev/${l.evModel.slug}`}
                          className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {l.evModel.brand} {l.evModel.model}
                          {l.evModel.variant && ` ${l.evModel.variant}`}
                        </Link>
                        {/* Powertrain badge */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: pt.bg, color: pt.color, border: `1px solid ${pt.border}` }}>
                          {l.evModel.powertrain}
                        </span>
                        {/* Year */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "#F6F8FF", color: "#64748B", border: "1px solid #E6E9F2" }}>
                          {l.year}
                        </span>
                        {/* Condition */}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={l.condition === "NEW"
                            ? { background: "#EEF2FF", color: "#4F46E5", border: "1px solid #A5B4FC" }
                            : { background: "#F6F8FF", color: "#64748B", border: "1px solid #E6E9F2" }}>
                          {l.condition}
                        </span>
                      </div>

                      {l.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{l.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span>📍 {l.city}</span>
                        {l.mileage       != null && <span>🛣 {l.mileage.toLocaleString()} km</span>}
                        {l.batteryHealth != null && <span>🔋 {l.batteryHealth}% health</span>}
                        <span>👤 {l.user.name}</span>
                      </div>
                    </div>

                    {/* Price + Contact */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div>
                        <div className="text-xl font-black"
                          style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                          PKR {(l.price / 1_000_000).toFixed(2)}M
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">PKR {l.price.toLocaleString()}</div>
                      </div>

                      {/* Contact Seller — WhatsApp pre-filled */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Hi, I'm interested in your ${l.evModel.brand} ${l.evModel.model} (${l.year}) listed on eWheelz for PKR ${l.price.toLocaleString()} in ${l.city}. Is it still available?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                        style={{ background: "#25D366", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(37,211,102,0.35)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.553 4.1 1.522 5.83L.057 23.928a.5.5 0 00.614.614l6.11-1.463A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.93 9.93 0 01-5.077-1.386l-.363-.217-3.767.901.917-3.667-.236-.38A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        Contact Seller
                      </a>

                      {/* View EV specs link */}
                      <Link href={`/ev/${l.evModel.slug}`}
                        className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold transition-colors">
                        View EV specs →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
