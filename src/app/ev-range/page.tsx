// src/app/ev-range/page.tsx — Range Reality Index (JetBrains-inspired design)
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { estimateRange } from '@/lib/rangeEstimator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EV Range Reality Index Pakistan — Real-World Range Estimates',
  description:
    'Real-world EV range estimates under Pakistani driving conditions. City, motorway, and summer range for every EV available in Pakistan.',
  alternates: { canonical: '/ev-range' },
};

export default async function RangeIndexPage() {
  const evs = await prisma.evModel.findMany({
    where: {},
    include: { specs: true, battery: true },
  });

  const cards = evs
    .filter((ev: any) => ev.specs || ev.battery)
    .map((ev: any) => {
      const batt = ev.battery?.capacityKwh ?? ev.specs?.batteryCapKwh ?? 60;
      const wltp = ev.specs?.rangeWltp ?? ev.specs?.rangeRealWorld ?? 350;
      const est  = estimateRange({ batteryCapacityKwh: batt, wltpRange: wltp });
      return { ev, est };
    });

  const scenarios = [
    { key: 'city',       label: 'City',        icon: '🏙️' },
    { key: 'highway110', label: 'Hwy 110',     icon: '🛣️' },
    { key: 'hotWeather', label: 'Summer 40°C', icon: '☀️' },
  ] as const;

  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* ── Vivid Gradient Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 50%,#8B5CF6 100%)" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.10)", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "20%", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", filter: "blur(50px)", pointerEvents: "none" }} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 relative z-10">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.20)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.30)" }}>
              🇵🇰 Pakistan Edition
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-white leading-tight">
              EV Range Reality Index
            </h1>
            <p className="text-indigo-100 text-lg max-w-2xl mb-8">
              Forget WLTP lab numbers. See how far each EV actually goes on Pakistan&apos;s
              motorways, in Karachi heat, and in Lahore city traffic.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'EV Models',       value: `${cards.length}` },
                { label: 'Drive Scenarios', value: '5' },
                { label: 'Pakistan Cities', value: '5' },
                { label: 'Route Examples',  value: '5' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl px-4 py-3 text-center"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-indigo-100 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── EV Cards ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(({ ev, est }: any) => {
            const name = `${ev.brand} ${ev.model}`;
            const drop = Math.round(((est.wltpRange - est.realWorldEstimate) / est.wltpRange) * 100);

            return (
              <Link key={ev.slug} href={`/ev-range/${ev.slug}`}
                className="group block rounded-2xl overflow-hidden hover-lift"
                style={{ background: "#FFFFFF", border: "1px solid #E6E9F2" }}>

                {/* Card header */}
                <div className="p-5" style={{ background: "linear-gradient(135deg,#FFFFFF,#F6F8FF)" }}>
                  {/* Left accent bar */}
                  <div className="h-1 w-10 rounded-full mb-4"
                    style={{ background: "linear-gradient(90deg,#6366F1,#3B82F6)" }} />

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-xs font-medium">{ev.brand}</p>
                      <h3 className="text-slate-900 font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                        {ev.model}
                        {ev.variant && <span className="text-slate-400 text-sm ml-1">{ev.variant}</span>}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">{ev.year}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black tabular-nums"
                        style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {est.realWorldEstimate}
                      </div>
                      <div className="text-slate-400 text-xs">km est.</div>
                    </div>
                  </div>

                  {/* WLTP vs reality */}
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    <span className="text-slate-400">WLTP {est.wltpRange} km</span>
                    <span className="font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FCD34D" }}>
                      −{drop}% real
                    </span>
                  </div>
                </div>

                {/* Scenario pills */}
                <div className="px-5 py-4 grid grid-cols-3 gap-3" style={{ borderTop: "1px solid #E6E9F2" }}>
                  {scenarios.map(sc => {
                    const s = est.scenarios[sc.key];
                    return (
                      <div key={sc.key} className="text-center">
                        <p className="text-xs text-slate-400 mb-1">{sc.icon} {sc.label}</p>
                        <p className="font-black text-slate-900 text-lg tabular-nums">{s.rangeKm}</p>
                        <p className="text-xs text-slate-400">km</p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex items-center justify-between text-xs"
                  style={{ background: "#F6F8FF", borderTop: "1px solid #E6E9F2" }}>
                  <span className="text-slate-400">
                    {ev.battery?.capacityKwh ?? ev.specs?.batteryCapKwh} kWh battery
                  </span>
                  <span className="font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Full analysis →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* SEO / Explainer section */}
        <div className="mt-14 rounded-2xl p-8"
          style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 8px rgba(99,102,241,0.05)" }}>
          <div className="h-1 w-12 rounded-full mb-5"
            style={{ background: "linear-gradient(90deg,#6366F1,#8B5CF6)" }} />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Why WLTP Range Doesn&apos;t Apply in Pakistan
          </h2>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              WLTP (Worldwide Harmonised Light Vehicle Test Procedure) tests are conducted in
              European laboratories at a controlled 23°C with no air conditioning and at moderate
              speeds. Pakistan&apos;s real-world conditions are dramatically different.
            </p>
            <p>
              In Karachi and Multan, summer temperatures regularly hit 40–45°C, forcing air
              conditioning to run at full blast — consuming an extra 2–4 kWh/hour. On the Lahore–
              Islamabad Motorway, most drivers cruise at 110–130 km/h, where aerodynamic drag
              increases range consumption by 20–40% compared to WLTP test speeds.
            </p>
            <p>
              The eWheelz Range Reality Index applies Pakistan-specific adjustment factors for
              speed, temperature, AC load, and urban traffic to give you accurate, locally relevant
              estimates before you buy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
