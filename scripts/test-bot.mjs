// Quick local test — node scripts/test-bot.mjs
// Tests the parser + engine without needing WhatsApp

import { parseMessage } from "../src/lib/bot-parser.ts";

const tests = [
  "byd atto 3 2023 45000km karachi",
  "byd atto 3 2023 45000km karachi dealer asking 8.5M",
  "mg zs ev 2022 lahore 35k km",
  "tesla model 3 2022 islamabad dealer asking 12M orig 560km now 490km",
  "changan lumin 2024 karachi",
  "hello",
];

for (const t of tests) {
  const r = parseMessage(t);
  console.log(`\nInput: "${t}"`);
  console.log(`  brand=${r.brand} model=${r.model} year=${r.year} km=${r.odometer} city=${r.city}`);
  if (r.dealerPrice) console.log(`  dealerPrice=PKR ${r.dealerPrice.toLocaleString()}`);
  if (r.originalRange) console.log(`  battery: orig=${r.originalRange}km now=${r.currentRange}km`);
}
