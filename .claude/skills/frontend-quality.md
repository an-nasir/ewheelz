
# Frontend Quality — JetBrains Level UI

UI must feel alive, premium, modern.

Rules:

* NO dark theme
* NO static UI
* NO boring cards

Must have:

* gradient cards
* hover lift + scale
* smooth animation (150–250ms)
* soft shadows
* cursor-reactive glow (where possible)

Style:

* minimal clutter
* strong hierarchy

Reject:

* table-heavy layouts
* flat cards
* outdated marketplace look

---

## ✅ Patterns That Work: Listing Detail + Similar Nav

**Full-width hero + 2-column below:**
- Hero is `w-full h-380px` with title/price overlaid at bottom
- Below: `grid lg:grid-cols-[1fr_340px]` (left stats, right sidebar: contact + similar + safety)
- Sidebar is `lg:sticky lg:top-20` (follows scroll)
- Similar listings in sidebar as 5-item vertical strip (not bottom carousel)
- "Next [Brand]" button jumps directly to next car (not "back to browse")

**Pre-fill patterns:**
- Pass `evSlug`, `year`, `odometer`, `city`, `price` as URL params from detail page
- `ValuationClient` reads `useSearchParams()` and auto-selects EV dropdown
- Results show verdict banner: 🔥 Hot / ✅ Fair / ⚠️ Overpriced with PKR diff

**Image handling (proven working 2026-04-08):**
- Scraper extracts `data-src` from `<li>` in gallery `<ul class="light-gallery">`
- Frontend routes external URLs through `/api/image-proxy?url=<encoded>`
- Proxy adds `Referer: https://www.pakwheels.com/` header to bypass hotlink blocks
- Fall back to brand-specific Unsplash photos (BYD, MG, Hyundai, Tesla, etc.)
- On image load error, swap to fallback URL via `onError={() => setImgSrc(fallback)}`

**Deal grade badges:**
- Inline on cards + overlay on images: `<span className="text-[10px] px-2 py-0.5 rounded-full" style={{ bg, color }}>`
- Use `DEAL_CFG` lookup table with label + colors
- Show on both grid cards and detail page hero

---

## ⛔ NEVER: IIFE in JSX

**Never use immediately-invoked function expressions inside JSX.**

This pattern WILL cause `TypeError: Cannot read properties of undefined (reading 'call')` at runtime in Next.js App Router — even if the build passes.

```tsx
// ❌ BROKEN — causes runtime chunk loading error
{condition && (() => {
  const x = compute();
  return <span>{x}</span>;
})()}
```

**Always use a named function defined outside JSX:**

```tsx
// ✅ CORRECT
function MyBadge({ value }: { value: string }) {
  const x = compute(value);
  return <span>{x}</span>;
}

// In JSX:
{condition && <MyBadge value={val} />}
```

Or a simple ternary/expression if the logic is trivial:

```tsx
// ✅ also fine for simple cases
{health != null && (
  <span style={{ color: health > 80 ? "green" : "red" }}>
    {health}%
  </span>
)}
```
