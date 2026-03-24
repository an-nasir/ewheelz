/**
 * prisma/seed-runner.mjs
 * Runs the seed using our custom SQLite client via ts-node
 * Usage: node --experimental-sqlite --input-type=module < seed-runner.mjs
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

const tsNodePath = "./node_modules/.bin/ts-node";

if (!existsSync(tsNodePath)) {
  console.error("ts-node not found");
  process.exit(1);
}

try {
  execSync(
    `${tsNodePath} --compiler-options '{"module":"CommonJS","esModuleInterop":true}' prisma/seed.ts`,
    {
      stdio: "inherit",
      env: { ...process.env },
      cwd: process.cwd(),
    }
  );
} catch (e) {
  console.error("Seed failed:", e.message);
  process.exit(1);
}
