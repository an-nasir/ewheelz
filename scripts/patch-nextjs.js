// scripts/patch-nextjs.js — Patch Next.js 14.2.x build bugs for dynamic API routes
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'build', 'utils.js');
if (!fs.existsSync(file)) { console.log('patch-nextjs: file not found'); process.exit(0); }

let src = fs.readFileSync(file, 'utf8');
let changed = false;

// Patch 1: guard patchFetch call
const p1 = 'ComponentMod.patchFetch();';
const p1f = 'if (typeof ComponentMod.patchFetch === "function") ComponentMod.patchFetch();';
if (src.includes(p1)) { src = src.replace(p1, p1f); changed = true; console.log('patch 1 applied'); }

// Patch 2: guard staticGenerationAsyncStorage - if undefined, return empty paths (API routes)
const p2 = 'return _staticgenerationasyncstoragewrapper.StaticGenerationAsyncStorageWrapper.wrap(ComponentMod.staticGenerationAsyncStorage, {';
const p2f = 'if (!ComponentMod.staticGenerationAsyncStorage) { return { paths: [], fallback: false, encodedPaths: [] }; }\n    return _staticgenerationasyncstoragewrapper.StaticGenerationAsyncStorageWrapper.wrap(ComponentMod.staticGenerationAsyncStorage, {';
if (!src.includes('if (!ComponentMod.staticGenerationAsyncStorage)') && src.includes(p2)) {
  src = src.replace(p2, p2f); changed = true; console.log('patch 2 applied');
}

if (changed) { fs.writeFileSync(file, src, 'utf8'); console.log('✅ all patches applied'); }
else { console.log('already patched'); }
