// prisma/seed.ts — Seeds database with Pakistan EV market data
// All 9 EVs currently available or coming to Pakistan
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding eWheelz database...\n");

  // ─── Users ───────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@ewheelz.com" },
    update: {},
    create: {
      email: "admin@ewheelz.com",
      name: "eWheelz Admin",
      city: "Lahore",
      role: "ADMIN",
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@ewheelz.com" },
    update: {},
    create: {
      email: "demo@ewheelz.com",
      name: "Ali Hassan",
      city: "Karachi",
      role: "USER",
    },
  });

  console.log("  Users seeded");

  // ─── 1. BYD Atto 3 ─────────────────────────────────────────────────────
  const atto3 = await prisma.evModel.create({
    data: {
      brand: "BYD",
      model: "Atto 3",
      variant: "Standard",
      slug: "byd-atto-3",
      year: 2024,
      powertrain: "BEV",
      bodyType: "SUV",
      segment: "C",
      country: "China",
      launchDate: new Date("2024-01-01"),
      availableInPk: true,
      pricePkrMin: 8500000,
      pricePkrMax: 9500000,
      description:
        "Compact electric SUV with BYD Blade Battery. Popular in Pakistan for safety and value.",
      specs: {
        create: {
          rangeWltp: 420,
          rangeRealWorld: 400,
          batteryCapKwh: 60.5,
          batteryType: "LFP Blade",
          batteryPackVolt: 400,
          chargingAcKw: 11,
          chargingDcKw: 80,
          chargingTime080: "30 min",
          chargingTime1080: "29 min",
          motorPowerKw: 150,
          torqueNm: 310,
          driveType: "FWD",
          topSpeed: 160,
          accel0100: 7.3,
          efficiencyWhKm: 157,
          weight: 1750,
          platform: "e-Platform 3.0",
          coolingSystem: "liquid",
        },
      },
      battery: {
        create: {
          chemistry: "LFP Blade",
          capacityKwh: 60.5,
          voltage: 400,
          cellFormat: "prismatic",
          thermalManagement: "liquid",
          fastChargeCycles: 3000,
          degradationRate: 1.5,
          warrantyYears: 8,
          cycleLife: 5000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 80,
            maxAcKw: 11,
            chargingStandard: "CCS",
          },
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 11,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 2. MG ZS EV ───────────────────────────────────────────────────────
  const mgZs = await prisma.evModel.create({
    data: {
      brand: "MG",
      model: "ZS EV",
      variant: "Long Range",
      slug: "mg-zs-ev",
      year: 2024,
      powertrain: "BEV",
      bodyType: "SUV",
      segment: "C",
      country: "China",
      availableInPk: true,
      pricePkrMin: 9500000,
      pricePkrMax: 10500000,
      description:
        "Compact electric SUV. One of the first mass-market EVs in Pakistan.",
      specs: {
        create: {
          rangeWltp: 340,
          rangeRealWorld: 320,
          batteryCapKwh: 44.5,
          batteryType: "Lithium-ion",
          batteryPackVolt: 400,
          chargingAcKw: 7,
          chargingDcKw: 75,
          chargingTime080: "42 min",
          motorPowerKw: 105,
          torqueNm: 353,
          driveType: "FWD",
          topSpeed: 160,
          accel0100: 8.5,
          efficiencyWhKm: 150,
          weight: 1590,
          coolingSystem: "liquid",
        },
      },
      battery: {
        create: {
          chemistry: "Lithium-ion NMC",
          capacityKwh: 44.5,
          voltage: 400,
          cellFormat: "prismatic",
          thermalManagement: "liquid",
          fastChargeCycles: 1500,
          degradationRate: 2.0,
          warrantyYears: 7,
          cycleLife: 2000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 75,
            maxAcKw: 7,
            chargingStandard: "CCS",
          },
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 7,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 3. BYD Seal ────────────────────────────────────────────────────────
  const bydSeal = await prisma.evModel.create({
    data: {
      brand: "BYD",
      model: "Seal",
      variant: "AWD Excellence",
      slug: "byd-seal",
      year: 2024,
      powertrain: "BEV",
      bodyType: "Sedan",
      segment: "D",
      country: "China",
      launchDate: new Date("2023-09-01"),
      availableInPk: true,
      pricePkrMin: 12000000,
      pricePkrMax: 15000000,
      description:
        "Performance electric sedan with Blade Battery. Tesla Model 3 competitor.",
      specs: {
        create: {
          rangeWltp: 570,
          rangeRealWorld: 480,
          batteryCapKwh: 82,
          batteryType: "LFP Blade",
          batteryPackVolt: 400,
          chargingAcKw: 11,
          chargingDcKw: 120,
          chargingTime080: "26 min",
          motorPowerKw: 390,
          torqueNm: 670,
          driveType: "AWD",
          topSpeed: 180,
          accel0100: 3.8,
          efficiencyWhKm: 158,
          weight: 2150,
          platform: "e-Platform 3.0",
          coolingSystem: "liquid",
        },
      },
      battery: {
        create: {
          chemistry: "LFP Blade",
          capacityKwh: 82,
          voltage: 550,
          cellFormat: "prismatic",
          thermalManagement: "liquid",
          fastChargeCycles: 3000,
          degradationRate: 1.5,
          warrantyYears: 8,
          cycleLife: 5000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 120,
            maxAcKw: 11,
            chargingStandard: "CCS",
          },
        ],
      },
    },
  });

  // ─── 4. Deepal S07 ─────────────────────────────────────────────────────
  const deepalS07 = await prisma.evModel.create({
    data: {
      brand: "Deepal",
      model: "S07",
      variant: "REEV",
      slug: "deepal-s07",
      year: 2025,
      powertrain: "REEV",
      bodyType: "SUV",
      segment: "D",
      country: "China",
      availableInPk: true,
      pricePkrMin: 10000000,
      pricePkrMax: 12000000,
      description:
        "Range extender SUV by Changan. Solves range anxiety with combined 1000+ km range.",
      specs: {
        create: {
          rangeWltp: 200,
          rangeRealWorld: 180,
          batteryCapKwh: 79,
          batteryType: "Lithium-ion",
          batteryPackVolt: 400,
          chargingAcKw: 7,
          chargingDcKw: 80,
          chargingTime080: "35 min",
          motorPowerKw: 190,
          torqueNm: 320,
          driveType: "FWD",
          topSpeed: 175,
          accel0100: 7.5,
          weight: 1950,
          coolingSystem: "liquid",
          combinedRange: 1100,
        },
      },
      battery: {
        create: {
          chemistry: "Lithium-ion",
          capacityKwh: 79,
          voltage: 400,
          cellFormat: "prismatic",
          thermalManagement: "liquid",
          warrantyYears: 8,
          cycleLife: 2000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 80,
            maxAcKw: 7,
            chargingStandard: "CCS",
          },
        ],
      },
    },
  });

  // ─── 5. Hyundai Ioniq 5 ────────────────────────────────────────────────
  const ioniq5 = await prisma.evModel.create({
    data: {
      brand: "Hyundai",
      model: "Ioniq 5",
      variant: "Long Range AWD",
      slug: "hyundai-ioniq-5",
      year: 2024,
      powertrain: "BEV",
      bodyType: "SUV",
      segment: "D",
      country: "South Korea",
      availableInPk: true,
      pricePkrMin: 14000000,
      pricePkrMax: 16000000,
      description:
        "Premium electric crossover with 800V ultra-fast charging architecture.",
      specs: {
        create: {
          rangeWltp: 430,
          rangeRealWorld: 380,
          batteryCapKwh: 72.6,
          batteryType: "NMC",
          batteryPackVolt: 800,
          chargingAcKw: 11,
          chargingDcKw: 240,
          chargingTime080: "18 min",
          chargingTime1080: "18 min",
          motorPowerKw: 239,
          torqueNm: 605,
          driveType: "AWD",
          topSpeed: 185,
          accel0100: 5.1,
          efficiencyWhKm: 171,
          weight: 2100,
          platform: "E-GMP",
          coolingSystem: "liquid",
        },
      },
      battery: {
        create: {
          chemistry: "NMC",
          capacityKwh: 72.6,
          voltage: 800,
          cellFormat: "pouch",
          thermalManagement: "liquid",
          fastChargeCycles: 1500,
          degradationRate: 2.0,
          warrantyYears: 8,
          cycleLife: 2000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 240,
            maxAcKw: 11,
            chargingStandard: "CCS",
          },
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 11,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 6. BYD Shark 6 (PHEV Pickup) ──────────────────────────────────────
  const bydShark = await prisma.evModel.create({
    data: {
      brand: "BYD",
      model: "Shark 6",
      variant: "Standard",
      slug: "byd-shark-6",
      year: 2025,
      powertrain: "PHEV",
      bodyType: "Pickup",
      segment: "E",
      country: "China",
      launchDate: new Date("2025-01-01"),
      availableInPk: true,
      pricePkrMin: 11000000,
      pricePkrMax: 13000000,
      description:
        "First plug-in hybrid pickup in Pakistan. 100 km pure electric range.",
      specs: {
        create: {
          rangeWltp: 100,
          rangeRealWorld: 85,
          batteryCapKwh: 19,
          batteryType: "LFP Blade",
          batteryPackVolt: 400,
          chargingAcKw: 7,
          chargingDcKw: 40,
          chargingTime080: "25 min",
          motorPowerKw: 224,
          torqueNm: 550,
          driveType: "AWD",
          topSpeed: 170,
          accel0100: 6.0,
          weight: 2550,
          towingCapacity: 2500,
          coolingSystem: "liquid",
          combinedRange: 840,
        },
      },
      battery: {
        create: {
          chemistry: "LFP Blade",
          capacityKwh: 19,
          voltage: 400,
          cellFormat: "prismatic",
          thermalManagement: "liquid",
          fastChargeCycles: 3000,
          warrantyYears: 8,
          cycleLife: 5000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 40,
            maxAcKw: 7,
            chargingStandard: "CCS",
          },
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 7,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 7. Changan Lumin (Budget) ──────────────────────────────────────────
  const lumin = await prisma.evModel.create({
    data: {
      brand: "Changan",
      model: "Lumin",
      variant: "Standard",
      slug: "changan-lumin",
      year: 2024,
      powertrain: "BEV",
      bodyType: "Hatchback",
      segment: "A",
      country: "China",
      availableInPk: true,
      pricePkrMin: 2800000,
      pricePkrMax: 3500000,
      description:
        "Ultra-affordable city EV. Ideal for short urban commutes in Pakistan.",
      specs: {
        create: {
          rangeWltp: 220,
          rangeRealWorld: 200,
          batteryCapKwh: 28.4,
          batteryType: "LFP",
          batteryPackVolt: 350,
          chargingAcKw: 3.3,
          chargingDcKw: null,
          chargingTime080: "5 hrs (AC)",
          motorPowerKw: 30,
          torqueNm: 110,
          driveType: "FWD",
          topSpeed: 100,
          accel0100: null,
          efficiencyWhKm: 95,
          weight: 950,
          coolingSystem: "air",
        },
      },
      battery: {
        create: {
          chemistry: "LFP",
          capacityKwh: 28.4,
          voltage: 350,
          cellFormat: "prismatic",
          thermalManagement: "air",
          fastChargeCycles: null,
          degradationRate: 3.0,
          warrantyYears: 5,
          cycleLife: 2000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 3.3,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 8. Honri VE (Budget) ──────────────────────────────────────────────
  const honri = await prisma.evModel.create({
    data: {
      brand: "Honri",
      model: "VE",
      variant: "Standard",
      slug: "honri-ve",
      year: 2024,
      powertrain: "BEV",
      bodyType: "Hatchback",
      segment: "A",
      country: "China",
      availableInPk: true,
      pricePkrMin: 2500000,
      pricePkrMax: 3200000,
      description:
        "Budget electric mini-car. One of the cheapest EVs available in Pakistan.",
      specs: {
        create: {
          rangeWltp: 301,
          rangeRealWorld: 250,
          batteryCapKwh: 18.5,
          batteryType: "LFP",
          batteryPackVolt: 350,
          chargingAcKw: 3.3,
          chargingDcKw: null,
          chargingTime080: "4 hrs (AC)",
          motorPowerKw: 25,
          torqueNm: 85,
          driveType: "FWD",
          topSpeed: 100,
          efficiencyWhKm: 80,
          weight: 850,
          coolingSystem: "air",
        },
      },
      battery: {
        create: {
          chemistry: "LFP",
          capacityKwh: 18.5,
          voltage: 350,
          cellFormat: "prismatic",
          thermalManagement: "air",
          degradationRate: 3.5,
          warrantyYears: 5,
          cycleLife: 1500,
        },
      },
      charging: {
        create: [
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 3.3,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 9. Tesla Model 3 Long Range (Future/Imported) ─────────────────────
  const tesla3 = await prisma.evModel.create({
    data: {
      brand: "Tesla",
      model: "Model 3",
      variant: "Long Range",
      slug: "tesla-model-3",
      year: 2024,
      powertrain: "BEV",
      bodyType: "Sedan",
      segment: "D",
      country: "USA",
      availableInPk: false,
      pricePkrMin: 15000000,
      pricePkrMax: 18000000,
      description:
        "Premium electric sedan. Available in Pakistan via grey-market imports.",
      specs: {
        create: {
          rangeWltp: 560,
          rangeRealWorld: 490,
          batteryCapKwh: 75,
          batteryType: "NMC",
          batteryPackVolt: 400,
          chargingAcKw: 11,
          chargingDcKw: 250,
          chargingTime080: "27 min",
          chargingTime1080: "25 min",
          motorPowerKw: 366,
          torqueNm: 493,
          driveType: "AWD",
          topSpeed: 201,
          accel0100: 4.4,
          efficiencyWhKm: 142,
          weight: 1830,
          platform: "Tesla Platform",
          coolingSystem: "liquid",
        },
      },
      battery: {
        create: {
          chemistry: "NMC",
          capacityKwh: 75,
          voltage: 400,
          cellFormat: "cylindrical",
          thermalManagement: "liquid",
          fastChargeCycles: 1500,
          degradationRate: 2.3,
          warrantyYears: 8,
          cycleLife: 2000,
        },
      },
      charging: {
        create: [
          {
            connectorType: "CCS2",
            maxDcKw: 250,
            maxAcKw: 11,
            chargingStandard: "CCS",
          },
          {
            connectorType: "Type 2",
            maxDcKw: null,
            maxAcKw: 11,
            chargingStandard: "IEC 62196",
          },
        ],
      },
    },
  });

  // ─── 10. BYD Dolphin ───────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "byd-dolphin" },
    update: {},
    create: {
      brand: "BYD", model: "Dolphin", variant: "Standard Range",
      slug: "byd-dolphin", year: 2024, powertrain: "BEV",
      bodyType: "Hatchback", segment: "B", country: "China",
      availableInPk: true, pricePkrMin: 6500000, pricePkrMax: 7500000,
      description: "Sporty compact hatchback with BYD Blade Battery. Fun to drive city EV.",
      specs: { create: {
        rangeWltp: 427, rangeRealWorld: 380, batteryCapKwh: 44.9,
        batteryType: "LFP Blade", batteryPackVolt: 400,
        chargingAcKw: 7, chargingDcKw: 60, chargingTime080: "29 min",
        motorPowerKw: 70, torqueNm: 180, driveType: "FWD",
        topSpeed: 150, accel0100: 8.5, efficiencyWhKm: 119, weight: 1490,
        platform: "e-Platform 3.0", coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "LFP Blade", capacityKwh: 44.9, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 3000, degradationRate: 1.5, warrantyYears: 8, cycleLife: 5000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 60, maxAcKw: 7, chargingStandard: "CCS" },
        { connectorType: "Type 2", maxDcKw: null, maxAcKw: 7, chargingStandard: "IEC 62196" },
      ]},
    },
  });

  // ─── 11. MG4 EV ────────────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "mg-4-ev" },
    update: {},
    create: {
      brand: "MG", model: "4 EV", variant: "Trophy",
      slug: "mg-4-ev", year: 2024, powertrain: "BEV",
      bodyType: "Hatchback", segment: "C", country: "China",
      availableInPk: false, pricePkrMin: 9000000, pricePkrMax: 11000000,
      description: "Sporty compact EV on the MSP platform. Expected in Pakistan 2025.",
      specs: { create: {
        rangeWltp: 519, rangeRealWorld: 430, batteryCapKwh: 64,
        batteryType: "NMC", batteryPackVolt: 400,
        chargingAcKw: 11, chargingDcKw: 150, chargingTime080: "27 min",
        motorPowerKw: 150, torqueNm: 250, driveType: "RWD",
        topSpeed: 160, accel0100: 7.7, efficiencyWhKm: 143, weight: 1685,
        platform: "MSP", coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 64, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 1500, degradationRate: 2.0, warrantyYears: 7, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 150, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 12. Kia EV6 ───────────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "kia-ev6" },
    update: {},
    create: {
      brand: "Kia", model: "EV6", variant: "GT-Line",
      slug: "kia-ev6", year: 2024, powertrain: "BEV",
      bodyType: "SUV", segment: "D", country: "South Korea",
      availableInPk: false, pricePkrMin: 16000000, pricePkrMax: 20000000,
      description: "Premium sporty crossover on 800V E-GMP platform. Ultra-fast charging.",
      specs: { create: {
        rangeWltp: 528, rangeRealWorld: 450, batteryCapKwh: 77.4,
        batteryType: "NMC", batteryPackVolt: 800,
        chargingAcKw: 11, chargingDcKw: 233, chargingTime080: "18 min",
        motorPowerKw: 168, torqueNm: 350, driveType: "RWD",
        topSpeed: 185, accel0100: 7.3, efficiencyWhKm: 161, weight: 1960,
        platform: "E-GMP", coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 77.4, voltage: 800,
        cellFormat: "pouch", thermalManagement: "liquid",
        fastChargeCycles: 1500, degradationRate: 2.0, warrantyYears: 7, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 233, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 13. Chery Omoda E5 ────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "chery-omoda-e5" },
    update: {},
    create: {
      brand: "Chery", model: "Omoda E5", variant: "Premium",
      slug: "chery-omoda-e5", year: 2024, powertrain: "BEV",
      bodyType: "SUV", segment: "C", country: "China",
      availableInPk: true, pricePkrMin: 8000000, pricePkrMax: 9500000,
      description: "Stylish compact SUV with ADAS. Growing presence in Pakistan via Chery dealers.",
      specs: { create: {
        rangeWltp: 430, rangeRealWorld: 390, batteryCapKwh: 61.1,
        batteryType: "NMC", batteryPackVolt: 400,
        chargingAcKw: 7, chargingDcKw: 80, chargingTime080: "35 min",
        motorPowerKw: 150, torqueNm: 340, driveType: "FWD",
        topSpeed: 172, accel0100: 7.6, efficiencyWhKm: 158, weight: 1750,
        coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 61.1, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 1500, warrantyYears: 8, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 80, maxAcKw: 7, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 14. Toyota bZ4X ───────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "toyota-bz4x" },
    update: {},
    create: {
      brand: "Toyota", model: "bZ4X", variant: "AWD",
      slug: "toyota-bz4x", year: 2024, powertrain: "BEV",
      bodyType: "SUV", segment: "D", country: "Japan",
      availableInPk: false, pricePkrMin: 13000000, pricePkrMax: 15000000,
      description: "Toyota's first dedicated BEV SUV. Reliable Japanese EV with e-TNGA platform.",
      specs: { create: {
        rangeWltp: 466, rangeRealWorld: 400, batteryCapKwh: 71.4,
        batteryType: "NMC", batteryPackVolt: 400,
        chargingAcKw: 11, chargingDcKw: 150, chargingTime080: "30 min",
        motorPowerKw: 160, torqueNm: 337, driveType: "AWD",
        topSpeed: 160, accel0100: 7.7, efficiencyWhKm: 175, weight: 2085,
        platform: "e-TNGA", coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 71.4, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 1500, warrantyYears: 10, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 150, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 15. BYD Atto 5 ───────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "byd-atto-5" },
    update: {},
    create: {
      brand: "BYD", model: "Atto 5", variant: "Standard",
      slug: "byd-atto-5", year: 2025, powertrain: "BEV",
      bodyType: "SUV", segment: "D", country: "China",
      availableInPk: false, pricePkrMin: 10500000, pricePkrMax: 12000000,
      description: "BYD's latest mid-size SUV on e-Platform 3.0. Expected in Pakistan 2025.",
      specs: { create: {
        rangeWltp: 500, rangeRealWorld: 450, batteryCapKwh: 76.8,
        batteryType: "LFP Blade", batteryPackVolt: 400,
        chargingAcKw: 11, chargingDcKw: 150, chargingTime080: "27 min",
        motorPowerKw: 160, torqueNm: 310, driveType: "FWD",
        topSpeed: 175, accel0100: 7.5, efficiencyWhKm: 168, weight: 1900,
        platform: "e-Platform 3.0", coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "LFP Blade", capacityKwh: 76.8, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 3000, warrantyYears: 8, cycleLife: 5000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 150, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 16. Proton e.50 ───────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "proton-e50" },
    update: {},
    create: {
      brand: "Proton", model: "e.50", variant: "Standard",
      slug: "proton-e50", year: 2024, powertrain: "BEV",
      bodyType: "Sedan", segment: "C", country: "Malaysia",
      availableInPk: false, pricePkrMin: 7500000, pricePkrMax: 9000000,
      description: "Malaysian EV sedan based on Geely platform. Potential import to Pakistan.",
      specs: { create: {
        rangeWltp: 440, rangeRealWorld: 390, batteryCapKwh: 49,
        batteryType: "NMC", batteryPackVolt: 400,
        chargingAcKw: 11, chargingDcKw: 80, chargingTime080: "30 min",
        motorPowerKw: 150, torqueNm: 230, driveType: "FWD",
        topSpeed: 170, accel0100: 7.9, efficiencyWhKm: 138, weight: 1650,
        coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 49, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        warrantyYears: 8, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 80, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  // ─── 17. Volvo EX30 ───────────────────────────────────────────────────
  await prisma.evModel.upsert({
    where: { slug: "volvo-ex30" },
    update: {},
    create: {
      brand: "Volvo", model: "EX30", variant: "Single Motor",
      slug: "volvo-ex30", year: 2024, powertrain: "BEV",
      bodyType: "SUV", segment: "B", country: "China",
      availableInPk: false, pricePkrMin: 12000000, pricePkrMax: 14000000,
      description: "Volvo's smallest and most affordable EV. Premium compact SUV.",
      specs: { create: {
        rangeWltp: 480, rangeRealWorld: 410, batteryCapKwh: 69,
        batteryType: "NMC", batteryPackVolt: 400,
        chargingAcKw: 11, chargingDcKw: 153, chargingTime080: "26 min",
        motorPowerKw: 200, torqueNm: 343, driveType: "RWD",
        topSpeed: 180, accel0100: 5.7, efficiencyWhKm: 158, weight: 1793,
        coolingSystem: "liquid",
      }},
      battery: { create: {
        chemistry: "NMC", capacityKwh: 69, voltage: 400,
        cellFormat: "prismatic", thermalManagement: "liquid",
        fastChargeCycles: 1500, warrantyYears: 8, cycleLife: 2000,
      }},
      charging: { create: [
        { connectorType: "CCS2", maxDcKw: 153, maxAcKw: 11, chargingStandard: "CCS" },
      ]},
    },
  });

  console.log("  17 EV models seeded");

  // ─── Sample Listings ────────────────────────────────────────────────────
  await prisma.listing.createMany({
    data: [
      {
        userId: demo.id,
        evModelId: atto3.id,
        price: 8900000,
        year: 2024,
        mileage: 8000,
        city: "Lahore",
        batteryHealth: 98,
        condition: "USED",
        description: "BYD Atto 3 in excellent condition. Single owner, solar charged.",
      },
      {
        userId: demo.id,
        evModelId: mgZs.id,
        price: 9200000,
        year: 2024,
        mileage: 12000,
        city: "Karachi",
        batteryHealth: 96,
        condition: "USED",
        description: "MG ZS EV with full service history. AC charging only.",
      },
      {
        userId: admin.id,
        evModelId: bydSeal.id,
        price: 13500000,
        year: 2024,
        mileage: 3000,
        city: "Islamabad",
        batteryHealth: 99,
        condition: "USED",
        description: "Almost new BYD Seal. Performance AWD variant.",
      },
      {
        userId: demo.id,
        evModelId: lumin.id,
        price: 2900000,
        year: 2024,
        mileage: 5000,
        city: "Lahore",
        batteryHealth: 97,
        condition: "USED",
        description: "Perfect city car. Very low running cost with solar charging.",
      },
      {
        userId: admin.id,
        evModelId: tesla3.id,
        price: 16500000,
        year: 2023,
        mileage: 15000,
        city: "Islamabad",
        batteryHealth: 95,
        condition: "USED",
        description: "Imported Tesla Model 3 LR. CCS2 adapter included.",
      },
    ],
  });

  console.log("  5 listings seeded");

  // ─── Charging Stations (Pakistan) — expanded for Trip Planner coverage ──
  await prisma.chargingStation.createMany({
    data: [
      // ── Lahore ──────────────────────────────────────────────────────────
      {
        name: "LESCO EV Hub - Gulberg",
        latitude: 31.5204, longitude: 74.3587,
        network: "LESCO", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 60, city: "Lahore", country: "Pakistan",
        pricePerKwh: 65, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 3, liveStatus: "OPERATIONAL",
        address: "MM Alam Rd, Gulberg III, Lahore",
      },
      {
        name: "BYD Service Center - DHA Lahore",
        latitude: 31.4697, longitude: 74.4058,
        network: "BYD", connectorTypes: "CCS2,Type 2,GB/T",
        maxPowerKw: 80, city: "Lahore", country: "Pakistan",
        pricePerKwh: 70, operationalHours: "08:00-22:00",
        totalSpots: 3, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "DHA Phase 5, Lahore",
      },
      {
        name: "NTDC Solar Hub - M2 Motorway Lahore",
        latitude: 31.6430, longitude: 74.2880,
        network: "NTDC", connectorTypes: "CCS2,GB/T,Type 2",
        maxPowerKw: 100, city: "Lahore", country: "Pakistan",
        pricePerKwh: 60, operationalHours: "24/7",
        totalSpots: 6, availableSpots: 4, liveStatus: "OPERATIONAL",
        address: "M-2 Motorway Lahore Toll Plaza",
      },
      // ── Islamabad / Rawalpindi ───────────────────────────────────────────
      {
        name: "PSO Green Station - Blue Area",
        latitude: 33.7294, longitude: 73.0931,
        network: "PSO", connectorTypes: "CCS2,CHAdeMO,Type 2",
        maxPowerKw: 120, city: "Islamabad", country: "Pakistan",
        pricePerKwh: 68, operationalHours: "24/7",
        totalSpots: 5, availableSpots: 5, liveStatus: "OPERATIONAL",
        address: "Blue Area, Islamabad",
      },
      {
        name: "Total Parco EV Station - Rawalpindi",
        latitude: 33.5651, longitude: 73.0169,
        network: "Total Parco", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 60, city: "Rawalpindi", country: "Pakistan",
        pricePerKwh: 65, operationalHours: "06:00-24:00",
        totalSpots: 2, availableSpots: 1, liveStatus: "BUSY",
        address: "GT Road, Rawalpindi",
      },
      // ── Karachi ──────────────────────────────────────────────────────────
      {
        name: "Shell Recharge - Clifton",
        latitude: 24.8138, longitude: 67.0292,
        network: "Shell Recharge", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 150, city: "Karachi", country: "Pakistan",
        pricePerKwh: 75, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 4, liveStatus: "OPERATIONAL",
        address: "Clifton Block 4, Karachi",
      },
      {
        name: "PSO EV Hub - DHA Karachi",
        latitude: 24.7892, longitude: 67.0672,
        network: "PSO", connectorTypes: "CCS2,CHAdeMO,Type 2",
        maxPowerKw: 120, city: "Karachi", country: "Pakistan",
        pricePerKwh: 72, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 3, liveStatus: "OPERATIONAL",
        address: "DHA Phase 8, Karachi",
      },
      // ── M-9 / Hub (Karachi-Hyderabad corridor) ──────────────────────────
      {
        name: "PSO M-9 Motorway Stop",
        latitude: 25.2200, longitude: 67.5000,
        network: "PSO", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 80, city: "Hub", country: "Pakistan",
        pricePerKwh: 70, operationalHours: "24/7",
        totalSpots: 3, availableSpots: 3, liveStatus: "OPERATIONAL",
        address: "M-9 Motorway, Hub Chowki Rest Area",
      },
      // ── Hyderabad ────────────────────────────────────────────────────────
      {
        name: "HESCO EV Station - Hyderabad",
        latitude: 25.3960, longitude: 68.3578,
        network: "HESCO", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 60, city: "Hyderabad", country: "Pakistan",
        pricePerKwh: 62, operationalHours: "08:00-22:00",
        totalSpots: 2, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "Auto Bahn Road, Hyderabad",
      },
      // ── Multan ───────────────────────────────────────────────────────────
      {
        name: "PSO EV Hub - Multan",
        latitude: 30.1575, longitude: 71.5249,
        network: "PSO", connectorTypes: "CCS2,CHAdeMO,Type 2",
        maxPowerKw: 100, city: "Multan", country: "Pakistan",
        pricePerKwh: 65, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 3, liveStatus: "OPERATIONAL",
        address: "Nishtar Road, Multan",
      },
      {
        name: "Total Parco - Multan Bypass",
        latitude: 30.2350, longitude: 71.4800,
        network: "Total Parco", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 60, city: "Multan", country: "Pakistan",
        pricePerKwh: 65, operationalHours: "06:00-24:00",
        totalSpots: 2, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "Multan-Shujabad Bypass",
      },
      // ── M-3 Motorway (Lahore-Abdul Hakam) ───────────────────────────────
      {
        name: "NTDC M-3 Motorway Rest Area",
        latitude: 30.7500, longitude: 72.3000,
        network: "NTDC", connectorTypes: "CCS2,GB/T,Type 2",
        maxPowerKw: 100, city: "Faisalabad", country: "Pakistan",
        pricePerKwh: 60, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 4, liveStatus: "OPERATIONAL",
        address: "M-3 Motorway, Chichawatni Rest Area",
      },
      // ── Faisalabad ───────────────────────────────────────────────────────
      {
        name: "MG EV Centre - Faisalabad",
        latitude: 31.4504, longitude: 73.1350,
        network: "MG Motors", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 50, city: "Faisalabad", country: "Pakistan",
        pricePerKwh: 65, operationalHours: "09:00-21:00",
        totalSpots: 2, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "Canal Road, Faisalabad",
      },
      // ── M-2 Motorway stops (Lahore-Islamabad) ───────────────────────────
      {
        name: "NTDC M-2 Toll Plaza North",
        latitude: 32.5000, longitude: 73.8000,
        network: "NTDC", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 100, city: "Gujranwala", country: "Pakistan",
        pricePerKwh: 60, operationalHours: "24/7",
        totalSpots: 4, availableSpots: 4, liveStatus: "OPERATIONAL",
        address: "M-2 Motorway, Kalar Kahar Rest Area",
      },
      // ── Peshawar ─────────────────────────────────────────────────────────
      {
        name: "PSO EV Hub - Peshawar",
        latitude: 34.0151, longitude: 71.5249,
        network: "PSO", connectorTypes: "CCS2,CHAdeMO,Type 2",
        maxPowerKw: 80, city: "Peshawar", country: "Pakistan",
        pricePerKwh: 68, operationalHours: "08:00-22:00",
        totalSpots: 3, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "University Road, Peshawar",
      },
      // ── Bahawalpur ───────────────────────────────────────────────────────
      {
        name: "PSO EV Point - Bahawalpur",
        latitude: 29.3956, longitude: 71.6836,
        network: "PSO", connectorTypes: "CCS2,Type 2",
        maxPowerKw: 60, city: "Bahawalpur", country: "Pakistan",
        pricePerKwh: 62, operationalHours: "24/7",
        totalSpots: 2, availableSpots: 2, liveStatus: "OPERATIONAL",
        address: "Circular Road, Bahawalpur",
      },
    ],
  });

  console.log("  16 charging stations seeded");

  // ─── Sample Reviews ────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      {
        evModelId: atto3.id,
        authorId: demo.id,
        rating: 4,
        pros: "Blade battery safety, good range, comfortable ride, great value",
        cons: "Slow DC charging (80kW max), infotainment can be laggy",
        reviewText:
          "Best value EV in Pakistan right now. The Blade Battery gives peace of mind in summer heat. Range easily lasts a week of city driving.",
      },
      {
        evModelId: mgZs.id,
        authorId: demo.id,
        rating: 3,
        pros: "Affordable, decent range for city, familiar SUV form factor",
        cons: "Smaller battery, slower charging, older platform, no ADAS",
        reviewText:
          "Good entry-level EV but the Atto 3 has overtaken it in value. Still decent for daily city commute.",
      },
      {
        evModelId: ioniq5.id,
        authorId: admin.id,
        rating: 5,
        pros: "800V fast charging, premium build, V2L capability, spacious",
        cons: "Expensive, limited service network in Pakistan",
        reviewText:
          "The 800V architecture is a game changer. 10-80% in 18 minutes is incredible. Premium feel throughout.",
      },
    ],
  });

  console.log("  3 reviews seeded");

  // ─── Sample Articles ───────────────────────────────────────────────────
  await prisma.article.createMany({
    data: [
      {
        title: "BYD to Begin Local Assembly in Pakistan by 2026",
        slug: "byd-local-assembly-pakistan-2026",
        excerpt: "BYD plans 25,000 units/year assembly capacity in Pakistan.",
        content:
          "BYD has confirmed plans to begin local assembly of electric vehicles in Pakistan by 2026, with an initial capacity of approximately 25,000 units per year. This move is expected to significantly reduce EV prices in the country.",
        category: "NEWS",
        published: true,
        publishedAt: new Date("2025-03-01"),
      },
      {
        title: "BYD Atto 3 vs MG ZS EV: Pakistan's Best Value EV?",
        slug: "byd-atto-3-vs-mg-zs-ev-comparison",
        excerpt: "Head-to-head comparison of Pakistan's two most popular EVs.",
        content:
          "We compare the BYD Atto 3 and MG ZS EV across range, battery technology, charging speed, features, and total cost of ownership in the Pakistani market.",
        category: "COMPARISON",
        published: true,
        publishedAt: new Date("2025-02-15"),
      },
      {
        title: "LFP vs NMC: Which Battery Chemistry is Better for Pakistan?",
        slug: "lfp-vs-nmc-battery-pakistan",
        excerpt: "How Pakistan's hot climate affects battery chemistry choice.",
        content:
          "LFP batteries handle heat better and last longer, while NMC offers higher energy density. We analyze which chemistry makes more sense for Pakistani EV buyers.",
        category: "GUIDE",
        published: true,
        publishedAt: new Date("2025-01-20"),
      },
      {
        title: "Solar Charging Your EV in Pakistan: Complete Guide",
        slug: "solar-charging-ev-pakistan-guide",
        excerpt: "How to charge your EV with solar panels in Pakistan.",
        content:
          "With 300+ sunny days per year, Pakistan is ideal for solar EV charging. We cover system sizing, costs, net metering, and the best setups for different EVs.",
        category: "TUTORIAL",
        published: true,
        publishedAt: new Date("2025-02-01"),
      },
    ],
  });

  console.log("  4 articles seeded");

  console.log("\nSeed complete!");
  console.log({
    users: 2,
    evModels: 9,
    listings: 5,
    chargingStations: 16,
    reviews: 3,
    articles: 4,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
