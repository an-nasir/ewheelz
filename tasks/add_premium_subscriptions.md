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
