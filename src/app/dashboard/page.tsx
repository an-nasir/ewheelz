// src/app/dashboard/page.tsx — Server Component wrapper for EV Owner Dashboard
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "My EV Dashboard — eWheelz",
  description:
    "Track your EV driving stats, charging sessions, petrol savings, and efficiency — anonymised and private.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
