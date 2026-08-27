# Fieldwork — E-Commerce Platform

A full-stack storefront built with **Next.js 14 (App Router) + TypeScript + Stripe**, featuring real-time inventory, animated cart interactions, and Stripe Checkout.

## Stack

- **Next.js 14** (App Router, Server Components) + **TypeScript**
- **Stripe Checkout** for payment, with a webhook that confirms orders and decrements stock
- **Zustand** for cart state (persisted to localStorage)
- **Framer Motion** for cart drawer, quantity, and card animations
- **SWR** polling `/api/inventory` every 4s so stock counts update live across tabs/shoppers
- **Tailwind CSS** for styling

## Getting started

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your Stripe **test mode** keys from
https://dashboard.stripe.com/test/apikeys:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then run the dev server:

```bash
npm run dev
```

Visit http://localhost:3000.

### Forwarding webhooks locally

Checkout only works end-to-end (stock actually decrements) once the webhook
fires. In a second terminal, with the [Stripe CLI](https://docs.stripe.com/stripe-cli)
installed:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`
and restart `npm run dev`.

### Test card

Use Stripe's test card at checkout: `4242 4242 4242 4242`, any future expiry,
any CVC, any ZIP.

## How it fits together

```
src/
  app/
    page.tsx                     Homepage — product grid
    product/[id]/page.tsx        Product detail page
    checkout/success/page.tsx    Post-payment confirmation (reads the Stripe session)
    api/
      inventory/route.ts         GET — current stock snapshot, polled by the client
      checkout/route.ts          POST — validates cart server-side, creates a Stripe Checkout Session
      webhook/route.ts           POST — Stripe calls this on payment success; decrements stock
  components/                    UI: ProductGrid, ProductCard, CartDrawer, CartButton, ProductDetail
  store/cartStore.ts             Zustand cart state (client-side, persisted)
  lib/
    inventory.ts                 In-memory inventory "database" + reserveStock()
    stripe.ts                    Stripe server SDK client
    types.ts                     Shared types
  data/products.json             Seed catalog
```

### Real-time inventory

Stock counts live server-side (`lib/inventory.ts`) and the client polls
`/api/inventory` via SWR every 4 seconds, so if stock changes (another
shopper checks out, or you edit `products.json` and restart), every open
tab reflects it without a refresh. This is intentionally simple — swap
polling for a WebSocket/Server-Sent Events push if you want sub-second
updates instead of a 4s ceiling.

### Checkout flow

1. Client cart → `POST /api/checkout` with `{ id, quantity }` lines only
   (never prices — those are re-read from the server catalog so a shopper
   can't tamper with amounts).
2. Server validates stock, builds Stripe `line_items`, creates a Checkout
   Session, returns its URL.
3. Browser redirects to Stripe-hosted checkout.
4. On success, Stripe calls `POST /api/webhook` → `checkout.session.completed`
   → stock is decremented via `reserveStock()`.
5. Stripe redirects the shopper to `/checkout/success`, which reads the
   session back from Stripe to show a receipt, and clears the local cart.

## Known limitations (by design, for a demo)

- **In-memory inventory**: stock lives in a `Map` inside the Node process.
  It resets on server restart and won't stay consistent across multiple
  serverless instances. Swap `lib/inventory.ts` for calls to Postgres/
  Supabase/PlanetScale (with a real transaction for `reserveStock`) or a
  Redis store like Upstash for production. The rest of the app doesn't
  need to change — everything else calls into this module.
- **No auth / order history**: there's no user accounts system. Orders
  aren't persisted anywhere beyond Stripe's own dashboard.
- **US-centric tax**: `automatic_tax` is disabled; enable it in the Stripe
  dashboard and flip the flag in `api/checkout/route.ts` if you need it.
- **Google Fonts**: `next/font/google` was left out so the project builds
  without network access in sandboxed environments. To use Inter, restore
  it in `src/app/layout.tsx`:

  ```tsx
  import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
  // add className={inter.variable} to the <html> tag
  ```

  and reference `var(--font-inter)` first in `tailwind.config.ts`'s
  `fontFamily.sans`.

## Deploying

Works out of the box on [Vercel](https://vercel.com). Set the same four
environment variables in your project settings, and add a webhook endpoint
in the Stripe dashboard pointing at `https://your-domain.com/api/webhook`
for the `checkout.session.completed` event (this replaces `stripe listen`
in production).
