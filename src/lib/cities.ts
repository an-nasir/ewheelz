// src/lib/cities.ts — Pakistan city coordinates database
// Used by trip planner to resolve city names → lat/lng

export interface CityCoord {
  name: string;
  lat: number;
  lng: number;
  province: string;
  aliases?: string[];
}

export const PAKISTAN_CITIES: CityCoord[] = [
  // Punjab
  { name: "Lahore", lat: 31.5204, lng: 74.3587, province: "Punjab", aliases: ["lhr"] },
  { name: "Faisalabad", lat: 31.4504, lng: 73.1350, province: "Punjab", aliases: ["fsd"] },
  { name: "Rawalpindi", lat: 33.6007, lng: 73.0679, province: "Punjab", aliases: ["pindi", "rwp"] },
  { name: "Gujranwala", lat: 32.1877, lng: 74.1945, province: "Punjab" },
  { name: "Multan", lat: 30.1575, lng: 71.5249, province: "Punjab", aliases: ["mtn"] },
  { name: "Bahawalpur", lat: 29.3956, lng: 71.6836, province: "Punjab" },
  { name: "Sialkot", lat: 32.4945, lng: 74.5229, province: "Punjab" },
  { name: "Sargodha", lat: 32.0836, lng: 72.6711, province: "Punjab" },
  { name: "Sheikhupura", lat: 31.7167, lng: 73.9850, province: "Punjab" },
  { name: "Gujrat", lat: 32.5736, lng: 74.0790, province: "Punjab" },
  { name: "Rahim Yar Khan", lat: 28.4202, lng: 70.2952, province: "Punjab" },
  { name: "Sahiwal", lat: 30.6682, lng: 73.1066, province: "Punjab" },
  { name: "Khanewal", lat: 30.3013, lng: 71.9320, province: "Punjab" },
  { name: "Muzaffargarh", lat: 30.0705, lng: 71.1930, province: "Punjab" },
  // Sindh
  { name: "Karachi", lat: 24.8607, lng: 67.0011, province: "Sindh", aliases: ["khi"] },
  { name: "Hyderabad", lat: 25.3960, lng: 68.3578, province: "Sindh", aliases: ["hyd"] },
  { name: "Sukkur", lat: 27.7052, lng: 68.8574, province: "Sindh" },
  { name: "Larkana", lat: 27.5570, lng: 68.2122, province: "Sindh" },
  { name: "Mirpur Khas", lat: 25.5277, lng: 69.0124, province: "Sindh" },
  { name: "Nawabshah", lat: 26.2442, lng: 68.4100, province: "Sindh" },
  { name: "Hub", lat: 25.0350, lng: 66.9900, province: "Balochistan" },
  // KPK
  { name: "Peshawar", lat: 34.0151, lng: 71.5249, province: "KPK", aliases: ["pew"] },
  { name: "Mardan", lat: 34.2010, lng: 72.0490, province: "KPK" },
  { name: "Abbottabad", lat: 34.1467, lng: 73.2117, province: "KPK" },
  { name: "Swat", lat: 35.2227, lng: 72.4258, province: "KPK" },
  { name: "Mansehra", lat: 34.3308, lng: 73.1978, province: "KPK" },
  // Balochistan
  { name: "Quetta", lat: 30.1798, lng: 66.9750, province: "Balochistan", aliases: ["uet"] },
  { name: "Turbat", lat: 25.9840, lng: 63.0420, province: "Balochistan" },
  // Capital
  { name: "Islamabad", lat: 33.6844, lng: 73.0479, province: "ICT", aliases: ["isb", "isl"] },
];

// Build lookup map (lowercase)
const CITY_MAP = new Map<string, CityCoord>();
for (const c of PAKISTAN_CITIES) {
  CITY_MAP.set(c.name.toLowerCase(), c);
  for (const alias of c.aliases ?? []) {
    CITY_MAP.set(alias.toLowerCase(), c);
  }
}

export function findCity(name: string): CityCoord | null {
  return CITY_MAP.get(name.toLowerCase().trim()) ?? null;
}

export function getAllCityNames(): string[] {
  return PAKISTAN_CITIES.map((c) => c.name).sort();
}
