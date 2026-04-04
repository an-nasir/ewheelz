// src/app/[locale]/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — eWheelz" };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Terms of Service</h1>
      <p className="text-xs text-slate-400 mb-8">Last updated: April 2026</p>

      <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-slate-900 mb-2">Use of platform</h2>
          <p>eWheelz is a marketplace for electric vehicles in Pakistan. By using the platform you agree to list only vehicles you own or are authorised to sell, and to provide accurate information.</p>
        </section>
        <section>
          <h2 className="text-base font-black text-slate-900 mb-2">Listings</h2>
          <p>Listings are posted free of charge. eWheelz reserves the right to remove listings that are fraudulent, duplicated, or violate these terms without notice.</p>
        </section>
        <section>
          <h2 className="text-base font-black text-slate-900 mb-2">Transactions</h2>
          <p>eWheelz is not a party to any transaction between buyers and sellers. We do not guarantee the accuracy of any listing. Buyers are advised to verify battery health and vehicle condition independently before purchase.</p>
        </section>
        <section>
          <h2 className="text-base font-black text-slate-900 mb-2">Liability</h2>
          <p>eWheelz is provided "as is". We are not liable for any loss arising from use of the platform, including fraudulent listings or failed transactions.</p>
        </section>
        <section>
          <h2 className="text-base font-black text-slate-900 mb-2">Contact</h2>
          <p>Questions? Email <a href="mailto:hello@ewheelz.pk" className="text-indigo-600 hover:underline">hello@ewheelz.pk</a></p>
        </section>
      </div>
    </div>
  );
}
