import { createClient } from "@/lib/supabase/server";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId, plan, surveyId } = await request.json();

    if (!variantId || !plan) {
      return Response.json({ error: "Missing variantId or plan" }, { status: 400 });
    }

    const url = await getCheckoutUrl({
      variantId,
      userId: user.id,
      userEmail: user.email ?? "",
      plan,
      surveyId: surveyId || undefined,
    });

    if (!url) {
      return Response.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    return Response.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}
