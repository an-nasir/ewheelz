// src/components/AnimatedHero.tsx
// Full-width hero with animated gradient mesh, floating blobs, and
// particle-like dots. Used on the homepage. Pure client component.
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import MagneticButton from "./MagneticButton";

interface HeroStat {
  value: string;
  label: string;
  gradient: string;
}

interface Props {
  stats: HeroStat[];
}

export default function AnimatedHero({ stats }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Subtle particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const particles = Array.from({ length: 50 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const COLORS = ["#6366F1", "#8B5CF6", "#3B82F6", "#22C55E"];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden gradient-mesh">
      {/* Floating blobs */}
      <div className="blob blob-primary animate-blob-float" style={{ width: 480, height: 480, top: "-10%", left: "-8%", animationDelay: "0s" }} />
      <div className="blob blob-purple animate-blob-float blob-delay-1" style={{ width: 400, height: 400, top: "10%", right: "-5%", animationDelay: "-2.5s" }} />
      <div className="blob blob-green animate-blob-float blob-delay-2" style={{ width: 300, height: 300, bottom: "5%", left: "20%", animationDelay: "-5s" }} />
      <div className="blob blob-blue animate-blob-float blob-delay-3" style={{ width: 280, height: 280, bottom: "15%", right: "15%", animationDelay: "-3.5s" }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* ── Split content: text left, EV visual right ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left: text + stats */}
          <div className="flex-1 text-center lg:text-left">
            <div className="fade-up mb-6 inline-flex items-center gap-2">
              <span className="neon-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Pakistan&apos;s EV Intelligence Platform
              </span>
            </div>

            <h1 className="fade-up delay-1 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-5 leading-[1.05]">
              EV Intelligence
              <span className="block text-gradient-primary">for Pakistan</span>
            </h1>

            <p className="fade-up delay-2 text-lg sm:text-xl text-slate-500 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0">
              Compare EVs, calculate EMIs, find charging stations. Pakistan&apos;s #1 EV buying platform.
            </p>

            {/* ── Quick Search / Filter Bar ── */}
            <div className="fade-up delay-3 mb-8 max-w-lg mx-auto lg:mx-0">
              <div className="bg-white rounded-2xl border border-[#E6E9F2] shadow-lg p-2 flex flex-col sm:flex-row gap-2"
                style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.12)" }}>
                <select
                  className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl border border-[#E6E9F2] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50"
                  defaultValue=""
                  onChange={e => { if (e.target.value) window.location.href = `/ev?budget=${e.target.value}`; }}
                >
                  <option value="" disabled>💰 Budget range</option>
                  <option value="0-4">Under PKR 4M</option>
                  <option value="4-8">PKR 4M – 8M</option>
                  <option value="8-14">PKR 8M – 14M</option>
                  <option value="14-99">PKR 14M+</option>
                </select>
                <select
                  className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl border border-[#E6E9F2] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-slate-50"
                  defaultValue=""
                  onChange={e => { if (e.target.value) window.location.href = `/ev?usecase=${e.target.value}`; }}
                >
                  <option value="" disabled>🗺️ Use case</option>
                  <option value="city">City commute</option>
                  <option value="mixed">City + Intercity</option>
                  <option value="intercity">Frequent intercity</option>
                  <option value="family">Family SUV</option>
                </select>
                <Link href="/ev"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  Find My EV
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center lg:justify-start">
                {[
                  { label: "🏙️ City EVs",        href: "/ev?usecase=city" },
                  { label: "💰 Under 8M",          href: "/ev?budget=4-8" },
                  { label: "🔋 LFP Battery",       href: "/ev?battery=LFP" },
                  { label: "⚡ Fast Charging",      href: "/ev?charging=fast" },
                ].map(tag => (
                  <Link key={tag.href} href={tag.href}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white border border-[#E6E9F2] text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all">
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="fade-up delay-3 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-10">
              <MagneticButton href="/peos" className="btn-primary text-base px-8 py-3.5">
                🇵🇰 Find My Perfect EV →
              </MagneticButton>
              <MagneticButton href="/listings" className="btn-outline text-base px-8 py-3.5">
                🚗 Browse Listings
              </MagneticButton>
            </div>

            {/* Stat cards */}
            <div className="fade-up delay-4 grid grid-cols-3 gap-3 max-w-sm mx-auto lg:mx-0">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl p-4 text-center"
                  style={{ background: "#FFFFFF", border: "1px solid #E6E9F2", boxShadow: "0 2px 12px rgba(99,102,241,0.08)" }}>
                  <div className="text-3xl font-black tabular-nums"
                    style={{ background: s.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: EV hero visual */}
          <div className="fade-up delay-2 flex-1 w-full max-w-xl lg:max-w-none relative">
            {/* Glow behind the car */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.20) 0%, rgba(34,197,94,0.12) 50%, transparent 75%)" }} />

            {/* Feature card housing the EV illustration */}
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.70)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.80)", boxShadow: "0 20px 60px rgba(99,102,241,0.15)" }}>

              {/* Top badge row */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-600">Live EV Intelligence</span>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full border border-indigo-100">🇵🇰 Pakistan</span>
              </div>

              {/* The SVG EV car — large centrepiece */}
              <div className="relative py-4">
                <svg viewBox="0 0 320 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  {/* Road/ground shadow */}
                  <ellipse cx="160" cy="128" rx="140" ry="10" fill="url(#heroGround)" />

                  {/* Car body */}
                  <path d="M 18 100 L 18 78 L 50 78 L 95 40 L 220 38 L 258 64 L 302 70 L 306 100 Z"
                    fill="url(#carBody)" stroke="url(#carStroke)" strokeWidth="2" strokeLinejoin="round" />

                  {/* Cabin */}
                  <path d="M 100 76 L 118 44 L 202 41 L 222 72 Z"
                    fill="url(#cabin)" stroke="#C7D2FE" strokeWidth="1.5" />

                  {/* Window divider */}
                  <line x1="162" y1="42" x2="166" y2="75" stroke="#C7D2FE" strokeWidth="1.5" />

                  {/* Front headlight */}
                  <rect x="14" y="78" width="8" height="14" rx="3"
                    fill="url(#headlight)" />
                  {/* Headlight glow */}
                  <ellipse cx="10" cy="85" rx="12" ry="6" fill="rgba(251,191,36,0.25)" />

                  {/* Rear light bar */}
                  <rect x="298" y="68" width="8" height="20" rx="3" fill="url(#taillight)" />
                  <ellipse cx="312" cy="78" rx="10" ry="5" fill="rgba(239,68,68,0.20)" />

                  {/* Under-body glow (EV style) */}
                  <rect x="50" y="100" width="220" height="4" rx="2" fill="url(#underglow)" opacity="0.7" />

                  {/* Front wheel */}
                  <circle cx="88"  cy="106" r="24" fill="url(#wheel)" stroke="#94A3B8" strokeWidth="1.5" />
                  <circle cx="88"  cy="106" r="13" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                  <circle cx="88"  cy="106" r="4"  fill="#6366F1" />
                  {/* Wheel spokes */}
                  {[0,60,120,180,240,300].map((a) => (
                    <line key={a}
                      x1={88 + 5 * Math.cos(a * Math.PI/180)} y1={106 + 5 * Math.sin(a * Math.PI/180)}
                      x2={88 + 11 * Math.cos(a * Math.PI/180)} y2={106 + 11 * Math.sin(a * Math.PI/180)}
                      stroke="#94A3B8" strokeWidth="1.5" />
                  ))}

                  {/* Rear wheel */}
                  <circle cx="232" cy="106" r="24" fill="url(#wheel)" stroke="#94A3B8" strokeWidth="1.5" />
                  <circle cx="232" cy="106" r="13" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                  <circle cx="232" cy="106" r="4"  fill="#6366F1" />
                  {[0,60,120,180,240,300].map((a) => (
                    <line key={a}
                      x1={232 + 5 * Math.cos(a * Math.PI/180)} y1={106 + 5 * Math.sin(a * Math.PI/180)}
                      x2={232 + 11 * Math.cos(a * Math.PI/180)} y2={106 + 11 * Math.sin(a * Math.PI/180)}
                      stroke="#94A3B8" strokeWidth="1.5" />
                  ))}

                  {/* Charge port indicator */}
                  <circle cx="258" cy="64" r="5" fill="#22C55E" opacity="0.9" />
                  <circle cx="258" cy="64" r="8" fill="rgba(34,197,94,0.25)" />

                  <defs>
                    <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor="#EEF2FF" />
                      <stop offset="40%"  stopColor="#E0E7FF" />
                      <stop offset="100%" stopColor="#C7D2FE" />
                    </linearGradient>
                    <linearGradient id="carStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#A5B4FC" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                    <linearGradient id="cabin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#BFDBFE" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="wheel" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%"   stopColor="#334155" />
                      <stop offset="100%" stopColor="#1E293B" />
                    </linearGradient>
                    <linearGradient id="headlight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="#FDE68A" />
                      <stop offset="100%" stopColor="#FCD34D" />
                    </linearGradient>
                    <linearGradient id="taillight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#FCA5A5" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="underglow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor="transparent" />
                      <stop offset="30%"  stopColor="#6366F1" />
                      <stop offset="70%"  stopColor="#22C55E" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <radialGradient id="heroGround" cx="50%" cy="50%">
                      <stop offset="0%"   stopColor="#CBD5E1" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Live stats strip below the car */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[
                  { icon: "⚡", label: "Charging",  value: "11 kW AC", color: "#6366F1" },
                  { icon: "🔋", label: "Battery",   value: "77 kWh",   color: "#22C55E" },
                  { icon: "🛣️", label: "Range",     value: "520 km",   color: "#3B82F6" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-xl"
                    style={{ background: `${s.color}12`, border: `1px solid ${s.color}22` }}>
                    <div className="text-lg mb-0.5">{s.icon}</div>
                    <div className="text-xs font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F6F8FF)" }} />
    </section>
  );
}
