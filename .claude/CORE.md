# 🏎️ eWheelz — CORE SYSTEM (v2.0)

---

## 🎯 Identity

**Mission**
Pakistan’s #1 WhatsApp-first EV marketplace.

**Wedge**
Every listing has:
- Deal Grade (price intelligence)
- Battery Health Score (trust layer)

**Market Reality (Non-Negotiable)**
- No listings = no product
- Pakistan market runs on WhatsApp, not forms
- Supply > Features (always prioritize inventory)

---

## ⚠️ Priority Order (Always Follow)

1. Listings & Marketplace Liquidity
2. WhatsApp Conversion
3. Deal + Battery Intelligence
4. UI/UX Polish
5. Secondary Tools

❗ If a feature does NOT improve (1) or (2), deprioritize it.

---

## 🧠 Core Systems (Implementation Truth)

| System | Location | Status | Logic |
|-------|----------|--------|-------|
| WhatsApp NLP | `src/lib/bot-parser.ts` | Active | Regex extraction: Brand, Model, Year, Price, Odometer |
| Deal Grading | `/api/deal-check` | Active | 100-pt scale: +15 if price <10% below avg; penalties for missing data |
| Battery Health | `/api/battery-health` | Active | (Retention×0.45) + (Habits×0.25) + (Thermal×0.15) + (Electrical×0.15) |
| Trip Optimizer | `src/lib/tripPlanner.ts` | Active | Greedy pathfinding, 95% safety buffer, -20% range at 45°C |
| Station Scoring | `src/lib/communityDb.ts` | Active | (Available + Busy×0.5) / Total (7-day rolling) |

---

## ⚖️ Regulatory Layer (SRO 61/2026)

**Strict Enforcement Required**

- ❌ Personal Baggage scheme = REMOVED
- ✅ Allowed: Gift, Transfer of Residence (TR)

**Rules**

- Waiting Period: **850 days per CNIC**
- Resale Ban: **365 days (no ownership transfer)**
- Same-Country Rule: Import must match residence country
- Duty Rule: EVs under **$30,000 = 0% Customs Duty**

❗ Any import-related UI MUST reflect these rules

---

## 🧮 Critical Logic (Must Never Drift)

### Battery Health Score

Score = (Retention * 0.45)
+ (Habits * 0.25)
+ (Thermal * 0.15)
+ (Electrical * 0.15)


### Deal Grade Rules
- +15 → Price <10% below market avg
- Penalize missing battery data
- Output tags:
  - 🔥 Hot
  - ✅ Good
  - 📊 Fair
  - ⚠️ High

### Range Adjustment
- Pakistan heat (45°C): **-20% effective range**

---

## 🏗️ Technical Stack

- Web: Next.js 15 (App Router), TypeScript, Tailwind
- Mobile: Expo (shared logic in `src/lib`)
- DB: Neon PostgreSQL + Prisma
- Auth: NextAuth
- Maps: Mapbox
- Analytics: PostHog

---

## 🗄️ Core Data Model

### Listing
- status: PENDING | ACTIVE
- dealGrade
- batteryHealthScore

### EVModel
- source of truth for:
  - avgPrice
  - battery
  - specs

---

## 🌐 i18n Rules

- Use `next-intl`
- All strings → `messages/*.json`
- ❌ No hardcoded UI text

---

## 🛠️ Execution Rules (STRICT)

- Always check existing code before writing
- Prefer extending `src/lib` utilities
- No full file rewrites (surgical edits only)
- Maintain type safety (must pass `npm run build`)
- Avoid duplication of logic

---

## 📦 Marketplace Rules

- Listings must NOT remain empty → use:
  - scraper fallback
  - WhatsApp ingestion
- New listings → default ACTIVE (no manual bottleneck)
- Always show data (no silent null rendering)

---

## 📲 WhatsApp-First Constraint

- WhatsApp = primary interface
- Forms = secondary
- All seller flows should be convertible to chat

---

## 🚫 Anti-Patterns (Never Do)

- Building tools before listings exist
- Rendering empty pages without fallback
- Creating features not tied to Listings or WhatsApp
- Hiding listings behind navigation friction
- Rewriting existing utilities instead of extending
- Over-engineering UI before supply exists

---

## ⚡ Product Reality Layer

- You are not building tools → you are building a marketplace
- Tools exist ONLY to:
  - increase trust
  - improve conversion
- Battery Health = core differentiator
- Deal Grade = decision trigger

---

## 🔁 Workflow Rules

After any meaningful change:

1. Verify types:
npm run build


2. Optimize context:
/compact


---

## 📂 Dependency Rule

Claude MUST load:

- `.claude/CORE.md` (this file)
- `.claude/skills/*.md`

These define ALL behavior and logic.

---

## 🧪 Guiding Principle

> Maximize real listings and WhatsApp conversions.
> Everything else is secondary.