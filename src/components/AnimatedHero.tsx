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
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden gradient-mesh">
      {/* Floating blobs */}
      <div className="blob blob-primary animate-blob-float" style={{ width: 480, height: 480, top: "-10%", left: "-8%", animationDelay: "0s" }} />
      <div className="blob blob-purple animate-blob-float blob-delay-1" style={{ width: 400, height: 400, top: "10%", right: "-5%", animationDelay: "-2.5s" }} />
      <div className="blob blob-green animate-blob-float blob-delay-2" style={{ width: 300, height: 300, bottom: "5%", left: "20%", animationDelay: "-5s" }} />
      <div className="blob blob-blue animate-blob-float blob-delay-3" style={{ width: 280, height: 280, bottom: "15%", right: "15%", animationDelay: "-3.5s" }} />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <div className="fade-up mb-6 inline-flex items-center gap-2">
          <span className="neon-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Pakistan&apos;s EV Intelligence Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up delay-1 text-5xl sm:text-7xl font-black tracking-tight text-slate-900 mb-5 leading-[1.05]">
          EV Intelligence
          <span className="block text-gradient-primary">for Pakistan</span>
        </h1>

        {/* Subtext */}
        <p className="fade-up delay-2 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Plan smarter trips. Track real-world efficiency. Discover reliable charging stations across Pakistan.
        </p>

        {/* CTAs */}
        <div className="fade-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <MagneticButton href="/ev" className="btn-primary text-base px-8 py-3.5">
            Explore EV Intelligence →
          </MagneticButton>
          <MagneticButton href="/compare" className="btn-outline text-base px-8 py-3.5">
            Compare EVs
          </MagneticButton>
        </div>

        {/* Stat cards */}
        <div className="fade-up delay-4 grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E6E9F2",
                boxShadow: "0 2px 12px rgba(99,102,241,0.08)",
              }}
            >
              <div
                className="text-3xl font-black tabular-nums"
                style={{
                  background: s.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F6F8FF)" }}
      />
    </section>
  );
}
