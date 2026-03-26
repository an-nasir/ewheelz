# GooseHint: Add User Accounts (P0)

## Objective
Implement user accounts and authentication in eWheelz using NextAuth.js and PostgreSQL.

## Tasks
1. **Setup NextAuth.js**:
   - Install `next-auth` and configure it in `src/app/api/auth/[...nextauth]/route.ts`.
   - Support email/password and Google login.
   - Store users in PostgreSQL via Prisma (`prisma/schema.prisma`).

2. **UI Components**:
   - Add login/signup buttons to the navbar (`src/components/NavBar.tsx`).
   - Create a profile page (`src/app/dashboard/page.tsx`) for saved EVs/stations.

3. **Database**:
   - Extend the `User` model in `prisma/schema.prisma` to include:
     ```prisma
     model User {
       id        String   @id @default(uuid())
       email     String   @unique
       name      String?
       image     String?
       savedEVs  EvModel[] @relation("UserSavedEVs")
       savedStations ChargingStation[] @relation("UserSavedStations")
       createdAt DateTime @default(now())
       updatedAt DateTime @updatedAt
     }
     ```

4. **Testing**:
   - Write unit tests for auth flows (e.g., login, logout).
   - Manually test on mobile/desktop.

## Expected Output
- A PR with NextAuth integration and profile page.
- Updated `prisma/schema.prisma` with the `User` model.
- Screenshots of the login flow and profile dashboard.

## Notes
- Use environment variables for sensitive data (e.g., `GOOGLE_CLIENT_ID`).
- Follow NextAuth.js documentation for setup.
