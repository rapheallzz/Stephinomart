import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/inventory";

interface CheckoutLine {
  id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lines: CheckoutLine[] = body.items;

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Re-validate every price and stock level server-side. Never trust
    // amounts sent from the client for a real checkout flow.
    const line_items = [];
    for (const line of lines) {
      const product = getProduct(line.id);
      if (!product) {
        return NextResponse.json(
          { error: `Unknown product: ${line.id}` },
          { status: 400 }
        );
      }
      if (line.quantity < 1 || line.quantity > product.stock) {
        return NextResponse.json(
          {
            error: `${product.name} only has ${product.stock} left in stock`,
          },
          { status: 409 }
        );
      }

      line_items.push({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: {
            name: product.name,
            images: [product.image],
            metadata: { productId: product.id },
          },
        },
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      // Stock is only decremented once Stripe confirms payment via the
      // `checkout.session.completed` webhook — never optimistically here.
      metadata: {
        cart: JSON.stringify(
          lines.map((l) => ({ id: l.id, quantity: l.quantity }))
        ),
      },
      automatic_tax: { enabled: false },
      shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "NG"] },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}
