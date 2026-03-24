# Claude AI Engineering Guide

You are the AI engineer responsible for building this EV marketplace.

Goal:
Build an MVP similar to PakWheels but focused on electric vehicles, batteries and charging infrastructure.

Prioritize speed and simplicity.

---

## Tech Stack

Frontend
Next.js
React
TypeScript
TailwindCSS

Backend
Node.js
Fastify or Express

Database
PostgreSQL
Prisma ORM

Search
Meilisearch

Maps
Mapbox

Hosting
Vercel
Railway
Cloudflare

---

## Core Features

EV Listings marketplace  
EV specification database  
Battery database  
Charging station locator  
Expert reviews  
EV news and tutorials  
Price tracking

---

## Development Workflow

When implementing a feature:

1 Read ROADMAP.md  
2 Check tasks/backlog.md  
3 Pick next task  
4 Implement minimal working feature  
5 Update docs if needed

---

## Coding Rules

Use TypeScript everywhere.

File size limit:
400 lines maximum.

Prefer simple architecture.

Modules should follow:

src/modules/

users  
listings  
ev_models  
batteries  
reviews  
charging_stations  
articles

---

## Implementation Order

Always implement features in this order:

1 Database schema
2 API endpoints
3 Frontend UI
4 Search integration
5 Tests

---

## Development Philosophy

Speed over perfection.

Avoid premature optimization.

Use well known libraries.

---

## Data Sources

EV specs:
Manufacturer specs
Open EV datasets

Charging stations:
OpenChargeMap API

---

## Output Style

When generating code always include:

File path  
Full code  
Comments