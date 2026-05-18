// src/app/[locale]/listings/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrackA } from "@/components/TrackLink";
import { getListingTrust, getSourceLabel } from "@/lib/listingTrust";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";

const BRAND_IMAGES: Record<string, string> = {
  BYD:     "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=85",
  MG:      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=85",
  Hyundai: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=85",
  Changan: "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=1200&q=85",
  Deepal:  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85",
  Tesla:   "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=85",
  Honri:   "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=1200&q=85",
  default: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=85",
};

function getBrandImage(brand: string) {
  return BRAND_IMAGES[brand] ?? BRAND_IMAGES.default;
}

function proxyOrFallback(url: string | null | undefined, brand: string): string {
  if (!url) return getBrandImage(brand);
  if (url.startsWith("http") && !url.includes("unsplash")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function getListingImages(listing: { images: string | null; evModel?: { imageUrl: string | null } | null }, brand: string): string[] {
  if (listing.images) {
    try {
      const arr = JSON.parse(listing.images);
      if (Array.isArray(arr) && arr.length > 0) return arr.map((u: string) => proxyOrFallback(u, brand));
    } catch { /* malformed */ }
  }
  const modelImg = listing.evModel?.imageUrl;
  if (modelImg) return [proxyOrFallback(modelImg, brand)];
  return [getBrandImage(brand)];
}

function gradeLabel(h: number | null) {
  if (!h) return null;
  if (h >= 90) return { grade: "A", label: "Excellent", color: "#16A34A" };
  if (h >= 80) return { grade: "B", label: "Good",      color: "#6366F1" };
  if (h >= 70) return { grade: "C", label: "Fair",      color: "#D97706" };
  if (h >= 60) return { grade: "D", label: "Poor",      color: "#EA580C" };
  return             { grade: "F", label: "Replace",    color: "#DC2626" };
}

function normalizeWhatsappNumber(value?: string | null): string {
  const digits = (value ?? "").replace(/\D/g, "");
  if (/^923\d{9}$/.test(digits)) return digits;
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^3\d{9}$/.test(digits)) return `92${digits}`;
  return digits;
}

const DEAL_CFG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  HOT:        { label: "🔥 Hot Deal",   bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  GOOD:       { label: "✅ Good Deal",  bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  FAIR:       { label: "📊 Fair Price", bg: "#EEF2FF", color: "#4F46E5", border: "#C7D2FE" },
  OVERPRICED: { label: "⚠️ Overpriced", bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
};

export async function generateMetadata({ params }: { params: { id: string; locale: string } }): Promise<Metadata> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { evModel: { select: { brand: true, model: true, imageUrl: true } } },
    });
    if (!listing) return {};
    const brand = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "EV";
    const model = listing.evModel?.model ?? listing.evName ?? "Electric Vehicle";
    const title = `${listing.year} ${brand} ${model} for Sale in ${listing.city} — PKR ${(listing.price / 1_000_000).toFixed(2)}M | eWheelz`;
    const desc  = `${listing.year} ${brand} ${model} in ${listing.city}${listing.mileage ? `, ${listing.mileage.toLocaleString()} km` : ""}. PKR ${(listing.price / 1_000_000).toFixed(2)}M. Check battery risk and price fairness on eWheelz.`;

    // Prefer scraped listing image → evModel image → brand fallback (all must be absolute)
    let ogImageUrl = getBrandImage(brand); // always absolute (Unsplash)
    const rawImages: string[] = (() => {
      try { return listing.images ? JSON.parse(listing.images as string) : []; } catch { return []; }
    })();
    if (rawImages.length > 0 && rawImages[0].startsWith("http")) {
      ogImageUrl = `${BASE}/api/image-proxy?url=${encodeURIComponent(rawImages[0])}`;
    } else if (listing.evModel?.imageUrl?.startsWith("http")) {
      ogImageUrl = `${BASE}/api/image-proxy?url=${encodeURIComponent(listing.evModel.imageUrl)}`;
    }

    return {
      title, description: desc,
      openGraph: {
        title, description: desc,
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${listing.year} ${brand} ${model}` }],
        type: "website",
        siteName: "eWheelz",
      },
      twitter: { card: "summary_large_image", title, description: desc, images: [ogImageUrl] },
      alternates: { canonical: `${BASE}/${params.locale}/listings/${params.id}` },
    };
  } catch { return {}; }
}

export default async function ListingDetailPage({ params }: { params: { id: string; locale: string } }) {
  const locale = params.locale;

  let listing: any;
  try {
    listing = await prisma.listing.findFirst({
      where:   { id: params.id, status: "ACTIVE" } as any,
      include: {
        evModel: {
          select: {
            brand: true, model: true, variant: true, slug: true, imageUrl: true,
            specs: { select: { rangeWltp: true } },
          },
        },
      },
    });
  } catch { notFound(); }
  if (!listing) notFound();

  const brand   = listing.evModel?.brand   ?? listing.evName?.split(" ")[0] ?? "EV";
  const model   = listing.evModel?.model   ?? (listing.evName ?? "EV").replace(brand, "").trim();
  const variant = listing.evModel?.variant ?? null;
  const evName  = `${brand} ${model}${variant ? ` ${variant}` : ""}`.trim();
  const evSlug  = listing.evModel?.slug    ?? null;

  const images  = getListingImages(listing, brand);
  const heroImg = images[0];
  const battery = gradeLabel(listing.batteryHealth);
  const dealCfg = listing.dealGrade ? DEAL_CFG[listing.dealGrade] : null;
  const trust = getListingTrust(listing);
  const sourceLabel = getSourceLabel(listing.source);
  const waMsg   = `Hi, I'm interested in your ${evName} (${listing.year}) listed on eWheelz for PKR ${listing.price.toLocaleString()} in ${listing.city}. Is it still available?`;

  // ── Similar listings (same brand, exclude current) ──────────────────────────
  const similar = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      id: { not: listing.id },
      OR: [
        { evModel: { brand } },
        { evName: { contains: brand } },
      ],
    } as any,
    include: { evModel: { select: { brand: true, model: true, imageUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Valuation CTA URL — pre-fills the form
  const valuationUrl = new URLSearchParams();
  if (evSlug)           valuationUrl.set("evSlug",  evSlug);
  if (listing.year)     valuationUrl.set("year",     String(listing.year));
  if (listing.mileage)  valuationUrl.set("odometer", String(listing.mileage));
  if (listing.city)     valuationUrl.set("city",     listing.city);
  valuationUrl.set("price", String(listing.price)); // so the valuation page shows comparison

  // JSON-LD — image must be an absolute URL (Google can't crawl relative/proxy paths)
  const absoluteHeroImg = heroImg.startsWith("/")
    ? `${BASE}${heroImg}`
    : heroImg;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${listing.year} ${evName}`,
    brand: { "@type": "Brand", name: brand },
    model,
    vehicleModelDate: String(listing.year),
    vehicleConfiguration: listing.condition ?? "USED",
    mileageFromOdometer: listing.mileage
      ? { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" }
      : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: `${BASE}/${params.locale}/listings/${params.id}`,
      seller: { "@type": "Organization", name: "eWheelz", url: BASE },
    },
    image: absoluteHeroImg,
    description: listing.description ?? `${listing.year} ${evName} for sale in ${listing.city}, PKR ${(listing.price / 1_000_000).toFixed(2)}M`,
  };

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Full-width hero image ─────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: 380, background: "#0F172A" }}>
        <img src={heroImg} alt={evName} className="w-full h-full object-cover" style={{ opacity: 0.88 }} />
        {/* gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(9,11,30,0.85) 0%, rgba(9,11,30,0.3) 50%, transparent 100%)" }} />

        {/* Top-right battery badge */}
        {battery && (
          <div className="absolute top-5 right-5 rounded-2xl px-4 py-2.5 flex items-center gap-2.5"
            style={{ background: "rgba(9,11,30,0.85)", backdropFilter: "blur(10px)", border: `1px solid ${battery.color}60` }}>
            <span className="font-black text-2xl" style={{ color: battery.color }}>{battery.grade}</span>
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest">Battery signal</div>
              <div className="text-sm text-white font-black">{battery.label}</div>
            </div>
          </div>
        )}

        {/* Top-left deal badge */}
        {dealCfg && (
          <div className="absolute top-5 left-5">
            <span className="text-xs px-3 py-1.5 rounded-full font-black"
              style={{ background: dealCfg.bg, color: dealCfg.color, border: `1px solid ${dealCfg.border}` }}>
              {dealCfg.label}
            </span>
          </div>
        )}

        {/* Bottom-left: title + price */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-1 drop-shadow-lg">
              {listing.year} {evName}
            </h1>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="text-3xl font-black" style={{
                background: "linear-gradient(90deg,#34D399,#60A5FA)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                PKR {(listing.price / 1_000_000).toFixed(2)}M
              </div>
              <div className="text-sm text-slate-300 mb-0.5">📍 {listing.city}</div>
              {images.length > 1 && (
                <div className="text-[11px] px-2 py-0.5 rounded-full mb-0.5"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}>
                  📷 {images.length} photos
                </div>
              )}
              <div className={`mb-0.5 rounded-full border px-2 py-0.5 text-[11px] font-black ${trust.badgeClass}`}>
                {trust.shortLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 mb-6 flex gap-1.5 items-center flex-wrap">
          <Link href={`/${locale}`} className="hover:text-slate-600">Home</Link>
          <span>/</span>
          <Link href={`/${locale}/listings`} className="hover:text-slate-600">Listings</Link>
          <span>/</span>
          <span className="text-slate-600">{brand} {model}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">

            {/* Extra thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.slice(1, 6).map((src, i) => (
                  <div key={i} className="w-28 h-20 rounded-xl overflow-hidden shrink-0"
                    style={{ border: "2px solid #E6E9F2" }}>
                    <img src={src} alt={`${evName} photo ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Key stats grid */}
            <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Listing Details</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: "📅", label: "Year",      val: listing.year },
                  { icon: "🛣",  label: "Mileage",   val: listing.mileage ? `${listing.mileage.toLocaleString()} km` : "Not stated" },
                  { icon: "📍", label: "City",      val: listing.city },
                  { icon: "🏷",  label: "Condition", val: listing.condition ?? "USED" },
                  { icon: "🔋", label: "Battery",   val: battery ? `Signal ${battery.grade} — ${battery.label}` : "Not checked" },
                  { icon: "🌐", label: "Source",    val: listing.source === "MANUAL" ? "Direct" : sourceLabel },
                  { icon: "🛡", label: "Trust",     val: trust.shortLabel },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "#F8FAFF", border: "1px solid #EEF2FF" }}>
                    <div className="text-base mb-1">{icon}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-sm font-black text-slate-800">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">About this listing</div>
                <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Tool CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`/${locale}/battery-health?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
                className="rounded-2xl p-5 flex flex-col gap-2 transition-all hover:scale-[1.02] hover:shadow-md"
                style={{ background: "#F0FDF4", border: "2px solid #86EFAC" }}>
                <span className="text-2xl">🔋</span>
                <div className="text-sm font-black text-green-800">Estimate Battery Risk</div>
                <div className="text-xs text-green-600">Free pre-check before inspection</div>
              </Link>
              <Link
                href={`/${locale}/ev-valuation?${valuationUrl.toString()}`}
                className="rounded-2xl p-5 flex flex-col gap-2 transition-all hover:scale-[1.02] hover:shadow-md"
                style={{ background: "#EEF2FF", border: "2px solid #A5B4FC" }}>
                <span className="text-2xl">💰</span>
                <div className="text-sm font-black text-indigo-800">Is this Price Fair?</div>
                <div className="text-xs text-indigo-500">Compare vs. market instantly</div>
              </Link>
            </div>

            {/* Attribution card */}
            {listing.sourceUrl && (
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: "#F8FAFF", border: "1px solid #E6E9F2" }}>
                <span className="text-2xl flex-shrink-0">🤝</span>
                <div>
                  <div className="text-xs font-black text-slate-700 mb-1">
                    {trust.isSourceOnly ? `Source-only listing from ${sourceLabel}` : `Original source: ${sourceLabel}`}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {trust.isSourceOnly
                      ? "eWheelz has not verified this seller. Use the original post, confirm ownership, and inspect battery health before token or transfer."
                      : "This listing keeps the original source link for reference. Still confirm documents and inspect battery health before token or transfer."}
                  </p>
                  <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    See original post on {sourceLabel} ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4 lg:sticky lg:top-20">

            {/* Contact card */}
            <div className="rounded-2xl p-5" style={{ background: "#0F172A", border: "1px solid #1E293B" }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-2">
                {trust.canContactSeller ? "Contact Seller" : "Source Listing"}
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-slate-400">{trust.description}</p>
              {trust.canContactSeller ? (
                <TrackA
                  href={`https://wa.me/${normalizeWhatsappNumber(listing.contactWhatsapp ?? listing.contactPhone)}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank" rel="noopener noreferrer"
                  event="seller_whatsapp_click"
                  trackProps={{ listing_id: listing.id, brand, model, price: listing.price, city: listing.city, source: "listing_detail" }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#25D366" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Seller
                </TrackA>
              ) : listing.sourceUrl ? (
                <TrackA
                  href={listing.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  event="source_listing_click"
                  trackProps={{ listing_id: listing.id, brand, model, price: listing.price, city: listing.city, source: listing.source }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "#F8FAFC", color: "#334155" }}
                >
                  Open Original Post
                </TrackA>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-slate-400">No direct contact available yet</p>
                </div>
              )}
              <p className="text-[10px] text-slate-500 mt-3 text-center leading-relaxed">
                Meet in public · Never pay in advance · Verify before transfer
              </p>
            </div>

            {/* Similar listings — at eye level */}
            {similar.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #EEF2FF" }}>
                  <div>
                    <div className="text-xs font-black text-slate-800">More {brand} Listings</div>
                    <div className="text-[10px] text-slate-400">{similar.length} similar cars</div>
                  </div>
                  <Link href={`/${locale}/listings?brand=${encodeURIComponent(brand)}`}
                    className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors">
                    View all →
                  </Link>
                </div>

                <div className="divide-y divide-[#F1F5F9]">
                  {similar.slice(0, 5).map((s: any) => {
                    const sBrand   = s.evModel?.brand ?? s.evName?.split(" ")[0] ?? "EV";
                    const sModel   = s.evModel?.model ?? (s.evName ?? "EV").replace(sBrand, "").trim();
                    const sImgSrc  = s.evModel?.imageUrl
                      ? `/api/image-proxy?url=${encodeURIComponent(s.evModel.imageUrl)}`
                      : (BRAND_IMAGES[sBrand] ?? BRAND_IMAGES.default);
                    const sDeal    = s.dealGrade ? DEAL_CFG[s.dealGrade] : null;
                    return (
                      <Link key={s.id} href={`/${locale}/listings/${s.id}`}
                        className="flex gap-3 px-4 py-3 hover:bg-[#F8FAFF] transition-colors group">
                        {/* thumb */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0" style={{ background: "#F6F8FF" }}>
                          <img src={sImgSrc} alt={`${sBrand} ${sModel}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {s.year} {sBrand} {sModel}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">📍 {s.city}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-sm font-black" style={{
                              background: "linear-gradient(135deg,#22C55E,#10B981)",
                              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                              PKR {(s.price / 1_000_000).toFixed(2)}M
                            </div>
                            {sDeal && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                                style={{ background: sDeal.bg, color: sDeal.color }}>
                                {sDeal.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Next car CTA */}
                {similar[0] && (
                  <div className="p-3" style={{ borderTop: "1px solid #EEF2FF" }}>
                    <Link href={`/${locale}/listings/${similar[0].id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
                      Next {brand} →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Safety checklist */}
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
              <div className="text-xs font-black text-slate-700 mb-3">Before you buy</div>
              {[
                "Treat battery signal as estimate until inspection",
                "Check if price is fair vs market",
                "Request OBD-II scan report",
                "Meet at a public location",
              ].map(tip => (
                <div key={tip} className="flex gap-2 mb-2">
                  <span className="text-green-500 text-xs mt-0.5">✓</span>
                  <span className="text-xs text-slate-500">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
