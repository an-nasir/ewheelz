# Deployment

## Local Web Setup

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:push
npm run dev
```

Required local variables:

```bash
DATABASE_URL=""
DIRECT_URL=""
NEXT_PUBLIC_BASE_URL="https://ewheelz.pk"
ADMIN_API_KEY=""
```

Recommended local variables:

```bash
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="eWheelz <hello@ewheelz.pk>"
LEAD_NOTIFICATION_EMAIL="leads@ewheelz.pk"
CRON_SECRET=""
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_WA_GROUP_URL=""
```

## Production Web Setup

Host the web app on Vercel and the database on Neon.

Vercel build command:

```bash
npm run build
```

Set these in Vercel:

```bash
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="https://ewheelz.pk"
NEXTAUTH_SECRET=""
NEXTAUTH_URL="https://ewheelz.pk"
ADMIN_API_KEY=""
CRON_SECRET=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL="eWheelz <hello@ewheelz.pk>"
LEAD_NOTIFICATION_EMAIL="leads@ewheelz.pk"
NEXT_PUBLIC_WHATSAPP_NUMBER=""
NEXT_PUBLIC_WA_GROUP_URL=""
WHATSAPP_TOKEN=""
WHATSAPP_PHONE_ID=""
WHATSAPP_VERIFY_TOKEN=""
NEXT_PUBLIC_MAPBOX_TOKEN=""
OPENCHARGEMMAP_API_KEY=""
NEXT_PUBLIC_GA_MEASUREMENT_ID=""
NEXT_PUBLIC_MIXPANEL_TOKEN=""
NEXT_PUBLIC_POSTHOG_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
```

## Cron Jobs

Configured in `vercel.json`:

- `/api/cron/sync-stations` at 2am daily.
- `/api/cron/price-alerts` at 9am daily.

Both require `CRON_SECRET`.

## Admin Operations

Admin area:

```text
/en/admin?key=<ADMIN_API_KEY>
```

Admin APIs accept `x-admin-key`, `Authorization: Bearer <key>`, or `?key=`.

Important endpoints:

- `PATCH /api/admin/listings/[id]` - approve/reject listing.
- `GET /api/admin/export` - export DB snapshot.
- `POST /api/admin/import` - import snapshot.
- `POST /api/admin/seed-listings` - seed demo market listings.

## Mobile Setup

```bash
cd mobile
npm install
cp .env.example .env
npm start
```

Set:

```bash
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

For production mobile builds:

```bash
EXPO_PUBLIC_API_URL="https://ewheelz.pk"
```

Build with EAS:

```bash
cd mobile
eas build --platform android
eas build --platform ios
```

## Pre-Deploy Checklist

- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run db:generate`
- [ ] Confirm Vercel env vars.
- [ ] Confirm Neon connection strings.
- [ ] Confirm admin page loads.
- [ ] Submit a test listing and approve it.
- [ ] Confirm approved listing appears on `/en/listings`.
- [ ] Confirm lead notification email if Resend is configured.
- [ ] Confirm cron endpoints reject requests without `CRON_SECRET`.

## Common Issues

- Database unreachable during local build: check `DATABASE_URL` and network access.
- Admin unauthorized: verify `ADMIN_API_KEY` and use `/en/admin?key=<key>`.
- Mobile white screen: verify `EXPO_PUBLIC_API_URL`.
- Price alerts do not send: verify `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, and `CRON_SECRET`.
- WhatsApp webhook fails: verify public URL and `WHATSAPP_VERIFY_TOKEN`.
