"use client";
// src/components/WhatsAppBar.tsx
// Floating WhatsApp CTA that appears in the bottom-right corner on all pages.
// On mobile it's especially prominent — WhatsApp is the primary channel in PK.
// Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env (format: 923001234567 — no + or spaces)

import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";

const WA_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923001234567";
const WA_MESSAGE = "Hi eWheelz! I'd like to know more about EVs in Pakistan.";
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

// Community group invite link (override with real link when created)
const GROUP_URL  = process.env.NEXT_PUBLIC_WA_GROUP_URL ?? WA_URL;

export default function WhatsAppBar() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Appear after 5 seconds so it doesn't feel intrusive on first load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  function handleGroupClick() {
    track("WhatsApp Group Clicked");
    window.open(GROUP_URL, "_blank", "noopener");
  }

  function handleChatClick() {
    track("WhatsApp Chat Clicked");
    window.open(WA_URL, "_blank", "noopener");
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Expanded options */}
      {expanded && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
          {/* Join Community */}
          <button
            onClick={handleGroupClick}
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl border border-green-100 hover:bg-green-50 transition-all text-left max-w-[220px]"
          >
            <span className="text-xl">👥</span>
            <div>
              <div className="text-xs font-black text-slate-900 leading-tight">Join EV Community</div>
              <div className="text-[10px] text-slate-400 leading-tight">1,200+ Pakistan EV owners</div>
            </div>
          </button>

          {/* Chat with us */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-xl border border-green-100 hover:bg-green-50 transition-all text-left max-w-[220px]"
          >
            <span className="text-xl">💬</span>
            <div>
              <div className="text-xs font-black text-slate-900 leading-tight">Ask us anything</div>
              <div className="text-[10px] text-slate-400 leading-tight">Reply within 2 hours</div>
            </div>
          </button>
        </div>
      )}

      {/* Main WhatsApp button */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 relative"
        style={{ background: "linear-gradient(135deg,#25D366,#128C7E)" }}
        aria-label="WhatsApp"
      >
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: "#25D366" }} />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>
    </div>
  );
}
