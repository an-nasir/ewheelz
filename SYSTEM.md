# eWheelz — Complete System Documentation
> Feed this file to any LLM to get full project context. Last updated: 2026-03-26.

---

## 1. Project Overview

**eWheelz** is Pakistan's first dedicated EV intelligence platform — an MVP modeled after PakWheels but 100% focused on electric vehicles, batteries, and charging infrastructure.

| Field | Value |
|-------|-------|
| **Domain** | ewheelz.vercel.app (no custom domain yet) |
| **Market** | Pakistan — 220M people, rapidly growing EV adoption |
| **Language** | English + Urdu (RTL supported via next-intl) |
| **Stage** | MVP / pre-revenue |
| **Stack** | Next.js 14 App Router, TypeScript, Tailwind, Prisma, SQLite (dev) / PostgreSQL Neon (prod) |

### Core Value Propositions
1. EV specification database (17+ models tracked)
2. Real-world range data for Pakistan conditions (load shedding, heat)
3. Charging station map (16+ live stations)
4. Financing tools (EMI calculator with 5 banks)
5. Marketplace (buy/sell EVs — anonymous listings)
6. Lead generation for EV dealers

---

## 2. Architecture

```
Browser
  └── Next.js 14 App Router (Vercel)
        ├── [locale]/ routing (en | ur) via next-intl v4
        ├── /api/ routes (Next.js Route Handlers)
        ├── Prisma ORM → SQLite (dev) / Neon PostgreSQL (prod)
        ├── NextAuth v4 (Credentials + Google OAuth)
        └── Resend (transactional email)
```

### Key Architectural Decisions

| Decision | Reason |
|----------|--------|
| `localePrefix: 'always'` | All routes are `/en/...` or `/ur/...` |
| `usePathname()` from `@/navigation` | Returns path WITHOUT locale prefix |
| `useLocale()` from `next-intl` | Use this to get current locale, NOT pathname parsing |
| Root `src/app/layout.tsx` returns bare `children` | Locale layout provides `<html><body>` |
| Anonymous listings | `userId` optional on Listing model, `contactPhone` captures seller |
| Resend emails are non-blocking | All email sends are try/catch fire-and-forget |
| Price alerts activate via Vercel Cron | Runs 9am PKT daily, checks DB, sends emails |

### i18n Setup
- `src/navigation.ts` — exports `Link`, `usePathname`, `useRouter` (locale-aware)
- `src/i18n/request.ts` — next-intl v4: uses `await requestLocale` (NOT `locale` directly)
- `messages/en.json` — English strings
- `messages/ur.json` — Urdu strings (RTL)
- Layout sets `dir="rtl"` and Noto Nastaliq Urdu font when `locale === 'ur'`

---

## 3. Database Schema (Prisma)

**Dev DB:** `prisma/dev.db` (SQLite)
**Prod DB:** Neon PostgreSQL via `DATABASE_URL`

### Models

#### User
```
id, email (unique), name?, image?, phone?, city?
role: USER | DEALER | ADMIN
password? (for credentials auth)
isPremium, stripeCustomerId?, subscriptionId?
→ accounts[], sessions[], listings[], reviews[], savedEVs[], savedStations[]
```

#### EvModel
```
id, brand, model, variant?, slug (unique), year
powertrain: BEV | PHEV | REEV | HEV
bodyType?, segment?, country?
availableInPk: Boolean  ← KEY FIELD for availability alerts
pricePkrMin?, pricePkrMax?, imageUrl?, description?
→ specs (EvSpec), battery (EvBattery), charging (EvCharging[])
→ listings[], reviews[], affiliateLinks[]
```

#### EvSpec (1:1 with EvModel)
```
rangeWltp?, rangeRealWorld?, batteryCapKwh?, batteryType?
chargingAcKw?, chargingDcKw?, chargingTime080?, chargingTime1080?
motorPowerKw?, torqueNm?, driveType?, topSpeed?, accel0100?
efficiencyWhKm?, weight?, platform?, coolingSystem?
```

#### EvBattery (1:1 with EvModel)
```
chemistry?, capacityKwh?, voltage?, cellFormat?
thermalManagement?, fastChargeCycles?, degradationRate?
warrantyYears?, cycleLife?
```

#### Listing (Marketplace)
```
id, userId? (null = anonymous), evModelId? (null = unlisted model)
evName? (denormalised for anonymous listings)
price, year, mileage?, city
batteryHealth?, condition: NEW | USED | CERTIFIED
description?, images? (JSON array of URLs)
contactName?, contactPhone?, contactWhatsapp?
status: PENDING | ACTIVE | SOLD | EXPIRED
featured: Boolean
```
> New listings start as PENDING — admin activates manually.

#### PriceAlert
```
id, email, evModelId?, evName?, evSlug?
targetPrice? (null = any drop triggers)
alertType: PRICE_DROP | AVAILABILITY
status: ACTIVE | TRIGGERED | CANCELLED
```
> Cron job at `/api/cron/price-alerts` runs 9am PKT daily and fires emails.

#### NewsletterSubscriber
```
id, email (unique), source?, locale?
source values: "footer" | "article_inline" | "ev_detail" | "peos_result" | "banner"
```

#### Lead
```
id, evModelId?, evName?, name, phone, email?, city?, message?
source: "ev_detail" | "emi_whatsapp" | "compare" | "listing" | ...
status: NEW | CONTACTED | CONVERTED | CLOSED
```

#### Article
```
id, title, slug (unique), excerpt?, content
category: NEWS | REVIEW | GUIDE | TUTORIAL | COMPARISON
imageUrl?, published, publishedAt?
```

#### ChargingStation
```
id, name, latitude, longitude, network?, connectorTypes?
maxPowerKw?, city?, pricePerKwh?, operationalHours?
totalSpots?, availableSpots?, liveStatus?, address?, mapLink?
isOnline, lastUpdated
```

#### AffiliateLink
```
id, evModelId, dealerName, url, utmParams?, clicks (counter)
```

---

## 4. API Routes

All routes in `src/app/api/`.

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handlers (Credentials + Google) |
| `/api/register` | POST | Public | Create new user account |
| `/api/ev-models` | GET | Public | List/filter EV models with specs |
| `/api/ev-models/[id]` | GET | Public | Single EV model detail |
| `/api/listings` | GET | Public | Browse active listings with filters |
| `/api/listings` | POST | Public (anon) | Submit new listing (status=PENDING) |
| `/api/leads` | GET | Public | Count of new leads (admin) |
| `/api/leads` | POST | Public | Submit dealer enquiry / EMI WhatsApp lead |
| `/api/newsletter` | POST | Public | Subscribe email, source-tagged |
| `/api/price-alerts` | POST | Public | Set price drop or availability alert |
| `/api/charging-stations` | GET | Public | List stations with geo filters |
| `/api/compare` | POST | Public | Multi-EV comparison matrix |
| `/api/cost-calculator` | POST | Public | Calculate EV vs petrol cost |
| `/api/range-estimate` | POST | Public | Real-world range estimate for Pakistan |
| `/api/trip-planner` | POST | Public | Route planning with charging stops |
| `/api/community` | GET/POST | Public | Community session reports |
| `/api/batteries` | GET | Public | Battery database |
| `/api/affiliate` | POST | Auth | Track affiliate link click |
| `/api/user` | GET/PATCH | Auth | User profile |
| `/api/dashboard` | GET | Auth | User dashboard data |
| `/api/seed` | POST | Dev only | Seed EV data to DB |
| `/api/cron/sync-stations` | GET | CRON_SECRET | Daily sync of charging stations (2am) |
| `/api/cron/price-alerts` | GET | CRON_SECRET | Daily price/availability alert emails (9am) |
| `/api/webhooks/stripe` | POST | Stripe sig | Stripe payment webhooks |

### Key Request Shapes

**POST /api/leads**
```json
{ "name": "Ahmed", "phone": "03001234567", "evName": "BYD Atto 3",
  "evModelId": "optional", "email": "opt", "city": "opt",
  "message": "opt", "source": "ev_detail" }
```

**POST /api/price-alerts**
```json
{ "email": "user@email.com", "evSlug": "byd-atto-3",
  "evName": "BYD Atto 3", "targetPrice": 11000000,
  "alertType": "PRICE_DROP" | "AVAILABILITY" }
```

**POST /api/listings**
```json
{ "evName": "BYD Atto 3", "price": 11500000, "year": 2024,
  "mileage": 15000, "city": "Lahore", "condition": "USED",
  "contactName": "Ali", "contactPhone": "03001234567",
  "batteryHealth": 94, "description": "opt" }
```

**POST /api/newsletter**
```json
{ "email": "user@email.com", "source": "footer" | "peos_result" | ... }
```

---

## 5. Pages / Routes

All pages in `src/app/[locale]/`.

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Server | Home page — hero with search bar, stat cards, tool grid |
| `/ev` | Server | EV database — filterable grid of all EVs |
| `/ev/[slug]` | Server | EV detail — specs, battery, reviews, price alert, quote form |
| `/compare` | Client | Side-by-side EV comparison tool |
| `/ev-range` | Client | Real-world range calculator for Pakistan |
| `/peos` | Client | 8-question EV readiness quiz → score + email-gated recommendations |
| `/emi-calculator` | Client | EMI calculator (5 banks) with sticky live result + affiliate CTAs |
| `/cost-calculator` | Client | EV vs petrol cost comparison |
| `/trip-planner` | Client | Route planner with charging stops |
| `/charging-map` | Client | Mapbox map of 16+ charging stations |
| `/home-charging` | Static | Home charging guide (wallbox, solar, load shedding) |
| `/listings` | Server | Marketplace — browse EV listings |
| `/listings/post` | Client | 3-step form to sell your EV (anonymous, no auth) |
| `/articles` | Server | EV news & guides list |
| `/articles/[slug]` | Server | Individual article |
| `/for-dealers` | Static | Dealer landing page with pricing plans |
| `/login` | Client | Sign in page |
| `/signup` | Client | Register page |
| `/dashboard` | Server (auth) | User dashboard |
| `/pricing` | Static | Stripe subscription plans |
| `/community` | Client | Community charging sessions |
| `/batteries` | Server | Battery database |
| `/not-found` | Static | Funky 404 with quick links |
| `/error` | Client | Runtime error (500) page |

---

## 6. Components

All in `src/components/`.

| Component | Purpose |
|-----------|---------|
| `NavBar.tsx` | Sticky nav — 2 dropdowns (Explore, Tools) + flat links (News, Listings, For Dealers) + "Sell Your EV" CTA. Uses `useLocale()` for language toggle. |
| `Footer.tsx` | Site footer with newsletter widget |
| `AnimatedHero.tsx` | Full-screen hero with particle canvas, search/filter bar, CTA buttons |
| `PriceAlertModal.tsx` | Modal for PRICE_DROP and AVAILABILITY email alerts |
| `GetQuoteModal.tsx` | Lead capture modal — name/phone/city/message → /api/leads |
| `NewsletterWidget.tsx` | Email capture — `variant="footer"` or `variant="banner"` |
| `WhatsAppBar.tsx` | Floating bottom-right WhatsApp bar — appears after 5s, join group + chat |
| `WhatsAppButton.tsx` | Inline "Contact via WhatsApp" button used on listing cards |
| `MagneticButton.tsx` | Button with magnetic hover effect |
| `GradientCard.tsx` | Card with gradient glow on hover |
| `ScrollReveal.tsx` | Intersection Observer fade-in wrapper |
| `EvIntelligenceToday.tsx` | Live EV stats widget for home page |
| `AnimatedHero.tsx` | Hero with canvas particle animation |
| `LeafletMap.tsx` | Leaflet.js map component (SSR-safe dynamic import) |
| `AffiliateButton.tsx` | Tracks affiliate click before redirect |
| `ChargerReportButtons.tsx` | Community status report for charging stations |
| `CommunityQuickReport.tsx` | Quick station status update form |
| `providers/SessionProvider.tsx` | NextAuth SessionProvider wrapper |
| `providers/AnalyticsProvider.tsx` | Mixpanel init + page view tracking on route changes |

---

## 7. Data Collection Features (Lead Capture Funnel)

All 5 implemented and live:

### 1. WhatsApp Floating Bar (`WhatsAppBar.tsx`)
- Appears 5 seconds after page load (bottom-right)
- Expands to show: "Join EV Community" (group link) + "Ask us anything" (direct chat)
- Env: `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WA_GROUP_URL`
- Tracks: `WhatsApp Group Clicked`, `WhatsApp Chat Clicked`

### 2. Price Drop Alert (`PriceAlertModal.tsx` — `alertType="PRICE_DROP"`)
- On every EV detail page (when `ev.availableInPk === true`)
- Collects: email + optional target price
- Stores in `PriceAlert` table
- Cron fires email when `ev.pricePkrMin <= targetPrice`

### 3. Availability Alert (`PriceAlertModal.tsx` — `alertType="AVAILABILITY"`)
- On EV detail pages when `ev.availableInPk === false`
- Amber banner: "This EV isn't in Pakistan yet — notify me"
- Cron fires email when `ev.availableInPk` flips to `true`

### 4. PEOS Quiz Email Gate (`/peos` page)
- After 8 questions → result shown with blurred recommendations
- Email input unlocks personalised Top 3 EV matches
- Calls `/api/newsletter` with `source: "peos_result"`

### 5. EMI Calculator WhatsApp (`SendToWhatsApp` component in `/emi-calculator`)
- Green "Send this breakdown to WhatsApp" button
- Collects: Pakistani phone number
- On submit: saves as Lead (`source: "emi_whatsapp"`) + opens `wa.me/` with pre-filled message

---

## 8. Environment Variables

From `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth (NextAuth)
NEXTAUTH_SECRET="random-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"  # MUST match actual port!
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=""
OPENCHARGEMMAP_API_KEY=""

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_MIXPANEL_TOKEN=""

# Email (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="eWheelz <hello@ewheelz.pk>"

# Lead Notifications
LEAD_NOTIFICATION_EMAIL="leads@ewheelz.pk"

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER="923001234567"  # Pakistan format, no +
NEXT_PUBLIC_WA_GROUP_URL="https://chat.whatsapp.com/your-invite-link"

# Cron Security
CRON_SECRET=""  # openssl rand -hex 32

# Stripe (future)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

---

## 9. Cron Jobs

Configured in `vercel.json`:

| Job | Schedule | Endpoint | What it does |
|-----|----------|----------|--------------|
| Sync Stations | 2am daily | `/api/cron/sync-stations` | Pulls live data from OpenChargeMap API |
| Price Alerts | 9am daily | `/api/cron/price-alerts` | Checks all ACTIVE PriceAlerts vs current EV prices, sends email via Resend when triggered, marks as TRIGGERED |

**Auth:** Vercel sends `Authorization: Bearer {CRON_SECRET}` header automatically.

---

## 10. Monetization (Current + Planned)

### Current (Plumbing Ready, Not Active)
- Affiliate links on EV detail pages (`/api/affiliate` tracks clicks)
- EMI calculator affiliate CTAs → Meezan, HBL, MCB, BankIslami apply links
- Dealer listing form → `PENDING` status → monetization hook

### Revenue Roadmap

| Month | Revenue Stream | Est. Monthly |
|-------|---------------|--------------|
| 1–2 | Dealer listings (PKR 3,000–5,000/mo) × 30 dealers | PKR 120K |
| 2–3 | Financing referrals (Meezan, HBL) × 50/mo × PKR 8K | PKR 400K |
| 3–4 | Insurance referrals (Jubilee, Adamjee) | PKR 100K |
| 4–6 | Featured listings / promoted dealer spots | PKR 50K |
| 6–9 | EV valuation report (PKR 500/report) | PKR 50K |
| 9–12 | Dealer SaaS (CRM + leads dashboard) | PKR 200K |

**Year 1 conservative target: PKR 520K/month ≈ $1,800 USD MRR**

### Dealer Plans (on `/for-dealers` page)
- **Starter:** Free — 3 listings, WhatsApp button, directory listing
- **Pro:** PKR 4,000/mo — unlimited listings, priority search, lead notifications, analytics
- **Enterprise:** Custom — multi-location, API sync, co-branded content

---

## 11. Deployment

| Service | What | URL |
|---------|------|-----|
| Vercel | Next.js app hosting | ewheelz.vercel.app |
| Neon | PostgreSQL database (free tier) | neon.tech |
| Railway | (planned) background workers | railway.app |
| Cloudflare | (planned) CDN / domain | cloudflare.com |

**Vercel Build Command:** `npx prisma generate && npx prisma db push --accept-data-loss && next build`

---

## 12. Key Dependencies

```json
{
  "next": "^14.2.0",           // App Router
  "next-intl": "^4.8.3",       // i18n (v4 — requestLocale is a Promise!)
  "next-auth": "^4.24.13",     // Auth
  "@prisma/client": "^5.22",   // ORM
  "resend": "^6.9.4",          // Transactional email
  "@next/third-parties": "...", // GoogleAnalytics component
  "mixpanel-browser": "^2.77", // Client analytics
  "stripe": "^20.4.1",         // Payments (future)
  "tailwindcss": "^3.4.0"      // Styling
}
```

---

## 13. Development Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Prisma generate + Next.js build
npm run db:push      # Sync Prisma schema to DB (no migration files)
npm run db:studio    # Prisma Studio GUI on :5555
npm run db:seed      # Seed EV data (17 models)
npm run lint         # ESLint

# Reset everything fresh
rm -rf .next && npm run db:push && npm run dev
```

---

## 14. Known Issues & Technical Debt

| Issue | Severity | Fix |
|-------|----------|-----|
| `seed/route.ts` uses `batteryPackVoltage` (should be `batteryPackVolt`) | Low | Pre-existing, fix field name |
| `.next/types` cache shows `locales` type error | Low | Run `next build` to regenerate |
| Listings page only shows `ACTIVE` status — new anonymous listings are `PENDING` | Medium | Build admin panel to activate listings |
| No image upload for listings | Medium | Integrate Cloudinary or Vercel Blob |
| Google OAuth not configured | Low | Add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |
| Price alert cron emails only send if `RESEND_API_KEY` set | Low | Expected behavior |

---

## 15. 🔴 Devil's Advocate — How This Project Can FAIL

> This section is the most important one. Read before making any decisions.

### Ways It Fails

#### 1. The "Empty Marketplace" Death Spiral
**The problem:** Buyers won't come without listings. Sellers won't list without buyers. This is the classic two-sided marketplace chicken-and-egg that has killed 90% of classified sites.

**Why it's worse here:** Pakistan's EV market has maybe 5,000-10,000 EVs on the road total. That's not a marketplace — that's a WhatsApp group. PakWheels already has this tiny inventory, listed by people who are already on PakWheels.

**The kill:** You launch listings, zero inventory. Users come, see nothing, leave. Never return. Google crawls, sees thin content, ranks you nowhere.

#### 2. WhatsApp + Facebook Already Won
**The brutal truth:** Pakistani EV sellers already have a system that works perfectly:
- Post on Facebook EV Pakistan group (200K+ members)
- Share on 5 WhatsApp groups simultaneously
- Sell in 48 hours, zero fees, direct contact

**Why would they pay PKR 4,000/month for your platform?** "I can sell on Facebook for free in 2 days" is the objection you will hear from every dealer.

**The kill:** Dealers don't need you. Buyers find cars on Facebook. The "platform" adds zero to the transaction.

#### 3. The Spec Sheet Trap
**The problem:** You've built a beautiful spec database. But specs don't make money. No one pays to read specs. Autotrader didn't win by having better specs than Wikipedia — they won by having inventory.

**Current state:** The site is 80% spec content, 20% marketplace. That ratio needs to flip.

**The kill:** High bounce rate, low repeat visits, zero revenue path. You become a free EV Wikipedia that Google scrapes and shows in featured snippets, eliminating the reason to visit.

#### 4. Pakistan-Specific Blockers
- **Payment infrastructure:** Most dealers don't have Stripe/credit cards. PKR 4,000/month subscription sounds small but requires digital payment friction
- **Trust deficit:** Pakistanis don't trust new platforms with money. They trust people they know on WhatsApp
- **Phone-first:** 70% of your traffic is mobile. Complex listings forms fail on mobile data
- **Load shedding:** 4-8 hour daily outages kill "always on" data collection
- **Rupee volatility:** EV prices change weekly due to USD/PKR rate. Your "price history" data is stale within days

#### 5. PakWheels Can Clone This in 2 Weeks
If eWheelz gets any traction, PakWheels (50M users) adds an "Electric" filter to their existing search. Game over.

---

### Annoying Features That Drive Users Away

| Feature | What's Annoying | Fix |
|---------|-----------------|-----|
| PEOS Quiz email gate | You make me answer 8 questions, THEN demand my email to see the result. Feels like a trap. Users close it angry. | Show partial result, gate only the "deep dive" recommendations. Or make email optional with "Skip →" |
| WhatsApp bar after 5 seconds | Feels pushy. User just arrived, hasn't seen anything yet, already being chased. | Show after 45 seconds + significant scroll, not 5s |
| EMI calculator requires scroll | User adjusts sliders but has to scroll to see result (mobile). Fixed on desktop with sticky panel but mobile still sucks. | Add a floating mini-EMI display bar on mobile |
| Language toggle reloads page | Switching to Urdu loses your scroll position and form state | Use transition without hard reload |
| Listings say "pending review" | Users submit a listing, it disappears into limbo. No confirmation email, no timeline. Scary. | Send confirmation WhatsApp/email immediately |
| Price in PKR only | PKR 11,500,000 is hard to parse. Humans read "1.15 crore" or "115 lakh" in Pakistan | Always show in Crore/Lakh format as primary |

---

### Why Dealers SHOULD Pay (The Real Pitch)

The mistake is pitching features. Dealers don't care about features — they care about one thing: **more qualified buyers**.

**The right pitch:**

> "Every month, 10,000 people search for EVs in Pakistan. They compare BYD vs MG, calculate their EMI with HBL, and set price drop alerts. These are not Facebook tire-kickers — they're people 2 weeks from buying. For PKR 4,000/month — less than the profit on ONE tyre sale — your inventory is in front of all of them."

**Why this is better than Facebook/WhatsApp:**
- Facebook buyers are 60% "just curious". eWheelz buyers calculated their EMI — they're 2 weeks from buying
- WhatsApp groups mix EVs with motorcycles, solar panels, and wedding photos. eWheelz is 100% EV intent
- Facebook doesn't give you analytics. eWheelz can show "your Atto 3 listing got 47 views and 3 WhatsApp inquiries this week"
- Facebook posts disappear in 24 hours. eWheelz listings are permanent and SEO-indexed

**The ONE thing that will make dealers pay:** Show them a lead. Give them the first 3 months free. Let them taste a buyer who came because of eWheelz. Then the PKR 4,000 is easy.

---

### Why Users Would Love This (The Real Moat)

The spec database is not the moat. **The moat is trust + Pakistan-specific data nobody else has:**

1. **Real-world range in Pakistan** — not WLTP lab range. "How far does BYD Atto 3 actually go in Lahore summer heat with 4 hours of load shedding?" No one has this data. You can.

2. **Price history** — BYD Atto 3 price changed 4 times in 2024. Showing a price chart is porn for serious buyers who are timing their purchase.

3. **Charging network reality check** — "Which chargers in Islamabad are actually working right now?" Community-powered uptime data. This is the kind of anxiety-killing information that makes someone bookmark your site forever.

4. **Bank rate comparison that's actually up to date** — Meezan vs HBL rates change quarterly. PakWheels' EMI calculator is perpetually stale. Being 100% current is a weekly reason to return.

5. **Urdu** — 60% of Pakistan reads better in Urdu. Every EV resource is English-only. You have a structural advantage in Tier-2 cities (Multan, Faisalabad, Gujranwala) that PakWheels ignores.

---

## 16. Immediate Next Priorities (Ranked by Revenue Impact)

1. **Get 5 real dealers to list inventory** — manually onboard them via WhatsApp, don't wait for them to find you
2. **Activate the price alert cron** — set `RESEND_API_KEY` and `CRON_SECRET`, deploy, verify emails send
3. **Build admin panel** — needs a simple `/admin` page to view leads, activate listings, update EV prices
4. **Add "Lakh/Crore" price display** — PKR 1.15 Crore, not PKR 11,500,000
5. **WhatsApp confirmation for listings** — immediately send "Your listing received" on submission
6. **Price history chart** — store price changes in DB, show chart on EV detail page

---

*This document covers the complete eWheelz codebase as of 2026-03-26. Feed to any LLM along with specific file contents for targeted help.*
