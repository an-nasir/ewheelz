// src/app/trip-planner/page.tsx — Server Component wrapper (keeps page.tsx RSC-compatible)
import type { Metadata } from 'next';
import TripPlannerClient from './TripPlannerClient';

export const metadata: Metadata = {
  title: 'EV Trip Planner Pakistan — Charging Stops & Route Planning',
  description:
    'Plan any EV road trip in Pakistan. Get exact charging stops, drive time, and energy usage for your electric vehicle on any route.',
  alternates: { canonical: '/trip-planner' },
};

export default function TripPlannerPage() {
  return <TripPlannerClient />;
}
