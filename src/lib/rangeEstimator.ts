/**
 * EV Range Reality Index — Pakistan Edition
 * Calculates real-world range under local driving conditions.
 */

export interface RangeScenario {
  label: string;
  icon: string;
  description: string;
  kmh?: number;
  rangeKm: number;
  consumptionWhKm: number;
  efficiencyVsWltp: number; // % of WLTP range actually achieved
}

export interface TripExample {
  from: string;
  to: string;
  distanceKm: number;
  batteryNeededPct: number;
  canReach: boolean;
  chargeStopsNeeded: number;
}

export interface CityRangeProfile {
  city: string;
  avgTempC: number;
  estimatedRangeKm: number;
  conditions: string;
}

export interface RangeEstimate {
  wltpRange: number;
  batteryCapacityKwh: number;
  usableKwh: number;
  baseConsumptionWhKm: number;
  realWorldEstimate: number;     // Average of city + highway110
  avgConsumptionWhKm: number;
  pkrPerKm: number;              // At PKR 50/kWh (typical Pakistan home tariff)
  scenarios: {
    city: RangeScenario;
    highway110: RangeScenario;
    highway130: RangeScenario;
    hotWeather: RangeScenario;
    mildWeather: RangeScenario;
  };
  tripExamples: TripExample[];
  cityProfiles: CityRangeProfile[];
}

// ─── Adjustment factors ──────────────────────────────────────────────────────

// Speed dramatically affects aerodynamic drag (proportional to v²)
// City: regen helps EVs, but AC + stop-go partly cancels out
const SCENARIO_FACTORS: Record<string, { speed: number; temp: number }> = {
  city:        { speed: 0.90, temp: 1.00 }, // Regen braking advantage
  highway110:  { speed: 1.18, temp: 1.00 }, // Motorway drag
  highway130:  { speed: 1.42, temp: 1.00 }, // ~20% more drag vs 110
  hotWeather:  { speed: 0.92, temp: 1.28 }, // City + full AC at 40°C
  mildWeather: { speed: 0.88, temp: 0.98 }, // Light driving, ideal temp
};

// Pakistan city profiles: temperature + traffic multipliers
const CITY_PROFILES = [
  { city: 'Karachi',    avgTempC: 33, trafficMult: 1.12, conditions: 'Hot coastal city, heavy traffic + full AC' },
  { city: 'Lahore',     avgTempC: 29, trafficMult: 1.10, conditions: 'Hot summers, dense urban traffic' },
  { city: 'Islamabad',  avgTempC: 23, trafficMult: 1.05, conditions: 'Moderate climate, lighter traffic' },
  { city: 'Peshawar',   avgTempC: 26, trafficMult: 1.08, conditions: 'Warm, moderate urban stop-go' },
  { city: 'Multan',     avgTempC: 36, trafficMult: 1.14, conditions: 'Extreme heat, heaviest AC drain' },
];

// Common Pakistan road trips (approx. motorway distances)
const PAKISTAN_ROUTES = [
  { from: 'Lahore',      to: 'Islamabad',   distanceKm: 375 },
  { from: 'Karachi',     to: 'Hyderabad',   distanceKm: 165 },
  { from: 'Islamabad',   to: 'Peshawar',    distanceKm: 175 },
  { from: 'Lahore',      to: 'Multan',      distanceKm: 340 },
  { from: 'Islamabad',   to: 'Lahore',      distanceKm: 375 },
];

const PKR_PER_KWH = 50; // Typical Pakistan home electricity tariff

// ─── Core estimator ───────────────────────────────────────────────────────────

export function estimateRange(params: {
  batteryCapacityKwh: number;
  wltpRange: number;
  efficiencyWhKm?: number;
}): RangeEstimate {
  const { batteryCapacityKwh, wltpRange } = params;

  // Usable battery is ~87% of nominal (manufacturer buffer)
  const usableKwh = batteryCapacityKwh * 0.87;

  // Base WLTP consumption (what the car claims)
  const baseConsumptionWhKm =
    params.efficiencyWhKm ?? Math.round((usableKwh * 1000) / wltpRange);

  function calcScenario(key: keyof typeof SCENARIO_FACTORS): {
    rangeKm: number;
    consumptionWhKm: number;
    efficiencyVsWltp: number;
  } {
    const { speed, temp } = SCENARIO_FACTORS[key];
    const adjusted = baseConsumptionWhKm * speed * temp;
    const rangeKm = Math.round((usableKwh * 1000) / adjusted);
    return {
      rangeKm,
      consumptionWhKm: Math.round(adjusted),
      efficiencyVsWltp: Math.round((rangeKm / wltpRange) * 100),
    };
  }

  const city        = calcScenario('city');
  const highway110  = calcScenario('highway110');
  const highway130  = calcScenario('highway130');
  const hotWeather  = calcScenario('hotWeather');
  const mildWeather = calcScenario('mildWeather');

  const realWorldEstimate = Math.round((city.rangeKm + highway110.rangeKm) / 2);
  const avgConsumptionWhKm = Math.round(
    (city.consumptionWhKm + highway110.consumptionWhKm) / 2
  );
  const pkrPerKm = Math.round((avgConsumptionWhKm / 1000) * PKR_PER_KWH * 10) / 10;

  // Trip examples using highway 110 km/h scenario (motorway = most common long trip)
  const tripExamples: TripExample[] = PAKISTAN_ROUTES.map((route) => {
    const pct = Math.round((route.distanceKm / highway110.rangeKm) * 100);
    const canReach = pct <= 85; // Keep 15% safety reserve
    const stops = canReach ? 0 : Math.ceil(pct / 75) - 1;
    return {
      ...route,
      batteryNeededPct: Math.min(pct, 100),
      canReach,
      chargeStopsNeeded: stops,
    };
  });

  // Per-city range estimates
  const cityProfiles: CityRangeProfile[] = CITY_PROFILES.map((p) => {
    const tempFactor =
      p.avgTempC > 35 ? 1.32 : p.avgTempC > 30 ? 1.22 : p.avgTempC > 24 ? 1.10 : 1.02;
    const adjusted = baseConsumptionWhKm * SCENARIO_FACTORS.city.speed * tempFactor * p.trafficMult;
    return {
      city: p.city,
      avgTempC: p.avgTempC,
      estimatedRangeKm: Math.round((usableKwh * 1000) / adjusted),
      conditions: p.conditions,
    };
  });

  return {
    wltpRange,
    batteryCapacityKwh,
    usableKwh: Math.round(usableKwh * 10) / 10,
    baseConsumptionWhKm: Math.round(baseConsumptionWhKm),
    realWorldEstimate,
    avgConsumptionWhKm,
    pkrPerKm,
    scenarios: {
      city: {
        label: 'City Driving',
        icon: '🏙️',
        description: 'Urban stop-and-go with AC',
        ...city,
      },
      highway110: {
        label: 'Highway 110 km/h',
        icon: '🛣️',
        description: 'Motorway at legal speed limit',
        kmh: 110,
        ...highway110,
      },
      highway130: {
        label: 'Highway 130 km/h',
        icon: '⚡',
        description: 'Fast motorway driving',
        kmh: 130,
        ...highway130,
      },
      hotWeather: {
        label: 'Summer 40°C',
        icon: '☀️',
        description: 'Hot day with full AC, city driving',
        ...hotWeather,
      },
      mildWeather: {
        label: 'Mild 20°C',
        icon: '🌤️',
        description: 'Ideal conditions, light driving',
        ...mildWeather,
      },
    },
    tripExamples,
    cityProfiles,
  };
}
