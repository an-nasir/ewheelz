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
