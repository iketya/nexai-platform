import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  let userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    const { data } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id ?? "";
  }
  if (!userId) throw new Error("Subscription is missing a user mapping");

  const firstItem = subscription.items.data[0];
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;

  const { error } = await admin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: firstItem?.price.id ?? null,
    status: subscription.status,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return new Response("Webhook is not configured", { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (typeof session.subscription === "string") {
          await syncSubscription(
            await getStripe().subscriptions.retrieve(session.subscription),
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const details = event.data.object.parent?.subscription_details;
        const subscriptionId = typeof details?.subscription === "string"
          ? details.subscription
          : details?.subscription.id;
        if (subscriptionId) {
          await syncSubscription(
            await getStripe().subscriptions.retrieve(subscriptionId),
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}
