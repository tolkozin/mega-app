import { createClient } from "@/lib/supabase/server";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  try {
    const { variantId, plan, surveyId, userId: bodyUserId, userEmail: bodyUserEmail } = await request.json();

    if (!variantId || !plan) {
      return Response.json({ error: "Missing variantId or plan" }, { status: 400 });
    }

    // Try to get user from session (normal flow)
    let userId = "";
    let userEmail = "";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      userEmail = user.email ?? "";
    } else if (bodyUserId && bodyUserEmail) {
      // Fallback: accept userId from request body (for fresh signups where
      // session cookie hasn't propagated to server yet).
      // This is safe because the webhook verifies the subscription independently.
      userId = bodyUserId;
      userEmail = bodyUserEmail;
    } else {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = await getCheckoutUrl({
      variantId,
      userId,
      userEmail,
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
