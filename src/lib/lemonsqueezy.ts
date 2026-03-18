import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  updateSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";

export function configureLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set");
  }
  lemonSqueezySetup({ apiKey });
}

const VARIANT_TO_PLAN: Record<string, string> = {};

function buildVariantMap() {
  const mappings = [
    { env: "NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID", plan: "plus" },
    { env: "NEXT_PUBLIC_LEMONSQUEEZY_PLUS_ANNUAL_VARIANT_ID", plan: "plus" },
    { env: "NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID", plan: "pro" },
    { env: "NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID", plan: "pro" },
  ];
  for (const { env, plan } of mappings) {
    const variantId = process.env[env];
    if (variantId) VARIANT_TO_PLAN[variantId] = plan;
  }
}

export function variantIdToPlan(variantId: string): string | null {
  if (Object.keys(VARIANT_TO_PLAN).length === 0) buildVariantMap();
  return VARIANT_TO_PLAN[variantId] ?? null;
}

export async function getCheckoutUrl({
  variantId,
  userId,
  userEmail,
  plan,
}: {
  variantId: string;
  userId: string;
  userEmail: string;
  plan: string;
}) {
  configureLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
        plan,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenuemap.app"}/dashboard?checkout=success`,
    },
  });

  if (error) throw new Error(error.message);
  return data?.data?.attributes?.url ?? null;
}

export function getVariantIdForPlan(plan: string, annual: boolean): string | null {
  const envMap: Record<string, string> = {
    "plus-monthly": "NEXT_PUBLIC_LEMONSQUEEZY_PLUS_MONTHLY_VARIANT_ID",
    "plus-annual": "NEXT_PUBLIC_LEMONSQUEEZY_PLUS_ANNUAL_VARIANT_ID",
    "pro-monthly": "NEXT_PUBLIC_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID",
    "pro-annual": "NEXT_PUBLIC_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID",
  };
  const key = `${plan}-${annual ? "annual" : "monthly"}`;
  const envVar = envMap[key];
  if (!envVar) return null;
  return process.env[envVar] ?? null;
}

export async function changeSubscriptionPlan(subscriptionId: string, newVariantId: number) {
  configureLemonSqueezy();

  const { data, error } = await updateSubscription(subscriptionId, {
    variantId: newVariantId,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomerPortalUrl(subscriptionId: string) {
  configureLemonSqueezy();

  const { data, error } = await getSubscription(subscriptionId);
  if (error) throw new Error(error.message);

  return data?.data?.attributes?.urls?.customer_portal ?? null;
}
