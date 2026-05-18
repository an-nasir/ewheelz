# AGENTS.md

This repo uses `CLAUDE.md` as the main agent context. Read it first.

## Core Commands

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```

## Working Rules

- Keep changes focused and marketplace-first.
- Use TypeScript for new code.
- Use Prisma for database access.
- Use `ADMIN_API_KEY` for admin APIs.
- Do not make new listings public without moderation unless explicitly requested.
- Do not expand product surface when the request is about sales, inventory, or growth.

## Source Of Truth

- Agent context: `CLAUDE.md`
- Project overview: `README.md`
- Technical detail: `docs/TECHNICAL.md`
- Deployment: `docs/DEPLOYMENT.md`
- Growth: `docs/GROWTH.md`
- Backlog: `tasks/backlog.md`
