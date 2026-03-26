// src/app/ev/[slug]/page.tsx — EV Detail Page (JetBrains-inspired design)
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SaveEVToggle from "@/components/ev/SaveEVToggle";
import AffiliateButton from "@/components/AffiliateButton";
import GetQuoteModal from "@/components/GetQuoteModal";
import NewsletterWidget from "@/components/NewsletterWidget";
import PriceAlertModal from "@/components/PriceAlertModal";

interface Props { params: { slug: string; locale: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await prisma.evModel.findUnique({
    where: { slug: params.slug } as any,
    select: { brand: true, model: true, description: true }
  });
  if (!ev) return { title: "EV Not Found" };
  return {
    title: `${ev.brand} ${ev.model} - Price, Range & Specs in Pakistan | eWheelz`,
    description: ev.description || `Detailed specs, range, and charging info for ${ev.brand} ${ev.model} in Pakistan.`
  };
}

export default async function EvDetailPage({ params }: Props) {
  const [evRaw, session] = await Promise.all([
    prisma.evModel.findUnique({
      where: { slug: params.slug } as any,
      include: {
        specs: true,
        battery: true,
        charging: true,
        affiliateLinks: true,
        reviews: { include: { author: true }, orderBy: { createdAt: "desc" } },
        _count: { select: { reviews: true } }
      } as any
    }),
    getServerSession(authOptions)
  ]);

  if (!evRaw) notFound();
  const ev = evRaw as any;

  let isSaved = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        savedEVs: { 
          where: { id: ev.id },
          select: { id: true } 
        } 
      } as any
    });
    isSaved = ((user as any)?.savedEVs?.length ?? 0) > 0;
  }

  const name = `${ev.brand} ${ev.model} ${ev.variant ?? ""}`.trim();

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>
      {/* ── Visual Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[480px] bg-slate-900 overflow-hidden">
        {ev.imageUrl && (
          <img src={ev.imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">
                    {ev.powertrain}
                  </span>
                  {ev.availableInPk && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-md">
                      Available in PK
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
                    {ev.year} · {ev.bodyType} · {ev.country}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{name}</h1>
                {ev.description && (
                  <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.80)" }}>
                    {ev.description}
                  </p>
                )}
              </div>

              {/* Price & Actions */}
              <div className="shrink-0 text-right">
                {ev.pricePkrMin && (
                  <div className="mb-4">
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>Starting from</div>
                    <div className="text-3xl font-black text-white">
                      PKR {(ev.pricePkrMin / 1_000_000).toFixed(1)}M
                    </div>
                    {ev.pricePkrMax && ev.pricePkrMax !== ev.pricePkrMin && (
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                        up to PKR {(ev.pricePkrMax / 1_000_000).toFixed(1)}M
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {ev.affiliateLinks && ev.affiliateLinks.map((link: any) => (
                    <AffiliateButton 
                      key={link.id}
                      evModelId={ev.id}
                      dealerName={link.dealerName}
                      url={link.url}
                      utmParams={link.utmParams}
                    />
                  ))}
                  <SaveEVToggle evId={ev.id} initialSaved={isSaved} />
                  <Link href={`/${params.locale}/compare?slugs=${ev.slug}`}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md"
                  >
                    ⚖️ Compare
                  </Link>
                </div>
              </div>
            </div>

            {/* At-a-glance raw */}
            {ev.specs && (
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(255,255,255,0.25)" }}>
                {[
                  { icon: "📍", label: "Range WLTP",  value: ev.specs.rangeWltp   ? `${ev.specs.rangeWltp} km`   : "—" },
                  { icon: "🔋", label: "Battery",     value: ev.specs.batteryCapKwh ? `${ev.specs.batteryCapKwh} kWh` : "—" },
                  { icon: "⚡", label: "DC Charge",   value: ev.specs.chargingDcKw  ? `${ev.specs.chargingDcKw} kW`   : "—" },
                  { icon: "🚗", label: "Motor",       value: ev.specs.motorPowerKw  ? `${ev.specs.motorPowerKw} kW`   : "—" },
                  { icon: "⏱", label: "0-100 km/h",  value: ev.specs.accel0100 ? `${ev.specs.accel0100}s` : "—" },
                  { icon: "🔝", label: "Top Speed",   value: ev.specs.topSpeed ? `${ev.specs.topSpeed} km/h` : "—" },
                  { icon: "🏎️", label: "Drive",       value: ev.specs.driveType || "—" },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 backdrop-blur-lg rounded-2xl p-3 border border-white/10">
                    <div className="text-lg mb-1">{s.icon}</div>
                    <div className="text-white font-black text-xs truncate">{s.value}</div>
                    <div className="text-[9px] uppercase tracking-wider font-bold text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Tabs & Details ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            
            {/* Range Analysis */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl">📍</span>
                Range & Efficiency
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">WLTP Cycle</p>
                    <p className="text-3xl font-black text-slate-900">{ev.specs?.rangeWltp || "—"} <span className="text-sm font-normal text-slate-400">km</span></p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }} />
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Real-world Est.</p>
                    <p className="text-3xl font-black text-indigo-600">{ev.specs?.rangeRealWorld || "—"} <span className="text-sm font-normal text-slate-400">km</span></p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${((ev.specs?.rangeRealWorld || 0) / (ev.specs?.rangeWltp || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-center border border-slate-100">
                  <p className="text-sm font-bold text-slate-900 mb-2">💡 Pro Tip</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Real-world range in Pakistan can vary based on AC usage and highway speeds. In summer, expect the &quot;Real-world Est.&quot; to be more accurate.
                  </p>
                </div>
              </div>
            </section>

            {/* Full Specs Table */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 px-2">Technical Specifications</h2>
              <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#E6E9F2]">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <SpecRow label="Powertrain" value={ev.powertrain} />
                    <SpecRow label="Battery Capacity" value={ev.specs?.batteryCapKwh ? `${ev.specs.batteryCapKwh} kWh` : "—"} />
                    <SpecRow label="Battery Type" value={ev.specs?.batteryType || "—"} />
                    <SpecRow label="AC Charging" value={ev.specs?.chargingAcKw ? `${ev.specs.chargingAcKw} kW` : "—"} />
                    <SpecRow label="DC Charging" value={ev.specs?.chargingDcKw ? `${ev.specs.chargingDcKw} kW` : "—"} />
                    <SpecRow label="Max DC Current" value={ev.specs?.chargingDcMaxA ? `${ev.specs.chargingDcMaxA} A` : "—"} />
                    <SpecRow label="Drive" value={ev.specs?.driveType || "—"} />
                    <SpecRow label="Length" value={ev.specs?.lengthMm ? `${ev.specs.lengthMm} mm` : "—"} />
                    <SpecRow label="Width" value={ev.specs?.widthMm ? `${ev.specs.widthMm} mm` : "—"} />
                    <SpecRow label="Height" value={ev.specs?.heightMm ? `${ev.specs.heightMm} mm` : "—"} />
                    <SpecRow label="Wheelbase" value={ev.specs?.wheelbaseMm ? `${ev.specs.wheelbaseMm} mm` : "—"} />
                    <SpecRow label="Turning Circle" value={ev.specs?.turningCircleM ? `${ev.specs.turningCircleM} m` : "—"} />
                    <SpecRow label="Ground Clearance" value={ev.specs?.groundClearanceMm ? `${ev.specs.groundClearanceMm} mm` : "—"} />
                    <SpecRow label="Weight (Unladen)" value={ev.specs?.weightUnladenKg ? `${ev.specs.weightUnladenKg} kg` : "—"} />
                  </tbody>
                </table>
              </div>
            </section>

            {/* Charging Logic */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
              <h2 className="text-2xl font-black text-slate-900 mb-8 px-2">Charging Times</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                 {ev.charging.map((c: any) => (
                   <div key={c.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">{c.type}</span>
                        <span className="text-lg">{c.type === "DC" ? "⚡" : "🔌"}</span>
                     </div>
                     <p className="text-2xl font-black text-slate-900 mb-1">{c.timeStr}</p>
                     <p className="text-xs text-slate-500">{c.powerKw} kW Power · {c.percentageRange}</p>
                   </div>
                 ))}
                 {ev.charging.length === 0 && <p className="text-sm text-slate-400 p-6">No charging data available yet.</p>}
              </div>
            </section>
          </div>

          <div className="space-y-12">
            {/* Reviews Sidebar */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Reviews</h2>
                 <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{ev._count.reviews}</span>
              </div>
              
              <div className="space-y-8">
                {ev.reviews.map((r: any) => (
                  <div key={r.id} className="group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {r.author?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{r.author?.name ?? "Anonymous"}</p>
                        <div className="flex text-[10px] gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      &quot;{r.reviewText ?? r.pros ?? "Great EV!"}&quot;
                    </p>
                  </div>
                ))}
                {ev.reviews.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400 mb-4">No reviews yet. Be the first!</p>
                    <button className="text-xs font-bold text-indigo-600 border border-indigo-100 bg-indigo-50 px-4 py-2 rounded-xl">Write Review</button>
                  </div>
                )}
              </div>
            </section>

            {/* ── Not available in PK banner ───────────────────────────────── */}
            {!ev.availableInPk && (
              <section className="rounded-[28px] p-7 border-2"
                style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", borderColor: "#FCD34D" }}>
                <div className="text-2xl mb-2">🚫</div>
                <h2 className="text-base font-black text-amber-900 mb-1">Not in Pakistan Yet</h2>
                <p className="text-amber-700 text-xs mb-5 leading-relaxed">
                  This EV hasn&apos;t officially launched in Pakistan. Be the first to know when it does.
                </p>
                <PriceAlertModal
                  evModelId={ev.id} evSlug={ev.slug} evName={name}
                  alertType="AVAILABILITY"
                />
              </section>
            )}

            {/* ── Get a Quote CTA ─────────────────────────────────────────── */}
            {ev.availableInPk && (
              <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
                <h2 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">🚗</span> Interested in this EV?
                </h2>
                <p className="text-slate-500 text-xs mb-5 leading-relaxed">
                  Get pricing, availability, and a test drive slot — our team will WhatsApp you within 2 hours.
                </p>
                <GetQuoteModal evModelId={ev.id} evName={name} />
                {ev.pricePkrMin && (
                  <div className="mt-3 flex justify-center">
                    <PriceAlertModal
                      evModelId={ev.id} evSlug={ev.slug} evName={name}
                      currentPricePkr={ev.pricePkrMin}
                      alertType="PRICE_DROP"
                    />
                  </div>
                )}
              </section>
            )}

            {/* ── Newsletter capture ───────────────────────────────────────── */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E9F2]">
              <NewsletterWidget source="ev_detail" variant="footer" />
            </section>

             {/* Battery Tech */}
             <section className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 pointer-events-none">🔋</div>
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                  <span className="text-emerald-400">⚡</span> Battery Tech
                </h2>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-white/10">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Architecture</p>
                    <p className="font-bold">{ev.battery?.packVoltage ? `${ev.battery.packVoltage}V` : "Standard"}</p>
                  </div>
                  <div className="pb-4 border-b border-white/10">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Cooling</p>
                    <p className="font-bold">{ev.battery?.coolingType || "Active Liquid"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Usable Capacity</p>
                    <p className="font-bold text-2xl text-emerald-400">{ev.battery?.usableCapKwh || ev.specs?.batteryCapKwh || "—"} <span className="text-sm font-normal text-white/60">kWh</span></p>
                  </div>
                </div>
             </section>
          </div>

        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <td className="py-4 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">{label}</td>
      <td className="py-4 px-8 text-sm font-bold text-slate-900">{value}</td>
    </tr>
  );
}
