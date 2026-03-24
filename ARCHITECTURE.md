# Architecture

## Project Structure

```
eWheelz/
├── prisma/
│   ├── schema.prisma        # Database schema (all models)
│   └── seed.ts              # Seed data (sample EVs, listings, stations)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   └── prisma.ts        # Prisma client singleton
│   └── modules/             # Feature modules
│       ├── users/
│       ├── listings/
│       ├── ev_models/
│       ├── batteries/
│       ├── reviews/
│       ├── charging_stations/
│       └── articles/
├── scripts/                 # Data import scripts
├── docs/                    # Documentation
├── skills/                  # AI skill guides
└── tasks/                   # Backlog and task tracking
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Database:** PostgreSQL with Prisma ORM
- **Search:** Meilisearch (Phase 2)
- **Maps:** Mapbox (for charging stations)
- **Hosting:** Vercel (frontend), Railway (database)

## Database Schema

8 core tables with normalized relations:

- `users` — Buyers, sellers, dealers, admins
- `ev_models` — EV make/model/variant/year catalog
- `ev_specs` — Technical specs (1:1 with ev_models)
- `ev_batteries` — Battery details (1:1 with ev_models)
- `ev_charging` — Charging compatibility (1:many with ev_models)
- `listings` — Marketplace buy/sell listings
- `reviews` — User reviews of EV models
- `charging_stations` — Charging station locations
- `articles` — News, guides, tutorials

## Module Pattern

Each module in `src/modules/` follows:

```
module_name/
  ├── types.ts        # TypeScript interfaces
  ├── service.ts      # Business logic
  ├── repository.ts   # Database queries
  └── routes.ts       # API route handlers (or page components)
```
