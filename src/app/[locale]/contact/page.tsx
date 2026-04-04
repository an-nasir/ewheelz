// src/app/[locale]/contact/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact — eWheelz" };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Contact Us</h1>
      <p className="text-sm text-slate-500 mb-10">We reply within 2 hours on WhatsApp, same day on email.</p>

      <div className="grid sm:grid-cols-2 gap-4">

        <a href="https://wa.me/923444196711?text=Hi%20eWheelz%2C%20I%20have%20a%20question"
          target="_blank" rel="noopener noreferrer"
          className="rounded-2xl p-6 flex items-start gap-4 transition-all hover:scale-[1.02]"
          style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#25D366" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <div className="font-black text-slate-900 mb-0.5">WhatsApp</div>
            <div className="text-xs text-slate-500">+92 344 419 6711</div>
            <div className="text-xs text-green-600 font-bold mt-1">Reply within 2 hours</div>
          </div>
        </a>

        <a href="mailto:hello@ewheelz.pk"
          className="rounded-2xl p-6 flex items-start gap-4 transition-all hover:scale-[1.02]"
          style={{ background: "#EEF2FF", border: "1px solid #A5B4FC" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <div className="font-black text-slate-900 mb-0.5">Email</div>
            <div className="text-xs text-slate-500">hello@ewheelz.pk</div>
            <div className="text-xs text-indigo-600 font-bold mt-1">Reply same day</div>
          </div>
        </a>

      </div>

      <div className="mt-10 rounded-2xl p-6" style={{ background: "#F8FAFC", border: "1px solid #E6E9F2" }}>
        <div className="font-black text-slate-900 mb-1">Report a fraudulent listing</div>
        <p className="text-sm text-slate-500">Send us the listing URL on WhatsApp with a brief description and we'll investigate within 24 hours.</p>
      </div>
    </div>
  );
}
