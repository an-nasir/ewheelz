import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
  apiVersion: "2024-04-10" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature error", err);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.client_reference_id;
      if (userId) {
         try {
           await prisma.user.update({
             where: { id: userId },
             data: {
               isPremium: true,
               stripeCustomerId: session.customer as string,
               subscriptionId: session.subscription as string,
             },
           });
           console.log(`Upgraded user ${userId} to premium`);
         } catch (e) {
           console.error(`Failed to upgrade user ${userId}`, e);
         }
      }
      break;
    case "customer.subscription.deleted":
      // Handle subscription cancellation
      const subscription = event.data.object as Stripe.Subscription;
      try {
        await prisma.user.updateMany({
          where: { subscriptionId: subscription.id },
          data: { isPremium: false, subscriptionId: null },
        });
      } catch (e) {
         console.error(`Failed to cancel subscription ${subscription.id}`, e);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
