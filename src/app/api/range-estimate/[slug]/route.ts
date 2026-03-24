export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { estimateRange } from '@/lib/rangeEstimator';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const ev = await prisma.evModel.findUnique({
      where: { slug: params.slug },
      include: { specs: true, battery: true },
    });

    if (!ev) {
      return NextResponse.json({ error: 'EV not found' }, { status: 404 });
    }

    const s = ev.specs as Record<string, unknown>;
    const b = ev.battery as Record<string, unknown>;
    const batteryCapacityKwh = (b?.capacityKwh ?? s?.batteryCapKwh ?? 60) as number;
    const wltpRange          = (s?.rangeWltp ?? s?.rangeRealWorld ?? 350) as number;
    const efficiencyWhKm     = s?.efficiencyWhKm as number | undefined;

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
