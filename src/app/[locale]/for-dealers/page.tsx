// src/app/[locale]/for-dealers/page.tsx — Dealer acquisition landing page
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For EV Dealers — List Your Inventory on eWheelz",
  description: "Reach Pakistan's largest EV audience. Get qualified leads, showcase your inventory, and grow your EV dealership with eWheelz.",
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    period: "forever",
    badge: null,
    color: "#6366F1",
    gradient: "linear-gradient(135deg,#EEF2FF,#F5F3FF)",
    border: "#C7D2FE",
    features: [
      "3 active listings",
      "WhatsApp lead button",
      "Basic dealer profile",
      "eWheelz directory listing",
    ],
    cta: "Get Started Free",
    ctaStyle: { background: "transparent", border: "2px solid #6366F1", color: "#6366F1" },
  },
  {
    id: "pro",
    name: "Pro Dealer",
    price: "PKR 4,000",
    period: "/month",
    badge: "Most Popular",
    color: "#6366F1",
    gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    border: "#6366F1",
    features: [
      "Unlimited listings",
      "Priority in search results",
      "Real-time lead notifications",
      "Phone + WhatsApp leads",
      "Battery health badge",
      "Monthly analytics report",
      "Dedicated account manager",
    ],
    cta: "Start 14-Day Free Trial",
    ctaStyle: { background: "#fff", color: "#6366F1", border: "none" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    badge: "Multi-location",
    color: "#0D9488",
    gradient: "linear-gradient(135deg,#F0FDFA,#ECFDF5)",
    border: "#99F6E4",
    features: [
      "Everything in Pro",
      "Multiple branch locations",
      "Custom branded landing page",
      "API access for inventory sync",
      "Co-branded content placement",
      "White-glove onboarding",
    ],
    cta: "Contact Sales",
    ctaStyle: { background: "transparent", border: "2px solid #0D9488", color: "#0D9488" },
  },
];

const BENEFITS = [
  { icon: "👥", title: "10,000+ Monthly EV Buyers", desc: "Pakistan's most focused EV audience — already comparing, already deciding." },
  { icon: "📱", title: "WhatsApp-First Leads", desc: "Buyers connect directly via WhatsApp. No cold calls, no middleman." },
  { icon: "⚡", title: "EV-Only Platform", desc: "100% relevant traffic. Every visitor is an EV buyer — not someone looking for a petrol car." },
  { icon: "📊", title: "Real Buyer Intent Data", desc: "See what EVs your leads compared, what budget they used in our EMI calculator." },
  { icon: "🔔", title: "Price Alert Network", desc: "2,000+ buyers with active price alerts — you reach them the moment price changes." },
  { icon: "🌐", title: "Urdu + English", desc: "Reach all of Pakistan — Karachi, Lahore, Islamabad, and Tier-2 cities too." },
];

const FAQS = [
  { q: "Do I need to sign a contract?", a: "No. Pro plan is month-to-month. Cancel any time with no penalties." },
  { q: "How fast do I get leads?", a: "Leads come in real-time via WhatsApp and email the moment a buyer clicks your listing." },
  { q: "Is my inventory automatically synced?", a: "Enterprise plan includes API sync. For Starter/Pro, you manage listings manually via our simple dashboard." },
  { q: "Can I list certified pre-owned EVs?", a: "Yes. You can mark listings as New, Used, or Certified Pre-Owned. CPO listings get a trust badge." },
  { q: "What cities are covered?", a: "All of Pakistan. We have visitors from Karachi, Lahore, Islamabad, Rawalpindi, Multan, Faisalabad, and 200+ other cities." },
];

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923001234567";

export default function ForDealersPage() {
  return (
    <div className="bg-[#F6F8FF]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="text-white py-20 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#312E81 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#6366F1,transparent)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#22C55E,transparent)", transform: "translate(-30%,30%)" }} />
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            ⚡ For EV Dealers & Importers
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
            Pakistan&apos;s EV buyers<br/>
            <span style={{ background: "linear-gradient(135deg,#A5B4FC,#22C55E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              are already here.
            </span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mb-8 leading-relaxed">
            10,000+ qualified EV buyers visit eWheelz every month. They compare specs, calculate EMIs, and set price alerts.
            Put your inventory in front of them.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="#plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-indigo-900 bg-white hover:bg-white/90 transition-all shadow-lg">
              View Dealer Plans →
            </Link>
            <a href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi, I'd like to list my EV dealership on eWheelz")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white border border-white/30 hover:bg-white/10 transition-all">
              💬 WhatsApp Us
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-14 pt-10 border-t border-white/10">
            {[
              { value: "10K+", label: "Monthly EV Buyers" },
              { value: "17+",  label: "EVs in Database" },
              { value: "2K+",  label: "Active Price Alerts" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-white/50 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Why eWheelz
          </div>
          <h2 className="text-3xl font-black text-slate-900">Built for Pakistan&apos;s EV market</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-white rounded-2xl border border-[#E6E9F2] p-5 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{b.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Plans ────────────────────────────────────────────────── */}
      <section id="plans" className="py-16 px-4 border-y border-[#E6E9F2]"
        style={{ background: "linear-gradient(180deg,#EEF2FF,#F6F8FF)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-500">No setup fees. No hidden charges. Cancel any time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => {
              const isPro = plan.id === "pro";
              return (
                <div key={plan.id}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${isPro ? "scale-105 shadow-2xl" : "hover:shadow-md"}`}
                  style={{ borderColor: plan.border, background: isPro ? plan.gradient : "#FFFFFF" }}>

                  {/* Badge */}
                  {plan.badge && (
                    <div className={`text-center py-1.5 text-[11px] font-black uppercase tracking-widest ${isPro ? "bg-white/20 text-white" : "bg-teal-50 text-teal-700"}`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-6">
                    <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPro ? "text-white/70" : "text-slate-400"}`}>
                      {plan.name}
                    </div>
                    <div className={`text-3xl font-black mb-0.5 ${isPro ? "text-white" : "text-slate-900"}`}>
                      {plan.price}
                    </div>
                    <div className={`text-xs mb-6 ${isPro ? "text-white/60" : "text-slate-400"}`}>
                      {plan.period}
                    </div>

                    <ul className="space-y-2.5 mb-7">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <span className={`text-sm flex-shrink-0 mt-0.5 ${isPro ? "text-green-300" : "text-green-500"}`}>✓</span>
                          <span className={`text-sm ${isPro ? "text-white/90" : "text-slate-700"}`}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={plan.id === "enterprise"
                        ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi, I'm interested in the Enterprise dealer plan on eWheelz")}`
                        : `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to start the ${plan.name} plan on eWheelz`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                      style={plan.ctaStyle as React.CSSProperties}
                    >
                      {plan.cta}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map(faq => (
            <div key={faq.q} className="bg-white rounded-2xl border border-[#E6E9F2] p-5">
              <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 text-white text-center"
        style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
        <div className="max-w-xl mx-auto">
          <div className="text-4xl mb-4">🚗⚡</div>
          <h2 className="text-3xl font-black mb-3">Ready to grow your EV sales?</h2>
          <p className="text-white/70 mb-8">
            Join Pakistan&apos;s first dedicated EV marketplace. First 30 days free on Pro plan.
          </p>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi, I'd like to list my EV dealership on eWheelz. Please send details.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-indigo-700 bg-white hover:bg-white/90 transition-all shadow-xl"
          >
            💬 Start on WhatsApp — It&apos;s Free
          </a>
          <p className="text-white/50 text-xs mt-4">Respond within 2 hours · No commitment required</p>
        </div>
      </section>
    </div>
  );
}
