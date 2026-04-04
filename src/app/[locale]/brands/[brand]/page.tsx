// src/app/[locale]/brands/[brand]/page.tsx
// Brand landing pages — rank for "BYD price in Pakistan", "MG ZS EV Pakistan" etc.
// URL: /brands/byd  /brands/mg  /brands/hyundai

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ewheelz.pk";

const BRAND_META: Record<string, { displayName: string; tagline: string; imgUrl: string }> = {
  byd:     { displayName: "BYD",     tagline: "Build Your Dreams — China's #1 EV brand, now in Pakistan", imgUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80" },
  mg:      { displayName: "MG",      tagline: "British heritage, electric future — MG EVs in Pakistan",   imgUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=80" },
  hyundai: { displayName: "Hyundai", tagline: "IONIQ series — Korea's best EVs available in Pakistan",    imgUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=80" },
  changan: { displayName: "Changan", tagline: "Affordable Chinese EVs — Changan electric cars Pakistan",  imgUrl: "https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=1200&q=80" },
  deepal:  { displayName: "Deepal",  tagline: "Deepal S07 & L07 — long-range EVs for Pakistan highways", imgUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=80" },
  tesla:   { displayName: "Tesla",   tagline: "Tesla Model 3 & Y — premium EVs in Pakistan",             imgUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&q=80" },
  xpeng:   { displayName: "Xpeng",   tagline: "Xpeng G6 & G9 — smart EVs with XNGP autopilot",          imgUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=80" },
};

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const meta = BRAND_META[params.brand.toLowerCase()];
  if (!meta) return {};
  const title = `${meta.displayName} Electric Car Price in Pakistan 2026 — Used & New | eWheelz`;
  const desc  = `Buy or sell used ${meta.displayName} electric cars in Pakistan. Check latest prices, battery health grades, and real market data on eWheelz.`;
  return {
    title,
    description: desc,
    openGraph: { title, description: desc, images: [{ url: meta.imgUrl }] },
    alternates: { canonical: `${BASE}/en/brands/${params.brand}` },
  };
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const slug = params.brand.toLowerCase();
  const meta = BRAND_META[slug];
  if (!meta) notFound();

  const [listings, models, stats] = await Promise.all([
    prisma.listing.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { evModel: { brand: { equals: meta.displayName } } } as any,
          { evName: { contains: meta.displayName } },
        ],
      } as any,
      include: { evModel: { select: { brand: true, model: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.evModel.findMany({
      where: { brand: meta.displayName, availableInPk: true },
      select: { slug: true, model: true, variant: true, pricePkrMin: true, pricePkrMax: true, specs: { select: { rangeWltp: true } } },
      take: 6,
    }),
    prisma.listing.aggregate({
      where: { status: "ACTIVE", evName: { contains: meta.displayName } } as any,
      _count: true,
      _avg: { price: true },
      _min: { price: true },
    }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${meta.displayName} Electric Cars for Sale in Pakistan`,
    description: meta.tagline,
    numberOfItems: stats._count,
  };

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero banner */}
      <div style={{
        backgroundImage: `url(${meta.imgUrl})`,
        backgroundSize: "cover", backgroundPosition: "center 40%",
        position: "relative", minHeight: 220,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(9,11,30,0.95) 0%, rgba(15,23,42,0.80) 50%, rgba(15,23,42,0.4) 100%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <nav className="text-xs text-slate-400 mb-4 flex gap-1.5">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-slate-300">Listings</Link>
            <span>/</span>
            <span className="text-slate-300">{meta.displayName}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            {meta.displayName} Electric Car Price in Pakistan 2026
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">{meta.tagline}</p>
          <div className="flex gap-6 mt-5">
            {[
              { val: stats._count, label: "Active Listings" },
              { val: stats._avg.price ? `PKR ${(stats._avg.price / 1_000_000).toFixed(1)}M` : "—", label: "Avg Price" },
              { val: stats._min.price ? `PKR ${(stats._min.price / 1_000_000).toFixed(1)}M` : "—", label: "Starting From" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-xl font-black text-white">{val}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* EV Models in Pakistan */}
        {models.length > 0 && (
          <section>
            <h2 className="text-lg font-black text-slate-900 mb-4">{meta.displayName} Models Available in Pakistan</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {models.map(m => (
                <Link key={m.slug} href={`/ev/${m.slug}` as any}
                  className="rounded-2xl p-4 block hover:scale-[1.02] transition-all"
                  style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                  <div className="font-black text-slate-900 mb-1">{m.model} {m.variant}</div>
                  {m.pricePkrMin && (
                    <div className="text-sm font-bold text-indigo-600">
                      PKR {(m.pricePkrMin / 1_000_000).toFixed(1)}M
                      {m.pricePkrMax ? ` – ${(m.pricePkrMax / 1_000_000).toFixed(1)}M` : "+"}
                    </div>
                  )}
                  {m.specs?.rangeWltp && <div className="text-xs text-slate-400 mt-1">Range: {m.specs.rangeWltp} km WLTP</div>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Used listings */}
        {listings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">Used {meta.displayName} EVs for Sale</h2>
              <Link href={`/listings?brand=${meta.displayName}` as any} className="text-sm font-bold text-indigo-600">View all →</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(listings as any[]).map((l: any) => {
                const evName = `${l.evModel?.brand ?? meta.displayName} ${l.evModel?.model ?? ""}`.trim();
                return (
                  <Link key={l.id} href={`/listings/${l.id}` as any}
                    className="rounded-2xl overflow-hidden hover:shadow-lg transition-all block"
                    style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                    <div style={{ height: 120, backgroundImage: `url(${meta.imgUrl})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 55%)" }} />
                      <div className="absolute bottom-2 left-3 text-sm font-black"
                        style={{ background: "linear-gradient(90deg,#34D399,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        PKR {(l.price / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-black text-slate-900 text-xs leading-tight mb-1">{evName}</div>
                      <div className="text-[10px] text-slate-400">{l.year} · {l.city}{l.mileage ? ` · ${l.mileage.toLocaleString()}km` : ""}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* FAQ — schema-optimised for Google */}
        <section>
          <h2 className="text-lg font-black text-slate-900 mb-4">{meta.displayName} EV FAQ — Pakistan</h2>
          <div className="space-y-3">
            {[
              { q: `What is the price of ${meta.displayName} electric car in Pakistan?`, a: stats._min.price ? `Used ${meta.displayName} EVs start from PKR ${(stats._min.price / 1_000_000).toFixed(1)}M on eWheelz. New ${meta.displayName} models range from PKR ${(stats._min.price / 1_000_000).toFixed(1)}M to ${((stats._avg.price ?? stats._min.price * 1.5) / 1_000_000).toFixed(1)}M depending on variant.` : `Check current listings on eWheelz for the latest ${meta.displayName} prices in Pakistan.` },
              { q: `Is ${meta.displayName} EV available in Pakistan?`, a: `Yes. ${meta.displayName} electric vehicles are officially available in Pakistan through authorised dealers. Used ${meta.displayName} EVs are also available on eWheelz with battery health grades on every listing.` },
              { q: `How do I check battery health of a used ${meta.displayName}?`, a: `Use eWheelz Battery Health Check — enter the car details and odometer reading to get an A–F grade in 30 seconds. Always ask the seller for current range on a full charge before buying.` },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="font-black text-slate-900 text-sm mb-1">{q}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
