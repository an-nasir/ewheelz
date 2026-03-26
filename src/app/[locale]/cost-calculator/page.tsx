// src/app/cost-calculator/page.tsx — Server Component wrapper
import type { Metadata } from "next";
import CostCalculatorClient from "./CostCalculatorClient";

export const metadata: Metadata = {
  title: "EV vs Petrol Reality Calculator — eWheelz Pakistan",
  description:
    "See exactly how much you save every month by switching to an EV in Pakistan. Compare electricity vs petrol costs with real Pakistan prices, plus break-even analysis.",
};

export default function CostCalculatorPage() {
  return <CostCalculatorClient />;
}
