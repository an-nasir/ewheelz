// src/app/ev-range/[slug]/page.tsx
// SEO-first server component — pre-rendered for every EV slug
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { estimateRange, RangeScenario } from '@/lib/rangeEstimator';
import type { Metadata } from 'next';

// ─── Metadata (SEO) ───────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const ev = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    include: { specs: true, battery: true },
  });
  if (!ev) return {};

  const name   = `${ev.brand} ${ev.model}`;
  const batt   = ev.battery?.capacityKwh ?? ev.specs?.batteryCapKwh ?? 60;
  const wltp   = ev.specs?.rangeWltp ?? ev.specs?.rangeRealWorld ?? 350;
  const est    = estimateRange({ batteryCapacityKwh: batt, wltpRange: wltp });
  const city   = est.scenarios.city.rangeKm;
  const hw110  = est.scenarios.highway110.rangeKm;

  return {
    title: `${name} Real Range in Pakistan — City ${city} km & Motorway ${hw110} km`,
    description: `Real-world range for ${name} under Pakistani driving conditions. City: ${city} km, Motorway 110 km/h: ${hw110} km, Summer 40°C: ${est.scenarios.hotWeather.rangeKm} km. Battery: ${batt} kWh. Consumption: ${est.avgConsumptionWhKm} Wh/km.`,
    openGraph: {
      title: `${name} Real Range Pakistan — City vs Motorway`,
      description: `Pakistan-specific range estimates for ${name}. WLTP: ${wltp} km → Real-world: ${est.realWorldEstimate} km.`,
    },
    alternates: { canonical: `/ev-range/${params.slug}` },
  };
}

// ─── Static params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const evs = await prisma.evModel.findMany({ where: {} });
  return evs.map((ev: { slug: string }) => ({ slug: ev.slug }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function RangeBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#E6E9F2" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function ScenarioCard({ s, max }: { s: RangeScenario; max: number }) {
  const pct = s.efficiencyVsWltp;
  const barColor = pct >= 90 ? '#22C55E' : pct >= 75 ? '#F59E0B' : '#F97316';
  const textColor = pct >= 90 ? '#16A34A' : pct >= 75 ? '#B45309' : '#C2410C';
  return (
    <div className="rounded-2xl p-5 transition-all"
      style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl">{s.icon}</span>
          <p className="font-semibold text-slate-800 mt-1 text-sm">{s.label}</p>
          <p className="text-xs text-slate-500">{s.description}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black tabular-nums" style={{ color: "#16A34A" }}>{s.rangeKm}</span>
          <span className="text-sm text-slate-500 ml-1">km</span>
          <p className="text-xs font-semibold mt-0.5" style={{ color: textColor }}>
            {pct}% of WLTP
          </p>
        </div>
      </div>
      <RangeBar value={s.rangeKm} max={max} color={barColor} />
      <p className="text-xs text-slate-500 mt-2">{s.consumptionWhKm} Wh/km</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function RangePage({ params }: { params: { slug: string } }) {
  const ev = await prisma.evModel.findUnique({
    where: { slug: params.slug },
    include: { specs: true, battery: true },
  });
  if (!ev) notFound();

  const batteryKwh = ev.battery?.capacityKwh ?? ev.specs?.batteryCapKwh ?? 60;
  const wltpRange  = ev.specs?.rangeWltp ?? ev.specs?.rangeRealWorld ?? 350;
  const est        = estimateRange({
    batteryCapacityKwh: batteryKwh,
    wltpRange,
    efficiencyWhKm: ev.specs?.efficiencyWhKm ?? undefined,
  });

  const name       = `${ev.brand} ${ev.model}${ev.variant ? ' ' + ev.variant : ''}`;
  const maxRange   = est.scenarios.mildWeather.rangeKm;
  const scenarios  = Object.values(est.scenarios);
  const drop       = Math.round(((wltpRange - est.realWorldEstimate) / wltpRange) * 100);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name,
    brand: { '@type': 'Brand', name: ev.brand },
    vehicleModelDate: ev.year?.toString(),
    fuelType: 'Electric',
    description: `Real-world range of ${name} in Pakistan. City: ${est.scenarios.city.rangeKm} km, Highway 110 km/h: ${est.scenarios.highway110.rangeKm} km.`,
    url: `https://ewheelz.pk/ev-range/${params.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

        {/* ── Vivid Gradient Hero ── */}
        <div style={{ background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 50%,#8B5CF6 100%)" }}>
          <div style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-40px", left: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />

            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-10">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>
                <Link href="/ev-range" className="hover:text-white transition-colors">
                  Range Reality Index
                </Link>
                <span>/</span>
                <span className="text-white">{name}</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                    style={{ background: "rgba(255,255,255,0.20)", border: "1px solid rgba(255,255,255,0.30)" }}>
                    🇵🇰 Pakistan Real-World Data
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-2 text-white">
                    {name}
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    Real Range in Pakistan — City & Motorway
                  </p>
                </div>

                {/* Big stat box */}
                <div className="rounded-2xl px-8 py-5 text-center min-w-[200px]"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Pakistan Est.</p>
                  <div className="text-5xl font-black text-white leading-none">{est.realWorldEstimate}</div>
                  <div className="text-indigo-200 text-sm mt-1">km avg</div>
                  <div className="mt-3 text-xs text-indigo-200">
                    WLTP: {wltpRange} km &nbsp;·&nbsp;
                    <span className="text-amber-300">−{drop}% real-world</span>
                  </div>
                </div>
              </div>

              {/* Quick stats bar */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Battery', value: `${batteryKwh} kWh` },
                  { label: 'Avg consumption', value: `${est.avgConsumptionWhKm} Wh/km` },
                  { label: 'Cost per km', value: `PKR ${est.pkrPerKm}` },
                  { label: 'Usable battery', value: `${est.usableKwh} kWh` },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                    <p className="text-indigo-200 text-xs">{s.label}</p>
                    <p className="text-white font-bold text-sm mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

          {/* ── Range Scenarios ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Range by Driving Condition</h2>
            <p className="text-slate-500 text-sm mb-5">
              Estimated using Pakistan-specific speed, temperature, and AC usage data.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {scenarios.map((s) => (
                <ScenarioCard key={s.label} s={s} max={maxRange} />
              ))}
            </div>
          </section>

          {/* ── WLTP vs Reality ── */}
          <section className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">WLTP vs Pakistan Reality</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Official WLTP</span>
                  <span className="font-bold text-slate-900">{wltpRange} km</span>
                </div>
                <RangeBar value={wltpRange} max={wltpRange} color="#94A3B8" />
              </div>
              {scenarios.map((s) => {
                const barColor = s.efficiencyVsWltp >= 90 ? '#22C55E' : s.efficiencyVsWltp >= 75 ? '#F59E0B' : '#F97316';
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">
                        {s.icon} {s.label}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {s.rangeKm} km
                        <span className="text-xs text-slate-400 ml-1">({s.efficiencyVsWltp}%)</span>
                      </span>
                    </div>
                    <RangeBar value={s.rangeKm} max={wltpRange} color={barColor} />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-4 rounded-xl text-sm" style={{ background: "#FFFBEB", border: "1px solid #FCD34D" }}>
              <strong className="text-amber-800">Why the gap?</strong>
              <span className="text-amber-700"> WLTP tests are done in European lab conditions at 23°C with no AC and at moderate 90 km/h speeds. Pakistan&apos;s hot summers, fast motorways, and stop-and-go city traffic all cut into real-world range.</span>
            </div>
          </section>

          {/* ── City Range Profiles ── */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Range by Pakistani City</h2>
            <p className="text-slate-500 text-sm mb-5">
              City driving estimates adjusted for local temperature and traffic patterns.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {est.cityProfiles.map((c) => (
                <div
                  key={c.city}
                  className="rounded-2xl p-5 transition-all"
                  style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800">{c.city}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                      style={{ background: "#F6F8FF", border: "1px solid #E6E9F2" }}>
                      {c.avgTempC}°C avg
                    </span>
                  </div>
                  <div className="text-3xl font-black mb-1" style={{ color: "#16A34A" }}>
                    {c.estimatedRangeKm}
                    <span className="text-base font-normal text-slate-500 ml-1">km</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-tight">{c.conditions}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Trip Examples ── */}
          <section className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #E6E9F2" }}>
              <h2 className="text-lg font-bold text-slate-900">Pakistan Route Analysis</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Based on highway 110 km/h range of {est.scenarios.highway110.rangeKm} km
              </p>
            </div>
            <div>
              {est.tripExamples.map((t, i) => (
                <div key={`${t.from}-${t.to}`}
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: i < est.tripExamples.length - 1 ? "1px solid #E6E9F2" : "none" }}>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">
                      {t.from} → {t.to}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.distanceKm} km</div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{t.batteryNeededPct}%</div>
                      <div className="text-xs text-slate-400">battery</div>
                    </div>

                    {t.canReach ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "#F0FDF4", color: "#16A34A", border: "1px solid #86EFAC" }}>
                        ✓ Non-stop
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA" }}>
                        {t.chargeStopsNeeded} charge stop{t.chargeStopsNeeded > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/trip-planner"
              className="rounded-2xl p-5 flex items-center gap-4 transition-colors font-bold text-white"
              style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}
            >
              <span className="text-3xl">🗺️</span>
              <div>
                <div className="font-bold">Plan a Trip</div>
                <div className="text-sm text-green-100">Route planner with charge stops</div>
              </div>
            </Link>
            <Link
              href="/cost-calculator"
              className="rounded-2xl p-5 flex items-center gap-4 transition-all"
              style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}
            >
              <span className="text-3xl">💰</span>
              <div>
                <div className="font-bold text-slate-800">Cost Calculator</div>
                <div className="text-slate-500 text-sm">EV vs petrol savings</div>
              </div>
            </Link>
            <Link
              href={`/ev/${params.slug}`}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all"
              style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}
            >
              <span className="text-3xl">📋</span>
              <div>
                <div className="font-bold text-slate-800">Full Specs</div>
                <div className="text-slate-500 text-sm">Complete {name} specs</div>
              </div>
            </Link>
          </div>

          {/* ── Methodology note ── */}
          <section className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>
            <h3 className="font-bold text-slate-900 mb-2">About This Data</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Range estimates are calculated using real-world adjustment factors derived from
              Pakistan-specific conditions: speed (aerodynamic drag scales with v²), ambient
              temperature (battery chemistry and AC load), and urban traffic patterns. WLTP figures
              are manufacturer-published. Actual range varies by driver behaviour, tyre pressure,
              payload, and road gradient. Always keep a 15–20% battery reserve for safety.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
