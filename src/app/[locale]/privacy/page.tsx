// src/app/[locale]/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — eWheelz",
  description: "eWheelz Privacy Policy — how we collect, use and protect your personal data.",
};

const UPDATED = "1 April 2026";

export default function PrivacyPage() {
  return (
    <div style={{ background: "#F6F8FF", minHeight: "100vh" }}>

      {/* Dark hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E1B4B 60%,#0F172A 100%)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: "rgba(99,102,241,0.18)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.35)" }}>
            Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm text-slate-600 leading-relaxed">

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">1. Who We Are</h2>
          <p>eWheelz is Pakistan's verified electric vehicle marketplace, operated by eWheelz (Pvt) Limited. Our platform is available at <strong>ewheelz.pk</strong> and via our mobile application. When we say "eWheelz", "we", "us" or "our", we mean eWheelz (Pvt) Limited.</p>
          <p className="mt-2">This Privacy Policy explains what personal data we collect when you use our website or mobile app, why we collect it, and what we do with it. Please read it carefully.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">2. What Data We Collect</h2>
          <p className="mb-3">We collect data you give us directly and data generated automatically when you use our platform.</p>
          <div className="space-y-3">
            {[
              { title: "Account & profile data", desc: "Name, email address, phone number, city, and password (hashed — never stored in plain text) when you register." },
              { title: "Listing data", desc: "Vehicle details, photos, price, contact preferences, and your seller token when you post a listing." },
              { title: "Contact & enquiry data", desc: "Messages you send through our contact form or WhatsApp." },
              { title: "Usage & device data", desc: "IP address, browser type, pages visited, time spent, and general location (city level) — collected automatically via cookies and analytics." },
              { title: "Newsletter subscriptions", desc: "Your email address and the page you signed up from." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="font-black text-slate-800 mb-1">{title}</div>
                <div>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">3. How We Use Your Data</h2>
          <ul className="space-y-2">
            {[
              "To operate the marketplace — showing your listings to buyers, sending the seller manage link, and enabling buyer–seller WhatsApp contact.",
              "To improve the platform — analysing anonymous usage patterns to fix bugs and prioritise features.",
              "To send the weekly EV Digest newsletter, if you subscribed. You can unsubscribe anytime via the link in any email.",
              "To respond to enquiries sent through our contact page or WhatsApp.",
              "To detect and prevent fraud, spam, and abuse.",
              "To comply with applicable Pakistani law and respond to lawful requests from government or regulatory authorities.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-indigo-500 mt-0.5 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties. We do not use your data for targeted advertising.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">4. Listing Visibility</h2>
          <p>When you post a listing, your <strong>vehicle details, price, city, and contact phone/WhatsApp number</strong> are publicly visible to all users. Do not include information in your listing that you do not wish to be publicly visible.</p>
          <p className="mt-2">Your seller token (the manage URL) is never publicly displayed. Keep it safe — it is the only way to mark your listing as sold.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">5. Cookies & Analytics</h2>
          <p>We use the following:</p>
          <div className="mt-3 space-y-2">
            {[
              { name: "Vercel Analytics", purpose: "Anonymous page view counts — no personal data" },
              { name: "PostHog", purpose: "Product analytics — feature usage, anonymous session data" },
              { name: "Session cookies", purpose: "Keep you logged in across page loads" },
            ].map(({ name, purpose }) => (
              <div key={name} className="flex gap-3 rounded-lg p-3" style={{ background: "#F8FAFC", border: "1px solid #E6E9F2" }}>
                <strong className="text-slate-800 shrink-0">{name}:</strong>
                <span>{purpose}</span>
              </div>
            ))}
          </div>
          <p className="mt-3">You can block cookies in your browser settings. Some features (e.g. staying logged in) may not work if you do.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">6. Data Sharing</h2>
          <p>We share data only in the following limited cases:</p>
          <ul className="space-y-2 mt-2">
            {[
              "With infrastructure providers (Vercel, Neon) who process data solely to operate our platform under strict data processing agreements.",
              "With law enforcement or regulators when required by Pakistani law or a valid legal order.",
              "With your explicit consent — for example, when your listing contact details are shown to a prospective buyer.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-slate-400 shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">7. Data Retention</h2>
          <p>We keep your account data for as long as your account is active. Listings are retained for 12 months after they are marked sold or expire, then deleted. Newsletter subscriber data is kept until you unsubscribe. You may request deletion at any time (see section 8).</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">8. Your Rights</h2>
          <p className="mb-3">You have the right to:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { right: "Access", desc: "Request a copy of the data we hold about you" },
              { right: "Correction", desc: "Update inaccurate or incomplete data" },
              { right: "Deletion", desc: "Request we delete your account and personal data" },
              { right: "Withdrawal", desc: "Withdraw consent for newsletter or analytics at any time" },
            ].map(({ right, desc }) => (
              <div key={right} className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #E6E9F2" }}>
                <div className="font-black text-slate-900 mb-1">{right}</div>
                <div className="text-xs">{desc}</div>
              </div>
            ))}
          </div>
          <p className="mt-3">To exercise any right, email us at <a href="mailto:hello@ewheelz.pk" className="text-indigo-600 hover:underline font-semibold">hello@ewheelz.pk</a> or WhatsApp <a href="https://wa.me/923444196711" className="text-indigo-600 hover:underline font-semibold">+92 344 419 6711</a>. We respond within 3 business days.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">9. Security</h2>
          <p>We implement industry-standard security: HTTPS everywhere, hashed passwords, cryptographic seller tokens, and access controls on our database. No internet transmission is 100% secure. Do not share your seller manage URL with anyone you do not trust.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">10. Children</h2>
          <p>eWheelz is not intended for users under 18. We do not knowingly collect data from children. If you believe a child has submitted data to us, contact us and we will delete it promptly.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">11. Changes to This Policy</h2>
          <p>We may update this policy from time to time. Material changes will be notified via email (if you have an account) or a banner on the site. Continued use of eWheelz after changes are published means you accept the updated policy.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-slate-900 mb-3">12. Contact</h2>
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row gap-4" style={{ background: "#0F172A", border: "1px solid #1E293B" }}>
            <div className="flex-1">
              <div className="font-black text-white mb-1">eWheelz (Pvt) Limited</div>
              <div className="text-slate-400 text-xs">Pakistan's EV Marketplace</div>
            </div>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@ewheelz.pk" className="text-sm text-indigo-400 hover:text-indigo-300">hello@ewheelz.pk</a>
              <a href="https://wa.me/923444196711" className="text-sm text-green-400 hover:text-green-300">+92 344 419 6711</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
