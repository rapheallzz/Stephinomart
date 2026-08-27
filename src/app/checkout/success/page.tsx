import { stripe } from "@/lib/stripe";
import SuccessClearCart from "@/components/SuccessClearCart";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  let email: string | null = null;
  let amount: number | null = null;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      email = session.customer_details?.email ?? null;
      amount = session.amount_total;
    } catch (err) {
      console.error("Could not retrieve checkout session:", err);
    }
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
      <SuccessClearCart />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Order confirmed
      </h1>
      <p className="mt-2 text-sm text-black/60">
        {email
          ? `A receipt is on its way to ${email}.`
          : "Thanks for your order — a confirmation email is on its way."}
      </p>
      {amount !== null && (
        <p className="mt-4 text-lg font-medium">
          {(amount / 100).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </p>
      )}
      <a
        href="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90"
      >
        Continue shopping
      </a>
    </main>
  );
}
