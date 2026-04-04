"use client";
import { track } from "@/components/providers/AnalyticsProvider";

interface Props {
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string;
}

export default function WhatsAppButton({ brand, model, year, price, city }: Props) {
  const msg = `Hi, I'm interested in your ${brand} ${model} (${year}) listed on eWheelz for PKR ${price.toLocaleString()} in ${city}. Is it still available?`;
  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => { e.stopPropagation(); track("whatsapp_contact", { brand, model, year, price, city }); }}
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
      style={{ background: "#25D366", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(37,211,102,0.35)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.553 4.1 1.522 5.83L.057 23.928a.5.5 0 00.614.614l6.11-1.463A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.93 9.93 0 01-5.077-1.386l-.363-.217-3.767.901.917-3.667-.236-.38A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Contact Seller
    </a>
  );
}
