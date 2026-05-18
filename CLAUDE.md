# eWheelz Agent Context

Use this file as the primary source of truth for Claude and other coding agents.

## Mission

Build Pakistan's EV-only marketplace and buyer-intelligence platform.

The business priority is marketplace trust and liquidity:

1. Real EV inventory.
2. Verified or clearly labeled WhatsApp seller/dealer access.
3. Battery-risk and price-confidence intelligence.
4. Buyer leads for sellers/dealers.
5. Public proof through market snapshots.

Do not prioritize more calculators, subscriptions, or polish until listings and leads are moving.

## Product Rules

- eWheelz is not a generic car marketplace. It is an EV trust layer: battery risk, deal quality, seller contact quality, and Pakistan-specific EV context.
- Supply beats features. Real listings and seller conversations matter more than new UI surface.
- WhatsApp is the primary conversion path. Forms are secondary and should be easy to translate into chat flows.
- Any feature should directly improve listings, buyer trust, WhatsApp leads, or public market proof.
- Avoid fake production data. Scraped, seeded, manual, and user-submitted records must be clearly sourced.

## Current Stack

- Web: Next.js 14 App Router, React 18, TypeScript, TailwindCSS.
- DB: Prisma with Neon PostgreSQL.
- Auth/i18n: NextAuth v4, next-intl v4.
- Growth plumbing: Resend leads/newsletter, price alerts, affiliate tracking, WhatsApp webhook.
- Mobile: Expo React Native in `mobile/`.

## Key Product Flows

- Listings are submitted as `PENDING`; admin approves before they appear publicly.
- Admin approval and seller verification are separate. Approval means "safe to show"; verification means seller contact was manually confirmed.
- Admin review area: `/en/admin?key=<ADMIN_API_KEY>`.
- Deal checker accepts ad text/URLs and scores buyer risk.
- Battery-risk scoring lives in `src/lib/batteryHealth.ts`.
- WhatsApp parser/bot logic lives in `src/lib/bot-parser.ts` and `src/lib/bot-engine.ts`.
- Charging reliability/community data lives in `src/lib/communityDb.ts`.
- Trip planning logic lives in `src/lib/tripPlanner.ts`.

## Business Logic That Must Not Drift

- Deal grade starts from a neutral score, rewards prices more than 10% below market, penalizes prices more than 15% above market, and penalizes missing battery or mileage data.
- Battery risk combines range retention, charging habits, thermal health, and electrical warnings. Keep scoring centralized in `src/lib/batteryHealth.ts`.
- Pakistan heat matters for range. Trip/range logic should keep the 45C heat penalty behavior unless product requirements change.
- Station reliability is based on community availability signals, not static charger presence alone.
- Import-duty and regulatory UI must be checked against current law before publishing because policy changes can make old guidance wrong.

## Implementation Rules

- Validate all API inputs. Reject unrealistic prices, negative numbers, scientific-notation numeric strings where inappropriate, invalid battery percentages, and impossible EV specs.
- Prevent duplicate listings when ingesting scraped or manual inventory.
- Never overwrite seller-provided or admin-reviewed records blindly.
- Do not use immediately invoked functions inside JSX; define a small component/helper instead. This avoids App Router runtime chunk issues that can pass build but fail in-browser.
- Keep UI modern but marketplace-efficient: clear hierarchy, fast listing scans, visible WhatsApp/contact actions, and no empty community/dashboard surfaces.

## Commands Before Finishing Code Work

Run these unless the change is documentation-only:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

`npm run lint` may show existing warnings for hook dependencies and `<img>` usage. Warnings are acceptable; errors are not.

## Development Rules

- TypeScript only for new files.
- Keep edits targeted and avoid broad rewrites.
- Use existing helpers in `src/lib` before adding new utilities.
- Use Prisma for DB access.
- User-facing copy should use i18n patterns where practical; avoid adding large hardcoded UI surfaces.
- Use `ADMIN_API_KEY` for admin APIs. Do not introduce `ADMIN_KEY`.
- New public listings must not bypass moderation unless explicitly requested.

## Documentation Map

- Human quickstart: `README.md`
- Technical detail: `docs/TECHNICAL.md`
- Deployment: `docs/DEPLOYMENT.md`
- Growth execution: `docs/GROWTH.md`
- Active backlog: `tasks/backlog.md`
