# Technical Reference

## Architecture

eWheelz is a Next.js App Router application backed by Prisma and Neon PostgreSQL.

Main paths:

- `src/app/[locale]` - localized app pages.
- `src/app/api` - API routes.
- `src/components` - reusable UI components.
- `src/lib` - shared business logic and integrations.
- `prisma/schema.prisma` - database schema.
- `mobile` - Expo React Native app.

The app uses locale-prefixed routes such as `/en/listings` and `/ur/listings`.

## Stack

- Next.js 14, React 18, TypeScript, TailwindCSS.
- Prisma 5, Neon PostgreSQL.
- NextAuth v4, next-intl v4.
- Resend for email, Stripe for subscription plumbing.
- Mapbox/OpenChargeMap for charging data.
- Mixpanel/PostHog/GA hooks.
- Expo SDK mobile app.

## Core Data Model

Primary Prisma models:

- `User`, `Account`, `Session`, `VerificationToken`
- `EvModel`, `EvSpec`, `EvBattery`, `EvCharging`
- `Listing`, `Review`, `ChargingStation`, `Article`
- `PriceAlert`, `NewsletterSubscriber`, `Lead`, `AffiliateLink`
- `CommunitySession`, `StationReport`, `TripLog`, `EfficiencyReport`, `RangeFeedback`
- `PushSubscriber`, `PriceHistory`

Important listing behavior:

- User-submitted listings are `PENDING` by default.
- Public marketplace pages only show `ACTIVE` listings.
- Admin review changes listing status through `/api/admin/listings/[id]`.
- Seller manage links use `sellerToken` and can mark listings sold.

## Key Pages

- `/` - marketplace homepage.
- `/listings` and `/listings/post` - browse and submit EV listings.
- `/admin?key=<ADMIN_API_KEY>` - review pending listings and leads.
- `/ev`, `/ev/[slug]`, `/compare`, `/batteries`, `/ev-range`
- `/deal-check` behavior is exposed through `/api/deal-check` and UI components.
- `/battery-health`, `/ev-valuation`, `/emi-calculator`, `/cost-calculator`
- `/charging-map`, `/community`, `/articles`, `/price-index`

## Key APIs

- `GET/POST /api/listings`
- `PATCH /api/admin/listings/[id]`
- `GET /api/ev-models`, `GET /api/ev-models/[slug]`
- `POST /api/compare`
- `GET /api/batteries`
- `POST /api/deal-check`
- `POST /api/battery-health`
- `POST /api/ev-valuation`
- `GET /api/charging-stations`
- `POST /api/leads`, `POST /api/newsletter`, `POST /api/price-alerts`
- `GET /api/cron/sync-stations`, `GET /api/cron/price-alerts`
- `POST /api/whatsapp/webhook`
- `POST /api/webhooks/stripe`

## Key Business Logic

- `src/lib/batteryHealth.ts` - A-F battery scoring.
- `src/lib/dealGrade.ts` - listing deal grade logic.
- `src/lib/bot-parser.ts` - WhatsApp/listing text parser.
- `src/lib/bot-engine.ts` - WhatsApp bot replies and pending listing creation.
- `src/lib/tripPlanner.ts` - route and charging-stop planning.
- `src/lib/communityDb.ts` - community charging/efficiency stats.
- `src/lib/adminAuth.ts` - `ADMIN_API_KEY` validation.

Logic notes:

- Deal grade rewards meaningful below-market pricing, penalizes high prices, missing battery data, high mileage, and older model years.
- Battery health scoring weighs range retention most heavily, then charging habits, thermal factors, and electrical warning signals.
- Trip planning applies Pakistan heat/range penalties in `src/lib/tripPlanner.ts`.
- Community charger reliability should use recent user reports when available.
- Scraped listings are cold-start inventory only. Keep `source` and `sourceUrl` intact and transition toward real seller/dealer submissions.

Data integrity rules:

- Listing `status` must remain the public/private gate.
- Validate inputs at API boundaries before Prisma writes.
- Avoid duplicate listings when ingesting from scraper, WhatsApp, admin seed, or manual entry.
- Do not silently render missing critical listing fields. Show a fallback or omit the field intentionally.

## Mobile App

The Expo app in `mobile` has tab screens for:

- Home
- EVs
- Listings
- Chargers
- News
- Community
- Scan

Mobile environment:

```bash
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

## Verification

Before finishing code changes:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Known non-blocking warnings:

- Existing React hook dependency warnings.
- Existing `<img>` warnings where the app has not yet migrated to `next/image`.
- Google font optimization warnings if the local environment cannot reach Google Fonts.
