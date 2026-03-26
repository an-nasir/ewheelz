# GooseHint: Deployment Checklist

## Objective
Prepare a checklist for deploying new features safely.

## Tasks
1. **Pre-Deploy**:
   - [ ] Run `npm run lint` (no errors).
   - [ ] Run `npm run test` (all tests pass).
   - [ ] Lighthouse score >90 (mobile/desktop).
   - [ ] Test on:
     - Chrome (latest)
     - Safari (iOS)
     - Firefox
     - Edge
   - [ ] Check PostgreSQL migrations (`npx prisma migrate dev`).
   - [ ] Backup database.

2. **Post-Deploy**:
   - [ ] Monitor Sentry for errors (first 24 hours).
   - [ ] Check Mixpanel for drops in:
     - User signups
     - Trip planner usage
     - Affiliate clicks
   - [ ] Verify Stripe webhooks (for subscriptions).
   - [ ] Smoke test:
     - Sign up/login.
     - Plan a trip.
     - View Urdu translations.
     - Click affiliate links.

3. **Rollback Plan**:
   - Revert to last stable Git commit.
   - Restore database backup.
   - Notify users via email (if critical).

## Expected Output
- A `DEPLOYMENT_CHECKLIST.md` file with pre/post-deploy tasks.
- Sentry/Mixpanel monitoring setup.
- Rollback instructions.

## Notes
- Assign a dev to monitor the deploy.
- Communicate downtime (if any) to users.
