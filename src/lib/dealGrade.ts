// src/lib/dealGrade.ts — shared deal grade logic used by listings POST + scraper ingest

export function calcDealGrade(
  price: number,
  avgMarketPrice: number | null,
  batteryHealth: number | null,
  mileage: number | null,
  year: number,
): string {
  let score = 60;
  const currentYear = new Date().getFullYear();

  if (avgMarketPrice) {
    const diff = ((price - avgMarketPrice) / avgMarketPrice) * 100;
    if (diff < -10)     score += 15;
    else if (diff < 5)  score += 5;
    else if (diff > 15) score -= 20;
    else if (diff > 5)  score -= 8;
  }

  if (batteryHealth != null) {
    if (batteryHealth >= 90)      score += 15;
    else if (batteryHealth >= 80) score += 8;
    else if (batteryHealth < 70)  score -= 15;
  } else {
    score -= 10; // missing battery data is a red flag
  }

  if (mileage != null) {
    if (mileage < 30_000)      score += 8;
    else if (mileage > 80_000) score -= 10;
  } else {
    score -= 5;
  }

  if (currentYear - year <= 1)      score += 5;
  else if (currentYear - year >= 4) score -= 5;

  score = Math.max(0, Math.min(100, score));

  if (score >= 75) return "HOT";
  if (score >= 55) return "GOOD";
  if (score >= 40) return "FAIR";
  return "OVERPRICED";
}
