import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { variantIdToPlan } from "@/lib/lemonsqueezy";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
      survey_id?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      customer_id: number;
      variant_id: number;
      status: string;
      first_subscription_item?: {
        subscription_id: number;
      };
      urls?: {
        customer_portal?: string;
      };
    };
  };
}

/**
 * Idempotency: check if this event was already processed.
 * Uses subscription_id + event_name as a dedup key.
 * Returns true if already processed (skip), false if new.
 */
async function isDuplicate(
  supabase: ReturnType<typeof getAdminClient>,
  subscriptionId: string,
  eventName: string
): Promise<boolean> {
  const eventKey = `${subscriptionId}:${eventName}`;

  const { data } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_key", eventKey)
    .maybeSingle();

  if (data) return true;

  // Insert — if it fails (race condition), treat as duplicate
  const { error } = await supabase
    .from("webhook_events")
    .insert({ event_key: eventKey, event_name: eventName, subscription_id: subscriptionId });

  return !!error;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") ?? "";

    if (!verifySignature(rawBody, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: WebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const attrs = event.data.attributes;
    const customerId = String(attrs.customer_id);
    const subscriptionId = event.data.id;
    const variantId = String(attrs.variant_id);

    const supabase = getAdminClient();

    // Idempotency check — skip if already processed
    // Only for state-changing events (skip for subscription_updated which can repeat with new data)
    if (eventName === "subscription_created") {
      const dup = await isDuplicate(supabase, subscriptionId, eventName);
      if (dup) {
        return Response.json({ ok: true, skipped: "duplicate" });
      }
    }

    switch (eventName) {
      case "subscription_created": {
        const userId = event.meta.custom_data?.user_id;
        const surveyId = event.meta.custom_data?.survey_id;
        const plan = variantIdToPlan(variantId) ?? event.meta.custom_data?.plan ?? "plus";

        if (!userId) {
          console.error("subscription_created: missing user_id in custom_data");
          return Response.json({ error: "Missing user_id" }, { status: 400 });
        }

        await supabase
          .from("profiles")
          .update({
            lemon_squeezy_customer_id: customerId,
            lemon_squeezy_subscription_id: subscriptionId,
            subscription_status: "active",
            plan,
          })
          .eq("id", userId);

        // Create project from survey if survey_id is present
        if (surveyId) {
          try {
            // Check if survey already has a project (prevent duplicates)
            const { data: survey } = await supabase
              .from("survey_responses")
              .select("answers, status, project_id")
              .eq("id", surveyId)
              .eq("user_id", userId)
              .single();

            if (survey?.answers && survey.status !== "completed") {
              const answers = survey.answers as Record<string, unknown>;
              const productType = (answers.projectType as string) ?? "subscription";
              const validTypes = ["subscription", "ecommerce", "saas"];
              const type = validTypes.includes(productType) ? productType : "subscription";

              const industry = answers.industry as string ?? "";
              const now = new Date();
              const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });
              const name = industry && industry !== "Other"
                ? `${industry} — ${monthName}`
                : `My Project — ${monthName}`;

              const { data: project } = await supabase
                .from("projects")
                .insert({
                  user_id: userId,
                  name,
                  description: "Created from your survey answers",
                  product_type: type,
                })
                .select("id")
                .single();

              if (project) {
                await supabase
                  .from("survey_responses")
                  .update({ status: "completed", project_id: project.id })
                  .eq("id", surveyId);
              }
            }
          } catch (e) {
            console.error("Failed to create project from survey:", e);
          }
        }

        break;
      }

      case "subscription_updated": {
        const plan = variantIdToPlan(variantId);

        const updateData: Record<string, string> = {
          subscription_status: attrs.status,
        };
        if (plan) updateData.plan = plan;

        await supabase
          .from("profiles")
          .update(updateData)
          .eq("lemon_squeezy_subscription_id", subscriptionId);

        break;
      }

      case "subscription_cancelled": {
        await supabase
          .from("profiles")
          .update({ subscription_status: "cancelled" })
          .eq("lemon_squeezy_subscription_id", subscriptionId);

        break;
      }

      case "subscription_expired": {
        await supabase
          .from("profiles")
          .update({
            plan: "expired",
            subscription_status: "expired",
          })
          .eq("lemon_squeezy_subscription_id", subscriptionId);

        break;
      }

      case "subscription_resumed": {
        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("lemon_squeezy_subscription_id", subscriptionId);

        break;
      }

      case "subscription_payment_failed": {
        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("lemon_squeezy_subscription_id", subscriptionId);

        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
