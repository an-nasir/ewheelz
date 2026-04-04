// src/app/api/admin/seed-listings/route.ts
// Seeds 50 realistic Pakistani EV listings (OLX/PakWheels-style data)
// POST /api/admin/seed-listings — requires x-admin-key header

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const ADMIN_KEY = process.env.ADMIN_API_KEY ?? "";

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Peshawar", "Faisalabad", "Multan", "Quetta"];
const WA_PREFIXES = ["923001", "923011", "923021", "923031", "923041", "923051", "923061", "923071", "923321", "923331", "923341", "923444", "923001"];

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rnd(0, arr.length - 1)]; }
function waNum() { return `${pick(WA_PREFIXES)}${rnd(1000000, 9999999)}`; }
function sellerToken() { return randomBytes(20).toString("hex"); }

// Realistic Pakistani EV market data (April 2026) — 400+ listings
const LISTINGS_DATA = [
  // BYD Seal — premium sedan, 11-15M range
  { evName: "BYD Seal", brand: "BYD", model: "Seal", yearMin: 2023, yearMax: 2025, priceMin: 11_000_000, priceMax: 15_500_000, mileageMin: 5000, mileageMax: 45000, battMin: 85, battMax: 99, count: 80 },
  // BYD Atto 3 — most popular, 9-14M
  { evName: "BYD Atto 3", brand: "BYD", model: "Atto 3", yearMin: 2022, yearMax: 2025, priceMin: 8_500_000, priceMax: 13_800_000, mileageMin: 8000, mileageMax: 65000, battMin: 78, battMax: 98, count: 80 },
  // MG ZS EV — value pick, 5-9M
  { evName: "MG ZS EV", brand: "MG", model: "ZS EV", yearMin: 2021, yearMax: 2024, priceMin: 4_500_000, priceMax: 8_800_000, mileageMin: 15000, mileageMax: 80000, battMin: 72, battMax: 95, count: 64 },
  // Hyundai IONIQ 5 — premium, 13-18M
  { evName: "Hyundai IONIQ 5", brand: "Hyundai", model: "IONIQ 5", yearMin: 2022, yearMax: 2025, priceMin: 13_000_000, priceMax: 18_500_000, mileageMin: 5000, mileageMax: 35000, battMin: 88, battMax: 99, count: 40 },
  // Hyundai Kona Electric
  { evName: "Hyundai Kona Electric", brand: "Hyundai", model: "Kona Electric", yearMin: 2021, yearMax: 2024, priceMin: 7_500_000, priceMax: 11_000_000, mileageMin: 10000, mileageMax: 55000, battMin: 75, battMax: 95, count: 32 },
  // Changan Alsvin EV (very cheap, local)
  { evName: "Changan Alsvin EV", brand: "Changan", model: "Alsvin EV", yearMin: 2022, yearMax: 2025, priceMin: 3_500_000, priceMax: 5_200_000, mileageMin: 5000, mileageMax: 40000, battMin: 80, battMax: 98, count: 40 },
  // Deepal S07
  { evName: "Deepal S07", brand: "Deepal", model: "S07", yearMin: 2023, yearMax: 2025, priceMin: 9_000_000, priceMax: 12_500_000, mileageMin: 3000, mileageMax: 25000, battMin: 88, battMax: 99, count: 32 },
  // Tesla Model 3 — rare, expensive
  { evName: "Tesla Model 3", brand: "Tesla", model: "Model 3", yearMin: 2021, yearMax: 2024, priceMin: 14_000_000, priceMax: 22_000_000, mileageMin: 20000, mileageMax: 60000, battMin: 80, battMax: 95, count: 16 },
  // BYD Yuan Plus
  { evName: "BYD Yuan Plus", brand: "BYD", model: "Yuan Plus", yearMin: 2023, yearMax: 2025, priceMin: 7_500_000, priceMax: 10_500_000, mileageMin: 3000, mileageMax: 30000, battMin: 85, battMax: 99, count: 16 },
];

const DESCRIPTIONS = [
  "Single owner, all original parts, no accidents. Full service history available. Genuine sale, serious buyers only.",
  "Imported from China, personal baggage scheme. All taxes paid, documented. Battery health verified by dealer.",
  "Company maintained vehicle. All documentation complete. Non-negotiable price — market checked.",
  "Owner moving abroad. Urgent sale. Price slightly negotiable for immediate deal. WhatsApp preferred.",
  "Excellent condition, no dents, original paint. New tyres fitted last month. Can arrange inspection.",
  "Well-maintained, regular servicing done at authorized workshop. Reasonable offers considered.",
  "Lightly used, mostly for office commute. Genuine kilometres, no tampering. Exchange possible.",
  "Family car, non-accident, original condition. AC works perfectly. Serious buyers contact on WhatsApp.",
  "Imported unit, fully documented, customs cleared from Karachi port. All paperwork available.",
  "Available for test drive in Lahore. Open to genuine buyers only. Price as per market.",
];

const SELLER_NAMES = [
  "Ahmed Hassan", "Muhammad Ali", "Usman Malik", "Bilal Khan", "Shahzad Iqbal",
  "Tariq Mehmood", "Zubair Ahmed", "Imran Sheikh", "Faisal Chaudhry", "Naveed Rana",
  "Asad Butt", "Kamran Mirza", "Salman Qureshi", "Hassan Raza", "Ali Hamza",
];

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? "";
  if (ADMIN_KEY && key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check how many listings already exist
  const existing = await prisma.listing.count();
  if (existing >= 400) {
    return NextResponse.json({ message: `Already have ${existing} listings, skipping seed.`, existing });
  }

  const created: string[] = [];
  const errors: string[] = [];

  for (const template of LISTINGS_DATA) {
    for (let i = 0; i < template.count; i++) {
      try {
        const year    = rnd(template.yearMin, template.yearMax);
        const price   = rnd(template.priceMin, template.priceMax);
        const mileage = rnd(template.mileageMin, template.mileageMax);
        const batt    = rnd(template.battMin, template.battMax);
        const city    = pick(CITIES);
        const wa      = waNum();
        const name    = pick(SELLER_NAMES);
        const desc    = pick(DESCRIPTIONS);

        // Try to link to existing evModel
        const evModel = await prisma.evModel.findFirst({
          where: { brand: template.brand, model: { contains: template.model.split(" ")[0] } },
        });

        const listing = await prisma.listing.create({
          data: {
            evModelId:      evModel?.id ?? null,
            evName:         template.evName,
            price,
            year,
            mileage,
            city,
            batteryHealth:  batt,
            condition:      year >= 2024 ? "USED" : "USED",
            description:    desc,
            contactName:    name,
            contactWhatsapp: wa,
            contactPhone:   wa,
            status:         "ACTIVE",
            source:         i % 2 === 0 ? "PAKWHEELS" : "OLX",
            sellerToken:    sellerToken(),
          } as any,
        });
        created.push(listing.id);
      } catch (e: any) {
        errors.push(`${template.evName}: ${e.message}`);
      }
    }
  }

  return NextResponse.json({
    created: created.length,
    errors:  errors.length,
    errorList: errors,
    message: `Seeded ${created.length} listings successfully`,
  });
}
