"use client";
import { useState } from "react";
import Link from "next/link";

const BRANDS = ["BYD", "MG", "Hyundai", "Changan", "Deepal", "Tesla", "Kia", "Toyota", "Other"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Multan", "Faisalabad", "Quetta"];

export default function PostListingPage() {
  const [magicText, setMagicText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [manageUrl, setManageUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    brand: "", model: "", year: new Date().getFullYear(), price: "",
    city: "", contactName: "", contactPhone: "",
    mileage: "", batteryHealth: "", condition: "USED", description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleMagicFill = async () => {
    if (!magicText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/magic-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: magicText }),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({
          ...f,
          brand: data.brand || f.brand,
          model: data.model || f.model,
          year: data.year || f.year,
          city: data.city || f.city,
          price: data.dealerPrice ? String(data.dealerPrice) : f.price,
          mileage: data.odometer ? String(data.odometer) : f.mileage,
          batteryHealth: data.batteryHealth || f.batteryHealth,
          condition: data.condition || f.condition,
        }));
        setMagicText("");
      }
    } catch (err) {
      console.error("Magic fill error", err);
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.price || !form.city || !form.contactName || !form.contactPhone) {
      alert("Fill in: Brand, Model, Price, City, Name & Phone");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evName: `${form.brand} ${form.model}`.trim(),
          price: form.price,
          year: form.year,
          mileage: form.mileage || null,
          city: form.city,
          batteryHealth: form.batteryHealth ? ({ A: 95, B: 85, C: 75, D: 65, F: 50 } as Record<string,number>)[form.batteryHealth] ?? null : null,
          condition: form.condition,
          description: form.description || null,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactWhatsapp: form.contactPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.listingId && data.sellerToken) {
          setManageUrl(`/listings/manage/${data.listingId}?token=${data.sellerToken}`);
        }
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      alert("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F6F8FF] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "linear-gradient(135deg,#22C55E,#10B981)", boxShadow: "0 8px 32px rgba(34,197,94,0.30)" }}>
            ✓
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Listing Live!</h1>
          <p className="text-slate-500 mb-5">{form.brand} {form.model} is active. Buyers can contact you now.</p>
          {manageUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs font-black text-amber-700 uppercase tracking-wider mb-1">⚠️ Save this link (shown once)</p>
              <div className="bg-white rounded border border-amber-200 px-2 py-1 text-[10px] font-mono text-slate-700 break-all mb-1.5">
                {typeof window !== "undefined" ? window.location.origin : ""}{manageUrl}
              </div>
              <button onClick={() => navigator.clipboard.writeText((typeof window !== "undefined" ? window.location.origin : "") + manageUrl)}
                className="text-xs font-bold text-amber-700 hover:text-amber-900">
                Copy link →
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/listings" className="px-6 py-3 rounded-lg text-sm font-black text-white transition-all"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              Browse More EVs →
            </Link>
            <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, brand: "", model: "", price: "", contactName: "", contactPhone: "" })); }}
              className="text-sm text-slate-400 hover:text-slate-600">
              Post Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F8FF] min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/listings" className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-block">
          ← Back to Listings
        </Link>

        <div className="grid sm:grid-cols-[1fr_340px] gap-6">

          {/* ──── MAIN FORM (LEFT) ──── */}
          <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg,#F5F3FF 0%,#FAFBFF 100%)", border: "1px solid rgba(99,102,241,0.15)" }}>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Sell Your EV</h1>
            <p className="text-sm text-slate-500 mb-6">Free listing. No commission. Reach buyers instantly.</p>

            {/* ─ ESSENTIALS (5 fields) ─ */}
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Essential Info</div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Brand *</label>
                  <select value={form.brand} onChange={e => set("brand", e.target.value)}
                    className="w-full rounded-lg border border-[#D1D9F0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                    <option value="">Select</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Model *</label>
                  <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="Atto 3"
                    className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Year</label>
                  <select value={form.year} onChange={e => set("year", Number(e.target.value))}
                    className="w-full rounded-lg border border-[#D1D9F0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                    {[2026,2025,2024,2023,2022,2021,2020].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">City *</label>
                  <select value={form.city} onChange={e => set("city", e.target.value)}
                    className="w-full rounded-lg border border-[#D1D9F0] px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                    <option value="">Select</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Price (PKR) *</label>
                <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="8500000"
                  className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            {/* ─ YOUR CONTACT (2 fields) ─ */}
            <div className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Your Contact</div>
              <div className="mb-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Name *</label>
                <input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="Ahmed Khan"
                  className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">WhatsApp / Phone *</label>
                <input value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="03XX XXXXXXX"
                  className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>

            {/* ─ OPTIONAL DETAILS (collapsible) ─ */}
            <details className="mb-6 pb-6" style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
              <summary className="cursor-pointer text-sm font-black text-slate-900 py-2 px-3 -mx-3 rounded-lg transition-all hover:bg-indigo-50/50">
                + Add More Details (optional)
              </summary>
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Mileage (km)</label>
                  <input type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)} placeholder="25000"
                    className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Condition</label>
                  <div className="flex gap-2">
                    {(["NEW","USED","CERTIFIED"]).map(c => (
                      <button key={c} onClick={() => set("condition", c)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-black border transition-all ${
                          form.condition === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
                        }`}>
                        {c === "NEW" ? "New" : c === "USED" ? "Used" : "Certified"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Battery Grade</label>
                  <div className="flex gap-1">
                    {(["A","B","C","D","F"]).map(g => (
                      <button key={g} onClick={() => set("batteryHealth", g)}
                        className={`flex-1 py-2 rounded-lg text-xs font-black border transition-all ${
                          form.batteryHealth === g ? "bg-green-600 text-white border-green-600" : "bg-white text-slate-600 border-slate-200"
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => set("description", e.target.value)}
                    placeholder="Service history, upgrades, reason for selling..."
                    className="w-full rounded-lg border border-[#E6E9F2] px-3 py-2.5 text-xs resize-none min-h-[80px] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                </div>
              </div>
            </details>

            {/* CTA */}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-4 rounded-lg text-white text-sm font-black transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#22C55E,#10B981)" }}>
              {submitting ? "Publishing..." : "Publish Listing 🚀"}
            </button>
          </div>

          {/* ──── MAGIC SIDEBAR (RIGHT) ──── */}
          <div className="sticky top-24 h-fit">
            <div className="rounded-2xl p-5 border-2 border-indigo-300 shadow-lg" style={{ background: "linear-gradient(135deg,#F5F3FF,#FAF8FF)", boxShadow: "0 8px 24px rgba(99,102,241,0.15)" }}>
              <div className="text-xl mb-1">✨</div>
              <div className="font-black text-slate-900 text-sm mb-0.5">Magic AI Fill</div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Paste a WhatsApp ad or OLX listing. We'll auto-fill your form.
              </p>

              <textarea value={magicText} onChange={(e) => setMagicText(e.target.value)}
                placeholder="2024 BYD Seal, Lahore, 8.5M, 12k km, battery A, excellent condition"
                className="w-full rounded-lg border-2 border-slate-100 px-3 py-3 text-xs bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none min-h-[120px] font-medium mb-3" />

              <button onClick={handleMagicFill} disabled={!magicText.trim() || parsing}
                className="w-full py-3 rounded-lg text-white text-xs font-black transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                {parsing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Auto-Fill Form ✨</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
