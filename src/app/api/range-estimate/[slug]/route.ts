// src/app/api/range-estimate/[slug]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { estimateRange } from '@/lib/rangeEstimator';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ev = await prisma.evModel.findUnique({
      where: { slug: params.slug },
      include: { specs: true, battery: true },
    });

    if (!ev) {
      return NextResponse.json({ error: 'EV not found' }, { status: 404 });
    }

    const batteryCapacityKwh = ev.battery?.capacityKwh ?? ev.specs?.batteryCapKwh ?? 60;
    const wltpRange          = ev.specs?.rangeWltp ?? ev.specs?.rangeRealWorld ?? 350;
    const efficiencyWhKm     = ev.specs?.efficiencyWhKm ?? undefined;

    const estimate = estimateRange({ batteryCapacityKwh, wltpRange, efficiencyWhKm });

    return NextResponse.json({
      model:      `${ev.brand} ${ev.model}${ev.variant ? ' ' + ev.variant : ''}`,
      slug:       ev.slug,
      year:       ev.year,
      wltp_range: estimate.wltpRange,
      battery_kwh: estimate.batteryCapacityKwh,
      real_world_estimate: estimate.realWorldEstimate,
      avg_consumption_wh_km: estimate.avgConsumptionWhKm,
      pkr_per_km: estimate.pkrPerKm,
      estimated_range: {
        city:         estimate.scenarios.city.rangeKm,
        highway_110:  estimate.scenarios.highway110.rangeKm,
        highway_130:  estimate.scenarios.highway130.rangeKm,
        hot_weather:  estimate.scenarios.hotWeather.rangeKm,
        mild_weather: estimate.scenarios.mildWeather.rangeKm,
      },
      efficiency_vs_wltp: {
        city:         estimate.scenarios.city.efficiencyVsWltp,
        highway_110:  estimate.scenarios.highway110.efficiencyVsWltp,
        highway_130:  estimate.scenarios.highway130.efficiencyVsWltp,
        hot_weather:  estimate.scenarios.hotWeather.efficiencyVsWltp,
        mild_weather: estimate.scenarios.mildWeather.efficiencyVsWltp,
      },
      trip_examples: estimate.tripExamples,
      city_profiles: estimate.cityProfiles,
    });
  } catch (err) {
    console.error('[range-estimate]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
