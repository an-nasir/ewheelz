"use client";
// src/app/listings/post/page.tsx — Post a New EV Listing

import { useState } from "react";
import Link from "next/link";

const BRANDS = ["BYD", "MG", "Hyundai", "Changan", "Honri", "Deepal", "Tesla", "Kia", "Toyota", "Proton", "Volvo", "Other"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad", "Quetta", "Sialkot", "Gujranwala"];
const CONDITIONS = [
  { value: "NEW",        label: "New / Unused",      desc: "Never registered or driven" },
  { value: "USED",       label: "Used",               desc: "Previously owned and driven" },
  { value: "CERTIFIED",  label: "Certified Pre-Owned", desc: "Dealer-inspected & warranted" },
];

type Step = "details" | "condition" | "contact" | "success";

export default function PostListingPage() {
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(), variant: "",
    price: "", mileage: "", batteryHealth: "", condition: "USED",
    city: "", description: "", contactName: "", contactPhone: "", contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate a short delay (real API call would go here)
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", boxShadow: "0 8px 32px rgba(34,197,94,0.30)" }}>
            ✓
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Listing Submitted!</h1>
          <p className="text-slate-500 mb-2">
            Your {form.brand} {form.model} listing has been received. Our team will review and activate it within 24 hours.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            We&apos;ll contact you at <strong>{form.contactPhone || form.contactEmail}</strong> once it goes live.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/listings" className="btn-primary py-3 rounded-xl text-sm font-semibold text-center">
              Browse Listings →
            </Link>
            <button onClick={() => { setStep("details"); setForm(f => ({ ...f, brand: "", model: "", price: "" })); }}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              Post Another Listing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FF] min-h-screen">
      {/* Header */}
      <div className="py-10 px-4 text-white"
        style={{ background: "linear-gradient(135deg,#22C55E 0%,#10B981 40%,#3B82F6 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <Link href="/listings" className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors">
            ← Back to Listings
          </Link>
          <h1 className="text-3xl font-black mb-1">Sell Your EV</h1>
          <p className="text-green-100 text-sm">Free listing — reach Pakistan&apos;s largest EV community</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-[#E6E9F2]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex gap-4">
          {(["details", "condition", "contact"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                style={
                  step === s ? { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }
                  : (["details","condition","contact"].indexOf(step) > i)
                    ? { background: "#22C55E", color: "#fff" }
                    : { background: "#F1F5F9", color: "#94A3B8" }
                }>
                {(["details","condition","contact"].indexOf(step) > i) ? "✓" : i + 1}
              </div>
              <span className="text-xs font-semibold capitalize hidden sm:block"
                style={{ color: step === s ? "#6366F1" : "#94A3B8" }}>
                {s === "details" ? "EV Details" : s === "condition" ? "Condition & Price" : "Contact Info"}
              </span>
              {i < 2 && <div className="flex-1 h-px ml-2" style={{ background: "#E6E9F2", minWidth: 20 }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Step 1: EV Details */}
        {step === "details" && (
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg">EV Details</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Brand *</label>
                <select value={form.brand} onChange={e => set("brand", e.target.value)}
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                  <option value="">Select brand</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Model *</label>
                <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Atto 3, ZS EV"
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Year *</label>
                <select value={form.year} onChange={e => set("year", Number(e.target.value))}
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                  {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Variant <span className="text-slate-300">(optional)</span></label>
                <input value={form.variant} onChange={e => set("variant", e.target.value)} placeholder="e.g. Active, Comfort"
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">City *</label>
              <select value={form.city} onChange={e => set("city", e.target.value)}
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={() => setStep("condition")}
              disabled={!form.brand || !form.model || !form.city}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.25)" }}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Condition & Price */}
        {step === "condition" && (
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg">Condition & Price</h2>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Condition *</label>
              <div className="space-y-2">
                {CONDITIONS.map(c => (
                  <button key={c.value} onClick={() => set("condition", c.value)}
                    className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                    style={form.condition === c.value
                      ? { background: "#EEF2FF", borderColor: "#6366F1", boxShadow: "0 0 0 2px #6366F130" }
                      : { background: "#F8FAFC", borderColor: "#E6E9F2" }}>
                    <div className="font-semibold text-sm text-slate-900">{c.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Price (PKR) *</label>
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 11500000"
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                {form.price && <div className="text-xs text-slate-400 mt-1">PKR {Number(form.price).toLocaleString()}</div>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Odometer (km)</label>
                <input type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)} placeholder="e.g. 25000"
                  className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Battery Health %</label>
              <input type="number" min="50" max="100" value={form.batteryHealth} onChange={e => set("batteryHealth", e.target.value)} placeholder="e.g. 94"
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              <p className="text-xs text-slate-400 mt-1">Check BMS app for accurate reading. Helps build buyer trust.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                rows={3} placeholder="Mention service history, upgrades, reason for selling, etc."
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("details")} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[#E6E9F2] text-slate-600 hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button onClick={() => setStep("contact")} disabled={!form.price}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === "contact" && (
          <div className="bg-white rounded-2xl border border-[#E6E9F2] p-6 space-y-5">
            <h2 className="font-bold text-slate-900 text-lg">Contact Information</h2>
            <p className="text-sm text-slate-500">Buyers will contact you directly. We don&apos;t share your info publicly.</p>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Your Name *</label>
              <input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="e.g. Ahmed Khan"
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">WhatsApp / Phone *</label>
              <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="e.g. 0300-1234567"
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Email <span className="text-slate-300">(optional)</span></label>
              <input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="you@example.com"
                className="w-full rounded-xl border border-[#E6E9F2] px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-[#E6E9F2] p-4 space-y-1.5 bg-slate-50">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Listing Summary</div>
              {[
                ["EV",        `${form.brand} ${form.model} ${form.variant} (${form.year})`],
                ["City",      form.city],
                ["Condition", form.condition],
                ["Price",     `PKR ${Number(form.price).toLocaleString()}`],
                form.mileage ? ["Odometer", `${Number(form.mileage).toLocaleString()} km`] : null,
                form.batteryHealth ? ["Battery", `${form.batteryHealth}% health`] : null,
              ].filter(Boolean).map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-sm">
                  <span className="text-slate-500">{k as string}</span>
                  <span className="font-semibold text-slate-900">{v as string}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("condition")} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[#E6E9F2] text-slate-600 hover:bg-slate-50 transition-colors">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.contactName || !form.contactPhone || submitting}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", boxShadow: "0 4px 16px rgba(34,197,94,0.25)" }}>
                {submitting ? "Submitting…" : "Post Listing ✓"}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Free listing · Reviewed within 24 hours · No hidden charges
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
