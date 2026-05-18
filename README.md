# eWheelz

Pakistan-focused EV marketplace and intelligence platform.

eWheelz helps buyers avoid bad EV deals with seller contact labels, battery-risk signals, market pricing confidence, charging data, and EV-specific tools.

## Current Product

- EV listings marketplace with moderated listing approval.
- EV database, detail pages, comparison, battery database, and range estimates.
- Deal checker, battery-health checker, EV valuation, EMI, trip planner, and cost calculator.
- Charging map, community reports, articles/news, newsletter, leads, price alerts, and affiliate tracking.
- Admin review area at `/en/admin?key=<ADMIN_API_KEY>`.
- Expo mobile app in `mobile/`.

## Stack

- Next.js 14 App Router, React 18, TypeScript, TailwindCSS.
- Prisma ORM with Neon PostgreSQL.
- NextAuth, next-intl, Resend, Stripe, Mapbox/OpenChargeMap, Mixpanel/PostHog.
- Expo React Native mobile app.

## Commands

```bash
npm install
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```

Mobile:

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

## Environment

Copy `.env.example` to `.env.local` and set at minimum:

```bash
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_BASE_URL="https://ewheelz.pk"
ADMIN_API_KEY=""
```

Recommended for production:

```bash
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL="eWheelz <hello@ewheelz.pk>"
LEAD_NOTIFICATION_EMAIL="leads@ewheelz.pk"
CRON_SECRET=""
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_WA_GROUP_URL=""
WHATSAPP_TOKEN=""
WHATSAPP_PHONE_ID=""
WHATSAPP_VERIFY_TOKEN=""
NEXT_PUBLIC_MAPBOX_TOKEN=""
OPENCHARGEMMAP_API_KEY=""
```

## Docs

- Agent context: `CLAUDE.md`
- Technical architecture: `docs/TECHNICAL.md`
- Deployment: `docs/DEPLOYMENT.md`
- Growth execution: `docs/GROWTH.md`
- Active backlog: `tasks/backlog.md`

## Operating Priority

This project should focus on marketplace liquidity before more product surface:

1. Get real EV inventory.
2. Build seller/dealer relationships.
3. Use deal-check and battery-risk checks as buyer acquisition hooks.
4. Publish public market proof every day.
5. Convert buyer interest into direct WhatsApp leads.
