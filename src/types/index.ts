// src/types/index.ts — Shared TypeScript types for eWheelz

export interface EvSpec {
  rangeWltp: number | null;
  rangeRealWorld: number | null;
  batteryCapKwh: number | null;
  batteryType: string | null;
  batteryPackVolt: number | null;
  chargingAcKw: number | null;
  chargingDcKw: number | null;
  chargingTime080: string | null;
  chargingTime1080: string | null;
  motorPowerKw: number | null;
  torqueNm: number | null;
  driveType: string | null;
  topSpeed: number | null;
  accel0100: number | null;
  efficiencyWhKm: number | null;
  weight: number | null;
  towingCapacity: number | null;
  platform: string | null;
  coolingSystem: string | null;
  combinedRange: number | null;
}

export interface EvBattery {
  chemistry: string | null;
  capacityKwh: number | null;
  voltage: number | null;
  cellFormat: string | null;
  thermalManagement: string | null;
  fastChargeCycles: number | null;
  degradationRate: number | null;
  warrantyYears: number | null;
  cycleLife: number | null;
}

export interface EvCharging {
  id: string;
  connectorType: string;
  maxDcKw: number | null;
  maxAcKw: number | null;
  chargingStandard: string | null;
}

export interface EvModel {
  id: string;
  brand: string;
  model: string;
  variant: string | null;
  slug: string;
  year: number;
  powertrain: string;
  bodyType: string | null;
  segment: string | null;
  country: string | null;
  availableInPk: boolean;
  pricePkrMin: number | null;
  pricePkrMax: number | null;
  description: string | null;
  specs?: Partial<EvSpec> | null;
  battery?: Partial<EvBattery> | null;
  charging?: EvCharging[];
  _count?: { listings: number; reviews: number };
}

export interface Listing {
  id: string;
  price: number;
  year: number;
  mileage: number | null;
  city: string;
  batteryHealth: number | null;
  condition: string;
  description: string | null;
  createdAt: string;
  evModel: { brand: string; model: string; slug: string; powertrain?: string };
  user?: { name: string; city: string };
}

export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  network: string;
  connectorTypes: string | string[] | null;
  maxPowerKw: number;
  city: string;
  country: string;
  pricePerKwh: number | null;
  operationalHours: string;
  totalSpots: number;
  availableSpots: number;
  liveStatus: "OPERATIONAL" | "BUSY" | "OFFLINE";
  address: string | null;
}

export interface TripPlanRequest {
  originCity: string;
  destinationCity: string;
  evSlug: string;
  batteryPct: number;
  drivingStyle?: "eco" | "normal" | "sport";
  temperatureC?: number;
  acOn?: boolean;
}

export interface ChargingStop {
  station: ChargingStation;
  distanceFromStartKm: number;
  chargeFromPct: number;
  chargeToPct: number;
  chargeTimeMinutes: number;
  estimatedCostPkr: number | null;
}

export interface TripPlanResult {
  canReach: boolean;
  originCity: string;
  destinationCity: string;
  totalDistanceKm: number;
  totalEnergyKwh: number;
  usableRangeKm: number;
  stops: ChargingStop[];
  totalChargingTimeMinutes: number;
  estimatedDrivingTimeMinutes: number;
  estimatedTotalTimeMinutes: number;
  warning?: string;
}

export interface CostCalcResult {
  distanceKm: number;
  evModel: string;
  energyKwh: number;
  evCostPkr: number;
  petrolEquivalentCostPkr: number;
  savingsPkr: number;
  savingsPct: number;
  co2SavedKg: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  imageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}
