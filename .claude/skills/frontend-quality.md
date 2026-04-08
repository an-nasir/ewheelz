
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
