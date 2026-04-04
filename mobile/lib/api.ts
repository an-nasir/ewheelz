// lib/api.ts — eWheelz API client for mobile
// Base URL: set EXPO_PUBLIC_API_URL in .env, defaults to localhost for dev

const BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── EV Models ───────────────────────────────────────────────────────────────

export interface EvModel {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant?: string;
  powertrain: string;
  batteryKwh?: number;
  wltpRangeKm?: number;
  accelerationSec?: number;
  topSpeedKmh?: number;
  chargingAcKw?: number;
  chargingDcKw?: number;
  pricePkrMin?: number;
  pricePkrMax?: number;
  bodyStyle?: string;
  seatingCapacity?: number;
  country?: string;
}

export async function fetchEvModels(params?: {
  search?: string;
  powertrain?: string;
  limit?: number;
}): Promise<EvModel[]> {
  const qs = new URLSearchParams();
  if (params?.search)     qs.set("search", params.search);
  if (params?.powertrain) qs.set("powertrain", params.powertrain);
  if (params?.limit)      qs.set("limit", String(params.limit));
  return get<EvModel[]>(`/api/ev-models?${qs}`);
}

export async function fetchEvModel(slug: string): Promise<EvModel> {
  return get<EvModel>(`/api/ev-models/${slug}`);
}

// ─── Charging Stations ───────────────────────────────────────────────────────

export interface ChargingStation {
  id: string;
  name: string;
  city: string;
  address?: string;
  network: string;
  maxPowerKw: number;
  totalSpots: number;
  availableSpots: number;
  liveStatus: "OPERATIONAL" | "BUSY" | "OFFLINE";
  connectorTypes: string;
  pricePerKwh?: number;
  operationalHours: string;
  latitude: number;
  longitude: number;
}

export async function fetchChargingStations(params?: {
  city?: string;
  search?: string;
  limit?: number;
}): Promise<ChargingStation[]> {
  const qs = new URLSearchParams();
  if (params?.city)   qs.set("city", params.city);
  if (params?.search) qs.set("search", params.search);
  if (params?.limit)  qs.set("limit", String(params.limit));
  return get<ChargingStation[]>(`/api/charging-stations?${qs}`);
}

// ─── Articles ────────────────────────────────────────────────────────────────

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  publishedAt?: string;
  createdAt: string;
  content: string;
}

export async function fetchArticles(params?: {
  category?: string;
  limit?: number;
}): Promise<Article[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.limit)    qs.set("limit", String(params.limit));
  return get<Article[]>(`/api/articles?${qs}`);
}

// ─── Listings ────────────────────────────────────────────────────────────────

export interface Listing {
  id: string;
  evName: string | null;
  price: number;
  year: number;
  mileage: number | null;
  city: string;
  batteryHealth: number | null;
  condition: string;
  contactWhatsapp: string | null;
  contactPhone: string | null;
  evModel: { brand: string; model: string } | null;
}

export async function fetchListings(params?: {
  brand?: string; city?: string; limit?: number;
}): Promise<Listing[]> {
  const qs = new URLSearchParams();
  if (params?.brand) qs.set("brand", params.brand);
  if (params?.city)  qs.set("city",  params.city);
  if (params?.limit) qs.set("limit", String(params.limit));
  const data = await get<Listing[] | { listings: Listing[] }>(`/api/listings?${qs}`);
  return Array.isArray(data) ? data : ((data as any).listings ?? []);
}

export async function checkDeal(text: string): Promise<{
  analysis: { verdict: string; score: number; priceVerdict: string; flags: string[]; positives: string[]; negotiationTip: string };
  avgMarketPrice?: number; compsCount: number; isNewCar: boolean;
}> {
  return post("/api/deal-check", { text });
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface AppStats {
  evModelCount: number;
  chargingStationCount: number;
  articleCount: number;
  reportCount: number;
}

export async function fetchStats(): Promise<AppStats> {
  return get<AppStats>("/api/stats");
}

// ─── Community Reports ───────────────────────────────────────────────────────

export type StationStatus = "available" | "busy" | "broken";

export async function submitStationReport(params: {
  stationId: string;
  stationName: string;
  status: StationStatus;
  sessionToken: string;
}): Promise<{ ok: boolean }> {
  return post("/api/community/report", { type: "station_report", ...params });
}

export async function submitEfficiencyReport(params: {
  vehicleModel: string;
  efficiencyWhKm: number;
  sessionToken: string;
}): Promise<{ ok: boolean }> {
  return post("/api/community/report", { type: "efficiency_report", ...params });
}

export async function fetchLeaderboard(): Promise<
  Array<{ vehicleModel: string; avgEfficiency: number; reportCount: number; rank: number }>
> {
  return get("/api/community/leaderboard");
}
