"use client";
// src/components/AnimatedHero.tsx
import Link from "next/link";
import Image from "next/image";

export default function AnimatedHero() {
  return (
    <section className="bg-slate-950 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-sm font-bold text-emerald-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pakistan&apos;s first verified used EV marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5">
              Buy or sell a used EV<br />
              <span style={{ color: "#6EE7B7" }}>without getting cheated.</span>
            </h1>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">
              Every listing has a battery health grade. Our valuation tool shows the real PKR price before you negotiate. No dealer lies. No surprises.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/listings"
                className="px-8 py-4 rounded-xl text-base font-black text-white text-center transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" }}>
                Browse Verified Listings →
              </Link>
              <Link href="/listings/post"
                className="px-8 py-4 rounded-xl text-base font-black text-center border border-white/20 text-white hover:bg-white/5 transition-all">
                Sell Your EV — Free
              </Link>
            </div>

            {/* Pain-point trust signals */}
            <div className="flex flex-col gap-2">
              {[
                { icon: "🔋", text: "Battery grade on every listing — dealers can't hide degraded batteries" },
                { icon: "💰", text: "Know the real market price before you walk in" },
                { icon: "📍", text: "Find working chargers before buying any EV" },
              ].map(t => (
                <div key={t.icon} className="flex items-start gap-3">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-slate-400 text-sm leading-snug">{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: real EV photo */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
              <Image
                src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=85"
                alt="Electric vehicle"
                width={900}
                height={600}
                className="w-full object-cover"
                priority
              />
              {/* Overlay cards */}
              <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                <div className="flex-1 bg-black/70 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <div className="text-emerald-400 font-black text-xl">A</div>
                  <div className="text-white text-xs font-semibold">Battery Grade</div>
                  <div className="text-slate-400 text-[10px]">93% health</div>
                </div>
                <div className="flex-1 bg-black/70 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <div className="text-white font-black text-lg">PKR 7.8M</div>
                  <div className="text-slate-400 text-xs font-semibold">Fair value</div>
                  <div className="text-slate-500 text-[10px]">Not dealer price</div>
                </div>
              </div>
            </div>
            {/* Subtle glow behind image */}
            <div className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)", zIndex: -1 }} />
          </div>

        </div>
      </div>
    </section>
  );
}
