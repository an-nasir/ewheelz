"use client";
// src/app/peos/page.tsx — Pakistan EV Ownership Score (PEOS)
// 8-question quiz → personalised readiness score → top 3 EV recommendations

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

/* ── Questions ────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: "commute",
    question: "What is your daily commute distance?",
    icon: "🛣️",
    options: [
      { label: "Under 40 km",   value: "short",   score: 10 },
      { label: "40–80 km",      value: "medium",  score: 8  },
      { label: "80–150 km",     value: "long",    score: 5  },
      { label: "150 km+",       value: "verylong",score: 2  },
    ],
  },
  {
    id: "charging",
    question: "What is your home charging situation?",
    icon: "🔌",
    options: [
      { label: "Private covered parking — can install wallbox",  value: "best",    score: 10 },
      { label: "Private open parking — can use 3-pin socket",    value: "good",    score: 8  },
      { label: "Shared parking — limited access",                value: "limited", score: 4  },
      { label: "Street parking / no dedicated spot",             value: "none",    score: 1  },
    ],
  },
  {
    id: "budget",
    question: "What is your budget for an EV?",
    icon: "💰",
    options: [
      { label: "Under PKR 4M",    value: "micro",  score: 6  },
      { label: "PKR 4M – 8M",     value: "entry",  score: 9  },
      { label: "PKR 8M – 14M",    value: "mid",    score: 10 },
      { label: "PKR 14M+",        value: "premium",score: 10 },
    ],
  },
  {
    id: "loadshedding",
    question: "How many hours of load shedding do you experience per day?",
    icon: "⚡",
    options: [
      { label: "Under 2 hours",   value: "low",     score: 10 },
      { label: "2–4 hours",       value: "medium",  score: 8  },
      { label: "4–8 hours",       value: "high",    score: 5  },
      { label: "8+ hours",        value: "severe",  score: 2  },
    ],
  },
  {
    id: "usecase",
    question: "How do you primarily use your car?",
    icon: "🗺️",
    options: [
      { label: "City commuting only",         value: "city",      score: 10 },
      { label: "Mix of city + intercity",      value: "mixed",     score: 7  },
      { label: "Frequent intercity travel",   value: "intercity", score: 4  },
      { label: "Long rural routes regularly", value: "rural",     score: 2  },
    ],
  },
  {
    id: "solar",
    question: "Do you have or plan solar panels at home?",
    icon: "☀️",
    options: [
      { label: "Yes — already installed",       value: "yes",     score: 10 },
      { label: "Planning to install within 1yr", value: "soon",   score: 8  },
      { label: "Maybe in future",               value: "maybe",   score: 5  },
      { label: "Not interested",                value: "no",      score: 3  },
    ],
  },
  {
    id: "tech",
    question: "How comfortable are you with EV technology and apps?",
    icon: "📱",
    options: [
      { label: "Very comfortable — early adopter",  value: "high",    score: 10 },
      { label: "Comfortable — happy to learn",      value: "medium",  score: 9  },
      { label: "Somewhat uncertain",                value: "low",     score: 6  },
      { label: "Not comfortable at all",            value: "none",    score: 3  },
    ],
  },
  {
    id: "petrol",
    question: "How much do you currently spend on petrol per month?",
    icon: "⛽",
    options: [
      { label: "Under PKR 10,000",    value: "low",     score: 6  },
      { label: "PKR 10,000 – 20,000", value: "medium",  score: 9  },
      { label: "PKR 20,000 – 35,000", value: "high",    score: 10 },
      { label: "PKR 35,000+",         value: "very",    score: 10 },
    ],
  },
];

/* ── EV Recommendations database ─────────────────────────────────────────── */
const EV_RECS = [
  {
    slug: "changan-lumin",
    brand: "Changan", model: "Lumin",
    price: "PKR 3.2M", range: "301 km",
    tags: ["budget", "city", "micro"],
    matchConditions: ["budget=micro", "commute=short", "commute=medium"],
    gradient: "linear-gradient(135deg,#059669,#10B981)",
    desc: "Pakistan's most affordable EV. Perfect for city commuters on a tight budget.",
    highlight: "💰 Best Value",
  },
  {
    slug: "byd-atto-3",
    brand: "BYD", model: "Atto 3",
    price: "PKR 11.5M", range: "480 km",
    tags: ["popular", "family", "mid"],
    matchConditions: ["budget=mid", "commute=medium", "commute=long", "usecase=mixed"],
    gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    desc: "Pakistan's best-selling EV. Outstanding range, LFP battery safety, and dealer network.",
    highlight: "⭐ Most Popular",
  },
  {
    slug: "mg-zs-ev",
    brand: "MG", model: "ZS EV",
    price: "PKR 9.8M", range: "440 km",
    tags: ["value", "family", "entry"],
    matchConditions: ["budget=entry", "budget=mid", "commute=medium"],
    gradient: "linear-gradient(135deg,#E11D48,#F43F5E)",
    desc: "Best blend of price and features. Trusted MG dealer network across Pakistan.",
    highlight: "🏆 Best All-Rounder",
  },
  {
    slug: "byd-dolphin",
    brand: "BYD", model: "Dolphin",
    price: "PKR 7.5M", range: "420 km",
    tags: ["entry", "city", "efficient"],
    matchConditions: ["budget=entry", "commute=short", "commute=medium", "usecase=city"],
    gradient: "linear-gradient(135deg,#0284C7,#38BDF8)",
    desc: "Compact, efficient hatchback with BYD's Blade LFP battery. Great for city use.",
    highlight: "🔋 Most Efficient",
  },
  {
    slug: "byd-seal",
    brand: "BYD", model: "Seal",
    price: "PKR 13.5M", range: "570 km",
    tags: ["premium", "performance", "mid"],
    matchConditions: ["budget=mid", "budget=premium", "commute=long", "tech=high"],
    gradient: "linear-gradient(135deg,#1D4ED8,#6366F1)",
    desc: "Best-in-class range and performance. For buyers who want the top EV sedan.",
    highlight: "⚡ Longest Range",
  },
  {
    slug: "hyundai-ioniq-5",
    brand: "Hyundai", model: "Ioniq 5",
    price: "PKR 17M", range: "481 km",
    tags: ["premium", "tech", "fast-charge"],
    matchConditions: ["budget=premium", "charging=best", "tech=high"],
    gradient: "linear-gradient(135deg,#0F172A,#1E40AF)",
    desc: "Ultra-fast 800V charging, futuristic design, and HTRAC AWD. Pakistan's premium choice.",
    highlight: "⚡ Fastest Charging",
  },
  {
    slug: "honri-ve",
    brand: "Honri", model: "VE",
    price: "PKR 2.8M", range: "250 km",
    tags: ["budget", "city", "micro"],
    matchConditions: ["budget=micro", "commute=short", "charging=limited", "charging=none"],
    gradient: "linear-gradient(135deg,#D97706,#F59E0B)",
    desc: "Ultra-affordable EV hatchback. Best for short city commutes with limited charging.",
    highlight: "💡 Most Affordable",
  },
];

/* ── Score → grade mapping ─────────────────────────────────────────────────── */
function getGrade(score: number): { label: string; color: string; gradient: string; desc: string } {
  if (score >= 85) return { label: "EV Ready", color: "#16A34A", gradient: "linear-gradient(135deg,#22C55E,#10B981)", desc: "You are an ideal EV owner in Pakistan. Go electric now — the ROI is immediate." };
  if (score >= 70) return { label: "Very Suitable", color: "#2563EB", gradient: "linear-gradient(135deg,#3B82F6,#6366F1)", desc: "EVs make excellent sense for your lifestyle. A few minor adjustments will make it seamless." };
  if (score >= 55) return { label: "Good Match", color: "#7C3AED", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", desc: "EVs will work well for you with some planning around charging and load shedding." };
  if (score >= 40) return { label: "Needs Planning", color: "#D97706", gradient: "linear-gradient(135deg,#F59E0B,#EF4444)", desc: "EVs are possible but you'll need to address home charging and load shedding first." };
  return { label: "Not Ready Yet", color: "#DC2626", gradient: "linear-gradient(135deg,#EF4444,#DC2626)", desc: "Consider improving your charging setup and addressing load shedding before switching." };
}

/* ── Recommendation engine ─────────────────────────────────────────────────── */
function recommend(answers: Record<string, string>, budget: string, score: number) {
  // Score each EV by how many conditions it matches
  const scored = EV_RECS.map(ev => {
    let matchCount = 0;
    for (const cond of ev.matchConditions) {
      const [key, val] = cond.split("=");
      if (answers[key] === val) matchCount++;
    }
    // Budget constraint hard filter
    const budgetOk =
      (budget === "micro"   && ["PKR 3.2M","PKR 2.8M"].some(p => ev.price.includes(p.split("PKR")[1].trim()))) ||
      (budget === "entry"   && parseFloat(ev.price.replace("PKR ","").replace("M","")) <= 10) ||
      (budget === "mid"     && parseFloat(ev.price.replace("PKR ","").replace("M","")) <= 14) ||
      (budget === "premium" && true);
    return { ev, matchCount, budgetOk };
  });

  // Sort: budget-compatible first, then by matchCount
  const filtered = scored.filter(s => s.budgetOk).sort((a, b) => b.matchCount - a.matchCount);
  const top3 = filtered.slice(0, 3).map(s => s.ev);

  // Fallback if budget filter is too strict
  if (top3.length < 2) {
    return scored.sort((a, b) => b.matchCount - a.matchCount).slice(0, 3).map(s => s.ev);
  }
  return top3;
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function PeosPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  // Email gate — recommendations are blurred until user provides email
  const [unlocked, setUnlocked]   = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateLoading, setGateLoading] = useState(false);

  const q = QUESTIONS[current];
  const progress = (current / QUESTIONS.length) * 100;

  const handleAnswer = (qId: string, value: string) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);
    if (current + 1 < QUESTIONS.length) {
      setCurrent(c => c + 1);
    } else {
      setShowResult(true);
    }
  };

  // Calculate score
  const totalScore = QUESTIONS.reduce((sum, q) => {
    const opt = q.options.find(o => o.value === answers[q.id]);
    return sum + (opt?.score ?? 0);
  }, 0);
  const maxScore = QUESTIONS.length * 10;
  const pct = Math.round((totalScore / maxScore) * 100);
  const grade = getGrade(pct);
  const recs = recommend(answers, answers.budget ?? "mid", pct);

  const reset = () => { setCurrent(0); setAnswers({}); setShowResult(false); setUnlocked(false); setGateEmail(""); };

  async function unlockRecs(e: React.FormEvent) {
    e.preventDefault();
    if (!gateEmail) return;
    setGateLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: gateEmail, source: "peos_result" }),
      });
      track("Newsletter Signup", { source: "peos_result", score: pct });
      setUnlocked(true);
    } catch { /* still unlock even on error — don't punish the user */ setUnlocked(true); }
    setGateLoading(false);
  }

  /* ── Result screen ── */
  if (showResult) {
    return (
      <div className="bg-[#F6F8FF] min-h-screen">
        <div className="py-10 px-4 text-white" style={{ background: grade.gradient }}>
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-3">🇵🇰</div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-80">Pakistan EV Ownership Score</div>
            <div className="text-8xl font-black tabular-nums mb-1">{pct}</div>
            <div className="text-3xl font-bold mb-3">{grade.label}</div>
            <p className="text-white/80 max-w-md mx-auto leading-relaxed">{grade.desc}</p>

            {/* Score bar */}
            <div className="mt-6 max-w-sm mx-auto bg-white/20 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-1000"
                style={{ width: `${pct}%`, opacity: 0.9 }} />
            </div>
            <div className="flex justify-between max-w-sm mx-auto mt-1 text-white/60 text-xs">
              <span>Not Ready</span><span>EV Ready</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

          {/* Top 3 EV Recommendations — blurred until email provided */}
          <div className="relative">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">🎯 Your Top 3 EV Matches</div>
            <div className={`space-y-3 transition-all duration-300 ${!unlocked ? "blur-sm pointer-events-none select-none" : ""}`}>
              {recs.map((ev, i) => (
                <Link key={ev.slug} href={`/ev/${ev.slug}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-[#E6E9F2] bg-white hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black flex-shrink-0"
                    style={{ background: ev.gradient }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{ev.brand} {ev.model}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${ev.gradient.includes("059669") ? "#F0FDF4" : "#EEF2FF"}`, color: ev.gradient.includes("059669") ? "#16A34A" : "#4F46E5" }}>
                        {ev.highlight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{ev.desc}</p>
                    <div className="flex gap-4 mt-1.5 text-xs text-slate-400">
                      <span>💰 {ev.price}</span>
                      <span>🛣️ {ev.range}</span>
                    </div>
                  </div>
                  <span className="text-indigo-400 text-sm group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              ))}
            </div>

            {/* Email gate overlay — shown until unlocked */}
            {!unlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
                style={{ background: "rgba(246,248,255,0.85)", backdropFilter: "blur(2px)" }}>
                <div className="bg-white rounded-[24px] p-6 shadow-xl border border-indigo-100 max-w-sm w-full mx-4 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="text-base font-black text-slate-900 mb-1">Unlock Your EV Matches</h3>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                    Enter your email to see your personalised Top 3 EVs for Pakistan — curated to your score of <strong>{pct}</strong>.
                  </p>
                  <form onSubmit={unlockRecs} className="flex flex-col gap-2">
                    <input type="email" value={gateEmail} onChange={e => setGateEmail(e.target.value)}
                      placeholder="your@email.com" required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
                    <button type="submit" disabled={gateLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                      {gateLoading ? "Unlocking…" : "Show My EV Recommendations →"}
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 mt-2">No spam · Unsubscribe any time</p>
                </div>
              </div>
            )}
          </div>

          {/* Answer summary */}
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Answers</div>
            <div className="space-y-2">
              {QUESTIONS.map(q => {
                const ans = q.options.find(o => o.value === answers[q.id]);
                const s = ans?.score ?? 0;
                return (
                  <div key={q.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base flex-shrink-0">{q.icon}</span>
                      <span className="text-xs text-slate-500 truncate">{ans?.label ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div className="h-full rounded-full"
                          style={{ width: `${s * 10}%`, background: s >= 8 ? "#22C55E" : s >= 5 ? "#F59E0B" : "#EF4444" }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{s}/10</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/ev" className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold flex-1 text-center">
              Browse Recommended EVs →
            </Link>
            <Link href="/emi-calculator" className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold flex-1 text-center">
              💰 Check Financing
            </Link>
          </div>
          <button onClick={reset} className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-2">
            ↺ Retake the Quiz
          </button>
        </div>
      </div>
    );
  }

  /* ── Quiz screen ── */
  return (
    <div className="bg-[#F6F8FF] min-h-screen">
      {/* Header */}
      <div className="py-10 px-4 text-white"
        style={{ background: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#22C55E 100%)" }}>
        <div className="max-w-xl mx-auto text-center">
          <div className="text-3xl mb-2">🇵🇰</div>
          <div className="text-xs font-bold uppercase tracking-widest mb-2 opacity-75">Pakistan EV Ownership Score</div>
          <h1 className="text-2xl font-black mb-2">Are You Ready to Go Electric?</h1>
          <p className="text-white/70 text-sm">
            8 questions · 2 minutes · Personalised EV recommendations
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#E6E9F2]">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Question {current + 1} of {QUESTIONS.length}</span>
            <span className="text-xs font-bold text-indigo-600">{Math.round(progress)}% done</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366F1,#22C55E)" }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6 shadow-sm">
          <div className="text-4xl mb-4 text-center">{q.icon}</div>
          <h2 className="text-xl font-black text-slate-900 text-center mb-6 leading-snug">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              // Color by friendliness tier
              const tier = opt.score >= 9 ? { bg: "#F0FDF4", border: "#86EFAC", dot: "#22C55E", text: "#15803D" }
                         : opt.score >= 7 ? { bg: "#EEF2FF", border: "#A5B4FC", dot: "#6366F1", text: "#4338CA" }
                         : opt.score >= 5 ? { bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B", text: "#B45309" }
                         :                  { bg: "#FFF1F2", border: "#FECDD3", dot: "#EF4444", text: "#B91C1C" };
              const letters = ["A","B","C","D"];
              return (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(q.id, opt.value)}
                  className="w-full text-left rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] group flex items-center gap-4 px-4 py-3.5"
                  style={{ background: "#FFFFFF", borderColor: "#E6E9F2" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = tier.bg;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = tier.border;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#E6E9F2";
                  }}
                >
                  {/* Letter badge */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border-2 transition-all"
                    style={{ background: "#F8FAFC", borderColor: "#E6E9F2", color: "#64748B" }}>
                    {letters[idx]}
                  </div>
                  {/* Label */}
                  <span className="text-sm font-semibold text-slate-800 flex-1 leading-snug">
                    {opt.label}
                  </span>
                  {/* EV-friendliness dot */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full" style={{ background: tier.dot }} />
                    <span className="text-[11px] font-bold" style={{ color: tier.text }}>
                      {opt.score >= 9 ? "Best" : opt.score >= 7 ? "Good" : opt.score >= 5 ? "OK" : "Tough"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Back button */}
        {current > 0 && (
          <button onClick={() => setCurrent(c => c - 1)}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 mx-auto">
            ← Previous question
          </button>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          No account needed · Completely anonymous · Based on real Pakistan EV ownership data
        </p>
      </div>
    </div>
  );
}
