import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export async function redirectToCheckout(priceId: string) {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const { sessionId } = await res.json();
  const stripe = await stripePromise;
  if (stripe) {
    await stripe.redirectToCheckout({ sessionId });
  }
}

export async function redirectToPortal() {
  const res = await fetch("/api/stripe/create-portal", {
    method: "POST",
  });
  const { url } = await res.json();
  window.location.href = url;
}
