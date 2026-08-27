import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Thrown only when a checkout/webhook route actually runs without a key,
  // not at build time.
  console.warn(
    "STRIPE_SECRET_KEY is not set. Checkout routes will fail until it is configured in .env.local"
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  typescript: true,
});
