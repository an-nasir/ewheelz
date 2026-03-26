"use client";
// src/components/GetQuoteModal.tsx
// "Get a Quote" modal — shown on EV detail pages.
// Collects name/phone/city/message, posts to /api/leads, fires Mixpanel events.

import { useState } from "react";
import { track } from "@/lib/analytics";

const PK_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar",
  "Multan", "Faisalabad", "Quetta", "Hyderabad", "Sialkot", "Other",
];

interface Props {
  evModelId?: string;
  evName: string;
}

export default function GetQuoteModal({ evModelId, evName }: Props) {
  const [open, setOpen]   = useState(false);
  const [form, setForm]   = useState({ name: "", phone: "", city: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  function openModal() {
    setOpen(true);
    track("Lead Form Opened", { evName, evModelId });
  }

  function closeModal() {
    setOpen(false);
    setStatus("idle");
    setForm({ name: "", phone: "", city: "", message: "" });
  }

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evModelId, evName, source: "ev_detail", ...form }),
      });
      const data = await res.json();
      if (!res.ok) { setErrMsg(data.error ?? "Error"); setStatus("error"); return; }

      track("Lead Submitted", { evName, evModelId, city: form.city });
      setStatus("success");
    } catch {
      setErrMsg("Connection error. Try again.");
      setStatus("error");
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 shadow-lg"
        style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          boxShadow: "0 4px 16px rgba(99,102,241,0.30)",
        }}
      >
        📋 Get a Quote
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.60)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] p-8 shadow-2xl"
            style={{ background: "#fff", border: "1px solid #E6E9F2" }}
          >
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            {/* Success state */}
            {status === "success" ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Request Received!</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We&apos;ll WhatsApp you within 2 hours with pricing and availability for the{" "}
                  <strong>{evName}</strong>.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Get a Quote</span>
                  <h2 className="text-xl font-black text-slate-900 mt-1">{evName}</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Our team will WhatsApp you with pricing, availability & a test drive slot.
                  </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="Muhammad Ali"
                      required
                      className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="03xx-xxxxxxx"
                      required
                      className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                    <select
                      value={form.city}
                      onChange={e => set("city", e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                    >
                      <option value="">Select city…</option>
                      {PK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message (optional)</label>
                    <textarea
                      value={form.message}
                      onChange={e => set("message", e.target.value)}
                      placeholder="Any specific variant, colour, or delivery timeline?"
                      rows={3}
                      className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 resize-none"
                    />
                  </div>

                  {errMsg && <p className="text-xs text-red-500">{errMsg}</p>}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 shadow-md"
                    style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
                  >
                    {status === "loading" ? "Sending…" : "Send Request via WhatsApp ⚡"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
