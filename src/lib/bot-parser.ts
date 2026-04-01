// src/lib/bot-parser.ts
// Parses casual WhatsApp text into structured EV query.
// "byd atto 3 2023 45000km karachi dealer asking 8.5M" → structured object

export interface ParsedQuery {
  rawText: string;
  brand: string | null;
  model: string | null;         // best guess from text
  year: number | null;
  odometer: number | null;      // km
  city: string | null;
  dealerPrice: number | null;   // PKR — if user mentions dealer asking price
  originalRange: number | null; // km — if user provides
  currentRange: number | null;  // km — if user provides
}

const BRANDS: Record<string, string[]> = {
  "BYD":      ["byd"],
  "MG":       ["mg"],
  "Changan":  ["changan"],
  "Tesla":    ["tesla"],
  "Chery":    ["chery", "omoda"],
  "Deepal":   ["deepal"],
  "Zeekr":    ["zeekr"],
  "Jetour":   ["jetour"],
  "Hyundai":  ["hyundai"],
  "Honri":    ["honri"],
  "ORA":      ["ora"],
  "Jaecoo":   ["jaecoo"],
};

const CITIES = [
  "karachi", "lahore", "islamabad", "rawalpindi", "faisalabad",
  "multan", "peshawar", "quetta", "hyderabad", "sialkot",
  "gujranwala", "bahawalpur",
];

// Common EV model keywords — helps strip model from text
const MODEL_KEYWORDS: Record<string, string[]> = {
  "BYD":     ["atto 3", "atto 2", "atto", "seal", "dolphin", "shark", "han", "tang", "yuan"],
  "MG":      ["zs ev", "zs", "4 ev", "mg4", "cyberster"],
  "Changan": ["lumin", "oshan", "uni", "deepal"],
  "Tesla":   ["model 3", "model y", "model s", "model x"],
  "Chery":   ["omoda e5", "omoda"],
  "Deepal":  ["s07", "l07"],
  "Hyundai": ["ioniq 5", "ioniq 6", "ioniq"],
};

export function parseMessage(text: string): ParsedQuery {
  const t = text.toLowerCase().trim();

  // ── Brand ──────────────────────────────────────────────────────────────────
  let brand: string | null = null;
  for (const [name, aliases] of Object.entries(BRANDS)) {
    if (aliases.some(a => t.includes(a))) { brand = name; break; }
  }

  // ── Model (best effort) ────────────────────────────────────────────────────
  let model: string | null = null;
  if (brand && MODEL_KEYWORDS[brand]) {
    for (const kw of MODEL_KEYWORDS[brand]) {
      if (t.includes(kw)) { model = kw; break; }
    }
  }

  // ── Year ───────────────────────────────────────────────────────────────────
  const yearMatch = t.match(/\b(20[12]\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;

  // ── Odometer ───────────────────────────────────────────────────────────────
  // "45000km" | "45,000 km" | "45k km" | "45k"
  let odometer: number | null = null;
  const kmMatch = t.match(/([\d,]+)\s*k\s*km|([\d,]+)\s*k\b|([\d,]+)\s*km/i);
  if (kmMatch) {
    const raw = (kmMatch[1] || kmMatch[2] || kmMatch[3]).replace(/,/g, "");
    const n = parseFloat(raw);
    // If matched "k" suffix, multiply by 1000
    odometer = kmMatch[1] || kmMatch[2] ? Math.round(n * 1000) : Math.round(n);
  }

  // ── City ───────────────────────────────────────────────────────────────────
  let city: string | null = null;
  for (const c of CITIES) {
    if (t.includes(c)) { city = c.charAt(0).toUpperCase() + c.slice(1); break; }
  }

  // ── Dealer price ───────────────────────────────────────────────────────────
  // "dealer asking 8.5M" | "asking 85 lac" | "price 8500000"
  let dealerPrice: number | null = null;
  const dealerMatch = t.match(
    /(?:dealer|asking|price|maang\s*raha|maangraha|listed)[^\d]*([\d.,]+)\s*(m\b|million|crore|lac[kh]?)/i
  );
  if (dealerMatch) {
    dealerPrice = parsePkr(dealerMatch[1], dealerMatch[2]);
  }

  // ── Range (for battery check) ──────────────────────────────────────────────
  // "original 480km now 365km" | "orig 480 current 365"
  let originalRange: number | null = null;
  let currentRange: number | null = null;
  const origMatch = t.match(/(?:orig|original|pehle|before)[^\d]*([\d]+)\s*km/i);
  const currMatch = t.match(/(?:now|current|ab|aaj)[^\d]*([\d]+)\s*km/i);
  if (origMatch) originalRange = parseInt(origMatch[1]);
  if (currMatch) currentRange  = parseInt(currMatch[1]);

  return {
    rawText: text,
    brand,
    model,
    year,
    odometer,
    city,
    dealerPrice,
    originalRange,
    currentRange,
  };
}

function parsePkr(numStr: string, unit: string): number {
  const n = parseFloat(numStr.replace(/,/g, ""));
  const u = unit.toLowerCase();
  if (u.startsWith("m") || u === "million") return Math.round(n * 1_000_000);
  if (u === "crore")                         return Math.round(n * 10_000_000);
  if (u.startsWith("lac") || u.startsWith("lak")) return Math.round(n * 100_000);
  return Math.round(n);
}
