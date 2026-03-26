# GooseHint: Explore the eWheelz Project

## Objective
Explore the eWheelz project to understand its current state, tech stack, and features.

## Tasks
1. **Tech Stack Analysis**:
   - Identify the frontend framework (Next.js), backend (API routes), and database (PostgreSQL/Prisma).
   - List all major dependencies in `package.json` and `prisma/schema.prisma`.
   - Document the folder structure, especially `src/app`, `src/components`, and `src/lib`.

2. **Feature Inventory**:
   - List all user-facing features (e.g., EV database, charging map, trip planner).
   - Map each feature to its code location (e.g., `src/app/charging-map` for the charging map).
   - Identify data sources (PostgreSQL tables, APIs, static data).

3. **User Flow Simulation**:
   - Simulate a new user journey: browse EVs, find charging stations, plan a trip.
   - Simulate a returning user journey: save favorites, submit efficiency data, compare EVs.
   - Document pain points (e.g., missing user accounts, lack of real-time data).

4. **Code Quality Audit**:
   - Run `npm run lint` and `npm run test` to check for errors.
   - Use Lighthouse to audit performance and accessibility.
   - Identify tech debt (outdated dependencies, unused code).

## Expected Output
- A `TECH_STACK.md` file with the tech stack summary.
- A `FEATURE_INVENTORY.md` file with features mapped to code locations.
- A `USER_FLOW.md` file with user journeys and pain points.
- A list of critical issues or tech debt.

## Notes
- Focus on the `src` directory for the main codebase.
- Check `prisma/schema.prisma` for database models.
- Use `scripts/` for any automation or data import scripts.
