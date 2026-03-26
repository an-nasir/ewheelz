import {getTranslations} from 'next-intl/server';
import { prisma } from "@/lib/prisma";
import {Link} from "@/navigation";
import { EvModel, ChargingStation } from "@/types";
import EvIntelligenceToday from "@/components/EvIntelligenceToday";
import AnimatedHero from "@/components/AnimatedHero";
import GradientCard from "@/components/GradientCard";

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'home'});
  return {
    title: t('title'),
    description: t('description')
  };
}

function getSpecs(ev: EvModel) {
  return (ev.specs ?? {}) as Record<string, number | null>;
}

/* ── EV car silhouette SVG ── */
function EvSilhouette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 12 62 L 12 50 L 35 50 L 65 24 L 148 22 L 172 40 L 206 44 L 210 62 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 68 48 L 82 28 L 128 25 L 145 44 Z" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <line x1="108" y1="25" x2="112" y2="60" stroke="rgba(255,255,255,0.20)" strokeWidth="1" />
      <rect x="204" y="44" width="5" height="14" rx="2" fill="rgba(255,255,255,0.50)" />
      <rect x="12" y="50" width="6" height="8" rx="1.5" fill="rgba(255,255,255,0.45)" />
      <circle cx="62"  cy="66" r="16" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <circle cx="62"  cy="66" r="8"  fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <circle cx="162" cy="66" r="16" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <circle cx="162" cy="66" r="8"  fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <ellipse cx="112" cy="83" rx="95" ry="5" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

function InsightCard({
  emoji, rank, label, model, value, unit, href, gradient, shadow,
}: {
  emoji: string; rank: string; label: string;
  model: string; value: string; unit: string;
  href: string; gradient: string; shadow: string;
}) {
  return (
    <Link href={href as any} className="group block">
      <div
        className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{ background: gradient, boxShadow: shadow, minHeight: "200px" }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-full opacity-30 pointer-events-none translate-y-1">
          <EvSilhouette className="w-full h-auto" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-2xl drop-shadow">{emoji}</span>
            <span className="text-[10px] font-bold bg-white/25 backdrop-blur-sm text-white px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/20">
              {rank}
            </span>
          </div>
          <div className="text-white/70 text-xs uppercase tracking-wider mb-1 font-semibold">{label}</div>
          <div className="text-white font-bold text-base mb-3 group-hover:underline decoration-white/40 leading-snug">{model}</div>
          <div className="text-white font-black text-5xl tabular-nums leading-none">
            {value}
            <span className="text-xl font-medium text-white/70 ml-2">{unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ToolCard({ href, icon, title, desc, badge, cta, accentColor }: {
  href: string; icon: string; title: string;
  desc: string; badge?: string; cta: string;
  accentColor: string;
}) {
  return (
    <GradientCard href={href} className="group h-full" glowColor={accentColor}>
      <Link href={href as any} className="flex flex-col h-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${accentColor.replace(/[\d.]+\)$/, "0.12)")}`, border: `1px solid ${accentColor.replace(/[\d.]+\)$/, "0.25)")}` }}>{icon}</div>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: `${accentColor.replace(/[\d.]+\)$/, "0.10)")}`, color: accentColor.replace("rgba", "rgb").replace(/,\s*[\d.]+\)$/, ")"), border: `1px solid ${accentColor.replace(/[\d.]+\)$/, "0.25)")}` }}>{badge}</span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-base mb-2 group-hover:text-brand-600 transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
        <div className="mt-4 text-sm font-semibold text-brand-500 group-hover:text-brand-600 flex items-center gap-1 transition-colors">
          {cta}
          <span className="transition-transform group-hover:translate-x-1 duration-200">→</span>
        </div>
      </Link>
    </GradientCard>
  );
}

export default async function HomePage({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'home'});
  const tc = await getTranslations({locale, namespace: 'common'});

  const allEvs = (await prisma.evModel.findMany({
    orderBy: { brand: "asc" },
    include: { specs: true },
  })) as unknown as EvModel[];

  const stations = ((await prisma.chargingStation.findMany({})) as unknown) as ChargingStation[];

  const evWithRange   = [...allEvs].filter((ev) => (getSpecs(ev).rangeRealWorld ?? 0) > 0);
  const evWithBattery = [...allEvs].filter((ev) => (getSpecs(ev).batteryCapKwh  ?? 0) > 0);
  const evWithDc      = [...allEvs].filter((ev) => (getSpecs(ev).chargingDcKw   ?? 0) > 0);

  const longestRange    = evWithRange.sort(   (a, b) => (getSpecs(b).rangeRealWorld ?? 0) - (getSpecs(a).rangeRealWorld ?? 0))[0];
  const biggestBattery  = evWithBattery.sort( (a, b) => (getSpecs(b).batteryCapKwh  ?? 0) - (getSpecs(a).batteryCapKwh  ?? 0))[0];
  const fastestCharging = evWithDc.sort(      (a, b) => (getSpecs(b).chargingDcKw   ?? 0) - (getSpecs(a).chargingDcKw   ?? 0))[0];

  const evCount = allEvs.length || 17;
  const stCount = stations.length || 20;

  const heroStats = [
    { value: String(evCount),  label: tc('evDatabase'),   gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { value: String(stCount),  label: tc('chargingStations'),       gradient: "linear-gradient(135deg,#22C55E,#10B981)" },
    { value: "4",              label: t('chemistries'),    gradient: "linear-gradient(135deg,#3B82F6,#6366F1)" },
  ];

  return (
    <div className="bg-[#F6F8FF]">
      <AnimatedHero stats={heroStats} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="neon-badge mb-3">🏆 {t('recordsTitle')}</div>
            <h2 className="text-3xl font-bold text-slate-900">{t('topPerformers')}</h2>
          </div>
          <Link href="/ev" className="text-sm text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1 transition-colors">
            {t('fullDatabase')} <span className="transition-transform hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {longestRange && (
            <InsightCard emoji="🏆" rank={t('rankRange')} label={t('labelRange')}
              model={`${longestRange.brand} ${longestRange.model}`}
              value={String(getSpecs(longestRange).rangeRealWorld ?? "—")} unit="km"
              href={`/ev/${longestRange.slug}`}
              gradient="linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)"
              shadow="0 8px 32px rgba(99,102,241,0.28)" />
          )}
          {biggestBattery && (
            <InsightCard emoji="🔋" rank={t('rankBattery')} label={t('labelBattery')}
              model={`${biggestBattery.brand} ${biggestBattery.model}`}
              value={String(getSpecs(biggestBattery).batteryCapKwh ?? "—")} unit="kWh"
              href={`/ev/${biggestBattery.slug}`}
              gradient="linear-gradient(135deg,#22C55E 0%,#10B981 100%)"
              shadow="0 8px 32px rgba(34,197,94,0.28)" />
          )}
          {fastestCharging && (
            <InsightCard emoji="⚡" rank={t('rankCharging')} label={t('labelCharging')}
              model={`${fastestCharging.brand} ${fastestCharging.model}`}
              value={String(getSpecs(fastestCharging).chargingDcKw ?? "—")} unit="kW"
              href={`/ev/${fastestCharging.slug}`}
              gradient="linear-gradient(135deg,#3B82F6 0%,#6366F1 100%)"
              shadow="0 8px 32px rgba(59,130,246,0.28)" />
          )}
        </div>
      </section>

      <section className="py-16 border-y border-[#E6E9F2]" style={{ background: "linear-gradient(180deg,#EEF2FF 0%,#F6F8FF 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="neon-badge mb-4">⚡ {tc('tools')}</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t('moreThanListings')}</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">{t('platformDesc')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ToolCard href="/trip-planner" icon="🗺️" title={tc('tripPlanner')} badge="New" desc={tc('tripPlannerDesc')} cta={t('planTrip')} accentColor="rgba(99,102,241,1)" />
            <ToolCard href="/cost-calculator" icon="💰" title={tc('costCalculator')} desc={tc('costCalculatorDesc')} cta={t('calculate')} accentColor="rgba(34,197,94,1)" />
            <ToolCard href="/compare" icon="⚖️" title={tc('compare')} desc={tc('compareDesc')} cta={t('compareCta')} accentColor="rgba(59,130,246,1)" />
            <ToolCard href="/emi-calculator" icon="🏦" title={tc('emiCalculator')} badge="New" desc={tc('emiCalculatorDesc')} cta={t('calculateEmi')} accentColor="rgba(245,158,11,1)" />
            <ToolCard href="/home-charging" icon="🔌" title={tc('homeCharging')} badge="New" desc={tc('homeChargingDesc')} cta={t('readGuide')} accentColor="rgba(59,130,246,1)" />
            <ToolCard href="/charging-map" icon="📍" title={tc('chargingStations')} desc={tc('chargingStationsDesc')} cta={t('openMap')} accentColor="rgba(34,197,94,1)" />
          </div>
        </div>
      </section>

      <div style={{ background: "linear-gradient(180deg,#F6F8FF 0%,#EEF2FF 30%,#F6F8FF 100%)" }}>
        <EvIntelligenceToday />
      </div>
    </div>
  );
}
