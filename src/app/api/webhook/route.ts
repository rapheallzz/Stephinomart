import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { reserveStock } from "@/lib/inventory";

// Stripe requires the raw request body to verify the webhook signature,
// so this route must not be parsed as JSON by Next's default body parser.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const cartJson = session.metadata?.cart;

    if (cartJson) {
      try {
        const lines: { id: string; quantity: number }[] = JSON.parse(cartJson);
        const shortfalls = reserveStock(lines);
        if (shortfalls.length > 0) {
          // Payment succeeded but stock ran out in the meantime (race
          // condition between two shoppers). In production: flag the
          // order for manual review / partial refund via the Stripe API.
          console.error(
            "Post-payment stock shortfall — needs manual reconciliation:",
            shortfalls
          );
        }
      } catch (err) {
        console.error("Failed to parse cart metadata from session:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
