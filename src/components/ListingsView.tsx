"use client";
// src/components/ListingsView.tsx
// Card + Table view toggle with lazy-loading (Intersection Observer)

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScamReportButton from "@/components/ScamReportButton";

// ── Types ────────────────────────────────────────────────────────────────────

interface ListingItem {
  id: string;
  evName: string | null;
  price: number;
  year: number;
  mileage: number | null;
  city: string;
  batteryHealth: number | null;
  condition: string;
  description: string | null;
  images: string | null;
  contactName: string | null;
  source: string;
  sourceUrl: string | null;
  dealGrade: string | null;
  verifiedSeller: boolean;
  evModel: {
    brand: string;
    model: string;
    variant: string | null;
    slug: string;
    powertrain: string;
    imageUrl: string | null;
  } | null;
  user: { name: string | null; city: string | null } | null;
}

interface Props {
  initialListings: ListingItem[];
  initialTotal: number;
  searchParams: Record<string, string | undefined>;
}

// ── Brand stock images (Unsplash) — used when no scraped image exists ────────
const BRAND_IMAGES: Record<string, string> = {
  BYD:     "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
  MG:      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80",
  Hyundai: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&q=80",
  Changan: "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=600&q=80",
  Deepal:  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80",
  Tesla:   "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
  Honri:   "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=600&q=80",
  default: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80",
};

// ── Styles ───────────────────────────────────────────────────────────────────

const POWERTRAIN_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  BEV:  { bg: "#F0FDF4", color: "#16A34A", border: "#86EFAC" },
  PHEV: { bg: "#EEF2FF", color: "#4F46E5", border: "#A5B4FC" },
  REEV: { bg: "#F5F3FF", color: "#7C3AED", border: "#C4B5FD" },
  HEV:  { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
};

const DEAL_GRADE_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  HOT:        { label: "🔥 Hot Deal",   bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  GOOD:       { label: "✅ Good Deal",  bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  FAIR:       { label: "📊 Fair",       bg: "#F8FAFF", color: "#4F46E5", border: "#C7D2FE" },
  OVERPRICED: { label: "⚠️ Overpriced", bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function proxyImage(url: string | null | undefined): string | null {
  if (!url) return null;
  // Only proxy external CDN images; leave relative/our-own URLs as-is
  if (url.startsWith("/") || url.includes("ewheelz")) return url;
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

function getBrandFallback(listing: ListingItem): string {
  const brand = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "";
  return BRAND_IMAGES[brand] ?? BRAND_IMAGES.default;
}

function getFirstImage(listing: ListingItem): string {
  if (listing.images) {
    try {
      const arr = JSON.parse(listing.images);
      if (Array.isArray(arr) && arr.length > 0) return proxyImage(arr[0]) ?? getBrandFallback(listing);
    } catch { /* ignore malformed JSON */ }
  }
  return proxyImage(listing.evModel?.imageUrl) ?? getBrandFallback(listing);
}

function DealGradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return null;
  const c = DEAL_GRADE_CFG[grade] ?? DEAL_GRADE_CFG.FAIR;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function BatteryGradeBadge({ health }: { health: number | null }) {
  if (health == null) return null;
  const grade = health >= 90 ? "A" : health >= 80 ? "B" : health >= 70 ? "C" : health >= 60 ? "D" : "F";
  const gc = grade === "A" ? "#16A34A" : grade === "B" ? "#6366F1" : grade === "C" ? "#D97706" : grade === "D" ? "#EA580C" : "#DC2626";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap"
      style={{ background: `${gc}15`, color: gc, border: `1px solid ${gc}30` }}>
      🔋 Grade {grade}
    </span>
  );
}

function ListingImage({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImgSrc(fallback)}
      className="w-full h-full object-cover"
    />
  );
}

// ── Card View ────────────────────────────────────────────────────────────────

function CardView({ listing, idx, locale }: { listing: ListingItem; idx: number; locale: string }) {
  const pt = POWERTRAIN_STYLES[listing.evModel?.powertrain ?? "BEV"] ?? POWERTRAIN_STYLES.BEV;
  const img = getFirstImage(listing);
  const fallback = getBrandFallback(listing);
  const evLabel = `${listing.evModel?.brand ?? listing.evName ?? "EV"} ${listing.evModel?.model ?? ""}`.trim();

  return (
    <div className="group rounded-2xl overflow-hidden hover-lift"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E6E9F2",
        animationDelay: `${idx * 30}ms`,
      }}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden"
          style={{ background: "#F6F8FF" }}>
          <ListingImage src={img} fallback={fallback} alt={evLabel} />
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Left accent bar (desktop) */}
            <div className="hidden sm:block w-1 self-stretch rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(180deg,${pt.color},${pt.border})` }} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={listing.evModel?.slug ? `/${locale}/ev/${listing.evModel.slug}` : `/${locale}/ev`}
                  className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {evLabel}
                  {listing.evModel?.variant && ` ${listing.evModel.variant}`}
                </Link>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: pt.bg, color: pt.color, border: `1px solid ${pt.border}` }}>
                  {listing.evModel?.powertrain ?? "BEV"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: "#F6F8FF", color: "#64748B", border: "1px solid #E6E9F2" }}>
                  {listing.year}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={listing.condition === "NEW"
                    ? { background: "#EEF2FF", color: "#4F46E5", border: "1px solid #A5B4FC" }
                    : { background: "#F6F8FF", color: "#64748B", border: "1px solid #E6E9F2" }}>
                  {listing.condition}
                </span>
                <DealGradeBadge grade={listing.dealGrade} />
              </div>

              {listing.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{listing.description}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                <span>📍 {listing.city}</span>
                {listing.mileage != null && <span>🛣 {listing.mileage.toLocaleString()} km</span>}
                <BatteryGradeBadge health={listing.batteryHealth} />
                {(listing.user?.name || listing.contactName) && (
                  <span>👤 {listing.user?.name ?? listing.contactName}</span>
                )}
                {listing.source && listing.source.toUpperCase() !== "MANUAL" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "#F6F8FF", color: "#94A3B8", border: "1px solid #E6E9F2" }}>
                    via {listing.source.toUpperCase() === "PAKWHEELS" ? "PakWheels" : "OLX"}
                  </span>
                )}
                {listing.verifiedSeller && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE" }}>
                    ✅ Verified
                  </span>
                )}
              </div>
            </div>

            {/* Price + Contact */}
            <div className="text-right shrink-0 flex flex-col items-end gap-2">
              <div>
                <div className="text-xl font-black"
                  style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  PKR {(listing.price / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-xs text-slate-400 mt-0.5">PKR {listing.price.toLocaleString()}</div>
              </div>
              <WhatsAppButton
                brand={listing.evModel?.brand ?? listing.evName ?? "EV"}
                model={listing.evModel?.model ?? ""}
                year={listing.year}
                price={listing.price}
                city={listing.city}
              />
              <Link href={`/${locale}/listings/${listing.id}`}
                className="text-[11px] text-indigo-500 hover:text-indigo-700 font-semibold transition-colors">
                View listing →
              </Link>
              {listing.evModel?.slug && (
                <Link href={`/${locale}/ev/${listing.evModel.slug}`}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                  Specs →
                </Link>
              )}
              <ScamReportButton listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Grid View (Pinterest-style cards) ────────────────────────────────────────

function GridCard({ listing, locale }: { listing: ListingItem; locale: string }) {
  const pt = POWERTRAIN_STYLES[listing.evModel?.powertrain ?? "BEV"] ?? POWERTRAIN_STYLES.BEV;
  const img = getFirstImage(listing);
  const fallback = getBrandFallback(listing);
  const evLabel = `${listing.evModel?.brand ?? listing.evName ?? "EV"} ${listing.evModel?.model ?? ""}`.trim();

  return (
    <div className="group rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
      style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden relative" style={{ background: "#F6F8FF" }}>
        <ListingImage src={img} fallback={fallback} alt={evLabel} />
        {/* Deal badge overlay */}
        {listing.dealGrade && (
          <div className="absolute top-2 left-2">
            <DealGradeBadge grade={listing.dealGrade} />
          </div>
        )}
        {/* Source badge overlay */}
        {listing.source.toUpperCase() !== "MANUAL" && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold backdrop-blur-sm"
              style={{ background: "rgba(255,255,255,0.85)", color: "#64748B" }}>
              {listing.source.toUpperCase() === "PAKWHEELS" ? "PakWheels" : "OLX"}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <Link href={`/${locale}/listings/${listing.id}`}
          className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm line-clamp-1">
          {evLabel}{listing.evModel?.variant ? ` ${listing.evModel.variant}` : ""}
        </Link>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
            style={{ background: pt.bg, color: pt.color, border: `1px solid ${pt.border}` }}>
            {listing.evModel?.powertrain ?? "BEV"}
          </span>
          <span className="text-[10px] text-slate-400">{listing.year}</span>
          <span className="text-[10px] text-slate-400">📍 {listing.city}</span>
        </div>

        {listing.mileage != null && (
          <div className="text-[11px] text-slate-400 mt-1">🛣 {listing.mileage.toLocaleString()} km</div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid #F1F5F9" }}>
          <div className="text-lg font-black"
            style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PKR {(listing.price / 1_000_000).toFixed(2)}M
          </div>
          <WhatsAppButton
            brand={listing.evModel?.brand ?? listing.evName ?? "EV"}
            model={listing.evModel?.model ?? ""}
            year={listing.year}
            price={listing.price}
            city={listing.city}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ListingsView({ initialListings, initialTotal, searchParams }: Props) {
  const locale = useLocale();
  const [listings, setListings] = useState<ListingItem[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialListings.length < initialTotal);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "grid">("grid");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page + 1));
      params.set("limit", "20");
      if (searchParams.city)      params.set("city", searchParams.city);
      if (searchParams.brand)     params.set("brand", searchParams.brand);
      if (searchParams.min_price) params.set("min_price", searchParams.min_price);
      if (searchParams.max_price) params.set("max_price", searchParams.max_price);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();
      const newItems: ListingItem[] = json.data ?? [];

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setListings(prev => [...prev, ...newItems]);
        setPage(p => p + 1);
        setHasMore(listings.length + newItems.length < (json.total ?? initialTotal));
      }
    } catch (err) {
      console.error("[ListingsView] loadMore failed:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, searchParams, listings.length, initialTotal]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex-1 space-y-3">
      {/* View Toggle + Count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">
          {listings.length} of {initialTotal} listing{initialTotal !== 1 ? "s" : ""}
        </span>
        <div className="inline-flex rounded-xl overflow-hidden" style={{ border: "1px solid #E6E9F2" }}>
          <button
            onClick={() => setView("grid")}
            className="px-3 py-1.5 text-xs font-bold transition-colors"
            style={view === "grid"
              ? { background: "#4F46E5", color: "#fff" }
              : { background: "#fff", color: "#64748B" }}>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              Grid
            </span>
          </button>
          <button
            onClick={() => setView("list")}
            className="px-3 py-1.5 text-xs font-bold transition-colors"
            style={view === "list"
              ? { background: "#4F46E5", color: "#fff" }
              : { background: "#fff", color: "#64748B" }}>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              List
            </span>
          </button>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl p-14 text-center"
          style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
          <div className="text-4xl mb-3">🔋</div>
          <p className="text-slate-500">No listings match these filters.</p>
          <Link href={`/${locale}/listings`} className="mt-4 inline-block text-sm text-indigo-600 hover:underline">Clear filters</Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((l) => <GridCard key={l.id} listing={l} locale={locale} />)}
        </div>
      ) : (
        listings.map((l, idx) => <CardView key={l.id} listing={l} idx={idx} locale={locale} />)
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 text-sm text-slate-400">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Loading more listings...
          </div>
        </div>
      )}

      {!hasMore && listings.length > 0 && (
        <div className="text-center py-4 text-xs text-slate-400">
          All {listings.length} listings loaded
        </div>
      )}
    </div>
  );
}
