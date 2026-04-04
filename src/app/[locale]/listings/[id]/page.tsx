// src/app/[locale]/listings/[id]/page.tsx
// Individual listing detail page — each listing is a unique indexed URL.
// Google indexes: "2023 BYD Atto 3 for sale in Lahore PKR 8.5M"

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/navigation";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";

const BRAND_IMAGES: Record<string, string> = {
  BYD:     "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80",
  MG:      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
  Hyundai: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
  Changan: "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=800&q=80",
  Deepal:  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
  default: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
};

function gradeLabel(h: number | null) {
  if (!h) return null;
  if (h >= 90) return { grade: "A", label: "Excellent", color: "#16A34A" };
  if (h >= 80) return { grade: "B", label: "Good",      color: "#6366F1" };
  if (h >= 70) return { grade: "C", label: "Fair",      color: "#D97706" };
  if (h >= 60) return { grade: "D", label: "Poor",      color: "#EA580C" };
  return                { grade: "F", label: "Replace",  color: "#DC2626" };
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  let listing: any;
  try {
    listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { evModel: { select: { brand: true, model: true } } },
    });
  } catch { return {}; }

  if (!listing) return {};

  const brand = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "EV";
  const model = listing.evModel?.model ?? listing.evName ?? "Electric Vehicle";
  const title = `${listing.year} ${brand} ${model} for Sale in ${listing.city} — PKR ${(listing.price / 1_000_000).toFixed(2)}M | eWheelz`;
  const desc  = `Used ${listing.year} ${brand} ${model} in ${listing.city}${listing.mileage ? `, ${listing.mileage.toLocaleString()} km` : ""}. PKR ${(listing.price / 1_000_000).toFixed(2)}M. Verified listing on eWheelz — Pakistan's EV marketplace.`;
  const imgUrl = BRAND_IMAGES[brand] ?? BRAND_IMAGES.default;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: imgUrl, width: 800, height: 500 }],
      type: "website",
    },
    alternates: { canonical: `${BASE}/en/listings/${params.id}` },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ListingDetailPage(
  { params }: { params: { id: string } }
) {
  let listing: any;
  try {
    listing = await prisma.listing.findUnique({
      where: { id: params.id, status: "ACTIVE" } as any,
      include: { evModel: { select: { brand: true, model: true, specs: { select: { rangeWltp: true } } } } },
    });
  } catch { notFound(); }

  if (!listing) notFound();

  const brand   = listing.evModel?.brand ?? listing.evName?.split(" ")[0] ?? "EV";
  const model   = listing.evModel?.model ?? (listing.evName ?? "Electric Vehicle").replace(brand, "").trim();
  const evName  = `${brand} ${model}`.trim();
  const imgUrl  = BRAND_IMAGES[brand] ?? BRAND_IMAGES.default;
  const battery = gradeLabel(listing.batteryHealth);
  const waMsg   = `Hi, I'm interested in your ${evName} (${listing.year}) listed on eWheelz for PKR ${listing.price.toLocaleString()} in ${listing.city}. Is it still available?`;

  // JSON-LD Vehicle schema — Google rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: `${listing.year} ${evName}`,
    brand: { "@type": "Brand", name: brand },
    model,
    vehicleModelDate: String(listing.year),
    mileageFromOdometer: listing.mileage ? { "@type": "QuantitativeValue", value: listing.mileage, unitCode: "KMT" } : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Person", name: listing.contactName ?? "Seller" },
    },
    description: listing.description ?? `${listing.year} ${evName} for sale in ${listing.city}, Pakistan.`,
    image: imgUrl,
  };

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 mb-5 flex gap-1.5 items-center">
          <Link href="/" className="hover:text-slate-600">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-slate-600">Listings</Link>
          <span>/</span>
          <span className="text-slate-600">{evName}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* ── Left: image + details ── */}
          <div>
            {/* Image */}
            <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ height: 280, backgroundImage: `url(${imgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 60%)" }} />
              {battery && (
                <div className="absolute top-4 right-4 rounded-xl px-3 py-2 flex items-center gap-2"
                  style={{ background: "rgba(15,23,42,0.88)", backdropFilter: "blur(8px)", border: `1px solid ${battery.color}55` }}>
                  <span className="font-black text-lg" style={{ color: battery.color }}>{battery.grade}</span>
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">Battery</div>
                    <div className="text-xs text-white font-bold">{battery.label}</div>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <div className="text-2xl font-black" style={{ background: "linear-gradient(90deg,#34D399,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  PKR {(listing.price / 1_000_000).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black text-slate-900 mb-1">{listing.year} {evName} for Sale in {listing.city}</h1>
            <p className="text-sm text-slate-500 mb-5">Listed on eWheelz · Pakistan&apos;s Verified EV Marketplace</p>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Year",     val: listing.year },
                { label: "Mileage",  val: listing.mileage ? `${listing.mileage.toLocaleString()} km` : "—" },
                { label: "City",     val: listing.city },
                { label: "Condition",val: listing.condition ?? "USED" },
                { label: "Battery",  val: battery ? `Grade ${battery.grade} · ${battery.label}` : "Not specified" },
                { label: "Source",   val: listing.source ?? "MANUAL" },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                  <div className="text-sm font-black text-slate-800">{val}</div>
                </div>
              ))}
            </div>

            {listing.description && (
              <div className="rounded-xl p-4 mb-5" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description</div>
                <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Tool CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <a href={`/battery-health?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}`}
                className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
                style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                <div className="text-xl mb-1">🔋</div>
                <div className="text-xs font-black text-green-700">Check Battery Health</div>
              </a>
              <a href={`/ev-valuation?evName=${encodeURIComponent(evName)}&year=${listing.year}&odometer=${listing.mileage ?? 0}&price=${listing.price}`}
                className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
                style={{ background: "#EEF2FF", border: "1px solid #A5B4FC" }}>
                <div className="text-xl mb-1">💰</div>
                <div className="text-xs font-black text-indigo-700">Is the Price Fair?</div>
              </a>
            </div>
          </div>

          {/* ── Right: contact + related ── */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className="rounded-2xl p-5" style={{ background: "#0F172A", border: "1px solid #1E293B" }}>
              <div className="text-xs font-black uppercase tracking-widest text-green-400 mb-3">Contact Seller</div>
              {listing.contactWhatsapp || listing.contactPhone ? (
                <a href={`https://wa.me/${(listing.contactWhatsapp ?? listing.contactPhone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                  style={{ background: "#25D366" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Seller
                </a>
              ) : (
                <p className="text-xs text-slate-400">Contact via eWheelz — details on request</p>
              )}
              <p className="text-[10px] text-slate-500 mt-3 text-center">Always meet in a public place · Never pay in advance</p>
            </div>

            {/* Safety tips */}
            <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
              <div className="text-xs font-black text-slate-700 mb-3">Before you buy</div>
              {[
                "Verify battery health via our free tool",
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

            <Link href="/listings"
              className="block text-center py-3 rounded-xl text-xs font-black transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }}>
              Browse More {brand} Listings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
