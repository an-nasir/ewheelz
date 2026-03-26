#!/bin/bash

# Create the tasks directory if it doesn't exist
mkdir -p tasks

# GooseHint: Explore the eWheelz Project
cat > tasks/explore_project.md << 'EOL'
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
EOL

# GooseHint: Add User Accounts (P0)
cat > tasks/add_user_accounts.md << 'EOL'
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
EOL

# GooseHint: Add Affiliate Links (P0)
cat > tasks/add_affiliate_links.md << 'EOL'
# GooseHint: Add Affiliate Links (P0)

## Objective
Monetize eWheelz by adding affiliate links to EV listings.

## Tasks
1. **Database Setup**:
   - Create an `AffiliateLink` model in `prisma/schema.prisma`:
     ```prisma
     model AffiliateLink {
       id          Int      @id @default(autoincrement())
       evModel    EvModel  @relation(fields: [evModelId], references: [id])
       evModelId  Int
       dealerName String
       url        String
       utmParams  String
       clicks     Int      @default(0)
       createdAt  DateTime @default(now())
     }
     ```
   - Run `npx prisma migrate dev` to apply changes.

2. **API Endpoint**:
   - Create an API route (`src/app/api/affiliate/route.ts`) to track clicks:
     ```ts
     import { prisma } from "@/lib/prisma";

     export async function POST(request: Request) {
       const { evModelId, dealerName } = await request.json();
       await prisma.affiliateLink.updateMany({
         where: { evModelId, dealerName },
         data: { clicks: { increment: 1 } },
       });
       return new Response(JSON.stringify({ success: true }), {
         headers: { 'Content-Type': 'application/json' },
       });
     }
     ```

3. **UI Integration**:
   - Add an `AffiliateButton` component (`src/components/AffiliateButton.tsx`):
     ```tsx
     import { trackAffiliateClick } from "@/lib/utils/analytics";

     export default function AffiliateButton({ evModelId, dealerName, url, utmParams }) {
       const handleClick = () => {
         trackAffiliateClick(evModelId, dealerName);
         window.open(`${url}?${utmParams}`, "_blank");
       };
       return (
         <button onClick={handleClick} className="bg-green-500 text-white px-4 py-2 rounded">
           Buy from {dealerName}
         </button>
       );
     }
     ```
   - Add the button to `src/app/ev/[id]/page.tsx`.

4. **Analytics**:
   - Track clicks in Mixpanel/Google Analytics.

## Expected Output
- A PR with affiliate link integration.
- Updated `prisma/schema.prisma` with the `AffiliateLink` model.
- Screenshots of the affiliate button on an EV detail page.

## Notes
- Use UTM parameters to track traffic (e.g., `?utm_source=ewheelz&utm_medium=affiliate`).
- Partner with local dealers (e.g., PakWheels, OLX).
EOL

# GooseHint: Real-Time Station Availability (P0)
cat > tasks/add_realtime_stations.md << 'EOL'
# GooseHint: Real-Time Station Availability (P0)

## Objective
Improve the charging station map with real-time availability and offline support.

## Tasks
1. **Polling Script**:
   - Create a script (`scripts/poll_stations.ts`) to fetch station status every 5 minutes:
     ```ts
     import { prisma } from "@/lib/prisma";

     export async function pollStationStatus() {
       const stations = await fetch("https://api.chargestationmap.com/stations").then(res => res.json());
       for (const station of stations) {
         await prisma.chargingStation.update({
           where: { id: station.id },
           data: {
             isOnline: station.status === "Available",
             lastUpdated: new Date(),
           },
         });
       }
     }

     // Run every 5 minutes
     setInterval(pollStationStatus, 5 * 60 * 1000);
     ```
   - Add the script to `package.json` under `scripts`: `"poll-stations": "ts-node scripts/poll_stations.ts"`.

2. **UI Updates**:
   - Update `src/components/LeafletMap.tsx` to show real-time status:
     ```tsx
     function StationMarker({ station }) {
       return (
         <Marker position={[station.lat, station.lng]}
           icon={station.isOnline ? greenIcon : redIcon}>
           <Popup>
             <div>
               <h3>{station.name}</h3>
               <p>{station.isOnline ? "✅ Online" : "❌ Offline"}</p>
               <p>Last updated: {new Date(station.lastUpdated).toLocaleString()}</p>
             </div>
           </Popup>
         </Marker>
       );
     }
     ```

3. **Offline Support**:
   - Cache station data using IndexedDB (`src/lib/utils/offline.ts`):
     ```ts
     export async function cacheStations(stations) {
       const db = await openDB("eWheelz", 1, {
         upgrade(db) {
           db.createObjectStore("stations");
         },
       });
       await db.put("stations", stations, "stations");
     }
     ```

4. **Error Handling**:
   - Add a "Report Issue" button to flag incorrect station status.

## Expected Output
- A PR with real-time polling and UI updates.
- Offline cache implementation.
- Screenshots of the map showing real-time status.

## Notes
- Use environment variables for API endpoints.
- Test polling with mock data first.
EOL

# GooseHint: Add Urdu Localization (P1)
cat > tasks/add_urdu_support.md << 'EOL'
# GooseHint: Add Urdu Localization (P1)

## Objective
Add Urdu language support to eWheelz using next-i18next.

## Tasks
1. **Setup i18n**:
   - Install `next-i18next`:
     ```bash
     npm install next-i18next
     ```
   - Configure in `next-i18next.config.js`:
     ```js
     module.exports = {
       i18n: {
         defaultLocale: "en",
         locales: ["en", "ur"],
       },
     };
     ```

2. **Translation Files**:
   - Create `public/locales/ur/common.json`:
     ```json
     {
       "welcome": "خوش آمدید",
       "evDatabase": "الیکٹرک گاڑیوں کا ڈیٹا بیس",
       "chargingStations": "چارجر اسٹیشنز",
       "tripPlanner": "سفر کی منصوبہ بندی",
       "range": "دائرہ",
       "battery": "بیٹری",
       "compare": "مقابلہ کریں",
       "save": "محفوظ کریں",
       "signIn": "لاگ ان کریں",
       "signOut": "لاگ آؤٹ کریں"
     }
     ```

3. **UI Integration**:
   - Wrap the app with `appWithTranslation` in `src/app/layout.tsx`:
     ```tsx
     import { appWithTranslation } from "next-i18next";

     function RootLayout({ children }) {
       return (
         <html lang="en" dir="ltr">
           <body>{children}</body>
         </html>
       );
     }

     export default appWithTranslation(RootLayout);
     ```
   - Add a language switcher to `src/components/NavBar.tsx`:
     ```tsx
     import { useRouter } from "next/router";

     export default function LanguageSwitcher() {
       const router = useRouter();
       const changeLanguage = (lng) => {
         router.push(router.pathname, router.asPath, { locale: lng });
       };
       return (
         <div>
           <button onClick={() => changeLanguage("en")}>English</button>
           <button onClick={() => changeLanguage("ur")}>اردو</button>
         </div>
       );
     }
     ```

4. **RTL Support**:
   - Add RTL CSS for Urdu:
     ```css
     [dir="rtl"] {
       direction: rtl;
       text-align: right;
     }
     ```

## Expected Output
- A PR with Urdu localization setup.
- Screenshots of the UI in Urdu (RTL layout).
- List of translated strings.

## Notes
- Test RTL layout on all pages.
- Use native speakers to validate translations.
EOL

# GooseHint: Add Premium Subscriptions (P1)
cat > tasks/add_premium_subscriptions.md << 'EOL'
# GooseHint: Add Premium Subscriptions (P1)

## Objective
Implement premium subscriptions using Stripe and PostgreSQL.

## Tasks
1. **Stripe Setup**:
   - Install Stripe:
     ```bash
     npm install @stripe/stripe-js @stripe/stripe-node
     ```
   - Create a Stripe account and add keys to `.env`:
     ```env
     STRIPE_SECRET_KEY=sk_test_...
     NEXT_PUBLIC_STRIPE_KEY=pk_test_...
     ```

2. **Database Model**:
   - Extend the `User` model in `prisma/schema.prisma`:
     ```prisma
     model User {
       // ... existing fields
       isPremium    Boolean  @default(false)
       stripeCustomerId String?
       subscriptionId  String?
     }
     ```

3. **API Endpoint**:
   - Create `src/app/api/subscribe/route.ts`:
     ```ts
     import Stripe from "stripe";
     import { prisma } from "@/lib/prisma";

     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

     export async function POST(request: Request) {
       const { plan, userId } = await request.json();
       const user = await prisma.user.findUnique({ where: { id: userId } });

       const session = await stripe.checkout.sessions.create({
         customer: user.stripeCustomerId,
         payment_method_types: ["card"],
         line_items: [{
           price_data: {
             currency: "pkr",
             product_data: { name: `${plan} Plan` },
             unit_amount: plan === "premium" ? 50000 : 0, // PKR 500
           },
           quantity: 1,
         }],
         mode: "subscription",
         success_url: `${process.env.NEXTAUTH_URL}/profile?session_id={CHECKOUT_SESSION_ID}`,
         cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
       });

       return new Response(JSON.stringify({ url: session.url }), {
         headers: { "Content-Type": "application/json" },
       });
     }
     ```

4. **Pricing Page**:
   - Create `src/app/pricing/page.tsx`:
     ```tsx
     import { loadStripe } from "@stripe/stripe-js";

     export default function PricingPage() {
       const handleSubscribe = async (plan) => {
         const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
         const response = await fetch("/api/subscribe", {
           method: "POST",
           body: JSON.stringify({ plan, userId: "user_123" }), // Replace with actual user ID
         });
         const { url } = await response.json();
         window.location.href = url;
       };

       return (
         <div>
           <h1>Premium Plans</h1>
           <div>
             <h2>Free</h2>
             <p>Basic features</p>
             <button>Current Plan</button>
           </div>
           <div>
             <h2>Premium (PKR 500/month)</h2>
             <ul>
               <li>Advanced trip planner</li>
               <li>Ad-free experience</li>
               <li>Expert reviews</li>
             </ul>
             <button onClick={() => handleSubscribe("premium")}>Upgrade</button>
           </div>
         </div>
       );
     }
     ```

5. **Webhook Handler**:
   - Create `src/app/api/webhooks/stripe/route.ts` to handle Stripe events:
     ```ts
     import Stripe from "stripe";
     import { prisma } from "@/lib/prisma";

     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

     export async function POST(request: Request) {
       const sig = request.headers.get("stripe-signature");
       const body = await request.text();
       const event = stripe.webhooks.constructEvent(
         body,
         sig!,
         process.env.STRIPE_WEBHOOK_SECRET!
       );

       if (event.type === "checkout.session.completed") {
         const session = event.data.object;
         await prisma.user.update({
           where: { id: session.client_reference_id },
           data: { isPremium: true, subscriptionId: session.subscription },
         });
       }

       return new Response(JSON.stringify({ received: true }), {
         headers: { "Content-Type": "application/json" },
       });
     }
     ```

## Expected Output
- A PR with Stripe integration and premium subscription logic.
- Pricing page with upgrade buttons.
- PostgreSQL schema updates for the `User` model.

## Notes
- Test with Stripe test cards (e.g., `4242 4242 4242 4242`).
- Use Stripe Dashboard to monitor subscriptions.
EOL

# GooseHint: Enhance Trip Planner (P1)
cat > tasks/add_trip_planner.md << 'EOL'
# GooseHint: Enhance Trip Planner (P1)

## Objective
Improve the trip planner with charging stops and real-time data.

## Tasks
1. **Algorithm**:
   - Implement Dijkstra’s algorithm in `src/lib/tripPlanner.ts` to find optimal routes:
     ```ts
     export async function calculateRoute(start: string, end: string) {
       // Mock: Replace with Mapbox/Google Maps API
       const distance = Math.floor(Math.random() * 500) + 100; // 100-600 km
       const duration = Math.floor(distance / 100) * 60; // ~1 hour per 100 km
       const chargingStops = await getStationsAlongRoute(start, end);
       return { start, end, distance, duration, chargingStops };
     }
     ```

2. **UI Component**:
   - Update `src/app/trip-planner/page.tsx`:
     ```tsx
     import { calculateRoute } from "@/lib/tripPlanner";

     export default function TripPlanner() {
       const [start, setStart] = useState("");
       const [end, setEnd] = useState("");
       const [route, setRoute] = useState(null);

       const handlePlanTrip = async () => {
         const routeData = await calculateRoute(start, end);
         setRoute(routeData);
       };

       return (
         <div>
           <h2>Plan Your Trip</h2>
           <input placeholder="Start" value={start} onChange={(e) => setStart(e.target.value)} />
           <input placeholder="End" value={end} onChange={(e) => setEnd(e.target.value)} />
           <button onClick={handlePlanTrip}>Plan Trip</button>
           {route && (
             <div>
               <h3>Route: {route.distance} km | {route.duration} mins</h3>
               <h4>Charging Stops:</h4>
               <ul>
                 {route.chargingStops.map((stop, i) => (
                   <li key={i}>{stop.name} ({stop.distanceFromStart} km)</li>
                 ))}
               </ul>
             </div>
           )}
         </div>
       );
     }
     ```

3. **Database Query**:
   - Add `getStationsAlongRoute` to `src/lib/database/stations.ts`:
     ```ts
     export async function getStationsAlongRoute(start: string, end: string) {
       // Mock: Replace with actual geospatial query
       return await prisma.chargingStation.findMany({
         where: { isOnline: true },
         take: 3, // Limit to 3 stops for demo
       });
     }
     ```

4. **Real-Time Integration**:
   - Use the real-time station data from GooseHint 7 to show live availability.

## Expected Output
- A PR with the enhanced trip planner.
- Screenshots of the trip planner showing routes and charging stops.
- Updated `tripPlanner.ts` and database queries.

## Notes
- Replace mock data with actual Mapbox/Google Maps API calls.
- Test with real Pakistan cities (e.g., Lahore → Islamabad).
EOL

# GooseHint: User Testing Script
cat > tasks/user_testing_script.md << 'EOL'
# GooseHint: User Testing Script

## Objective
Create a script to test new features with real users.

## Tasks
1. **Test Cases**:
   | Task                                  | Steps                                                                 | Success Criteria                     | Notes                  |
   |---------------------------------------|-----------------------------------------------------------------------|--------------------------------------|------------------------|
   | Sign Up                               | 1. Click "Sign In". 2. Choose email/Google. 3. Complete signup.      | User lands on profile page.          | Test on mobile/desktop.|
   | Plan a Trip with Charging Stops       | 1. Enter start/end. 2. Click "Plan Trip". 3. Verify stops.          | Route + stops displayed.            | Use Lahore → Islamabad. |
   | Switch to Urdu                        | 1. Click language switcher. 2. Verify translations.                  | All UI in Urdu.                      | Check RTL layout.      |
   | Save Favorite EV                      | 1. Browse EVs. 2. Click "Save". 3. Check profile.                     | EV appears in favorites.             | Requires login.        |
   | Premium Subscription                   | 1. Go to Pricing. 2. Click "Upgrade". 3. Complete Stripe checkout.   | Redirects to success URL.           | Use test card.         |

2. **Feedback Questions**:
   - What was the most confusing part of the trip planner?
   - Did the Urdu translation feel natural?
   - Would you pay PKR 500/month for premium features? Why/why not?

3. **Tools**:
   - Use Hotjar for session recordings.
   - Use a Google Form for structured feedback.

## Expected Output
- A `USER_TESTING_SCRIPT.md` file with step-by-step instructions.
- A Google Form template for feedback.
- Summary of user pain points and suggestions.

## Notes
- Test on both mobile and desktop.
- Include users with varying tech proficiency.
EOL

# GooseHint: A/B Testing Plan
cat > tasks/ab_testing_plan.md << 'EOL'
# GooseHint: A/B Testing Plan

## Objective
Design A/B tests for key features to optimize conversions.

## Tasks
1. **Test 1: Affiliate Button Color**:
   - **Hypothesis**: Green buttons will have higher CTR than blue.
   - **Variants**:
     - **A (Control)**: Blue button (`bg-blue-500`).
     - **B (Treatment)**: Green button (`bg-green-500`).
   - **Metric**: Click-through rate (CTR).
   - **Sample Size**: 1,000 users per variant.
   - **Duration**: 7 days.
   - **Tool**: Mixpanel.

2. **Test 2: Premium Upsell Modal vs. Banner**:
   - **Hypothesis**: Modals will convert better than banners.
   - **Variants**:
     - **A (Control)**: Banner at top of pricing page.
     - **B (Treatment)**: Modal after 2 trip plans.
   - **Metric**: Subscription conversion rate.
   - **Sample Size**: 500 users per variant.
   - **Duration**: 14 days.
   - **Tool**: Google Optimize.

3. **Setup Instructions**:
   - Use Mixpanel/Google Optimize to split traffic.
   - Track events:
     - `affiliate_click` (variant A/B).
     - `premium_subscribe` (source: modal/banner).
   - Analyze results after test duration.

## Expected Output
- An `AB_TESTING_PLAN.md` file with hypotheses, variants, and metrics.
- Mixpanel/Google Optimize setup instructions.
- Summary of test results and recommendations.

## Notes
- Ensure statistical significance (p < 0.05).
- Document learnings for future tests.
EOL

# GooseHint: Deployment Checklist
cat > tasks/deployment_checklist.md << 'EOL'
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
EOL

echo "GooseHints files created in the tasks/ directory:"
ls -l tasks/