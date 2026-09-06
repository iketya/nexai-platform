import { NextResponse } from "next/server";
import { hasProAccess } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getSiteUrl,
  getStripe,
  paymentsEnabled,
  requestHasTrustedOrigin,
} from "@/lib/stripe";

export const runtime = "nodejs";

function pricingRedirect(request: Request, result: string) {
  return NextResponse.redirect(new URL(`/pricing?result=${result}`, request.url), 303);
}

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!paymentsEnabled()) return pricingRedirect(request, "unavailable");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(new URL("/login?next=/pricing", request.url), 303);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_price_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (hasProAccess(subscription)) return pricingRedirect(request, "already-pro");

  try {
    const stripe = getStripe();
    let customerId = subscription?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      const { error } = await createAdminClient().from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: "incomplete",
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    const siteUrl = getSiteUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?result=cancelled`,
      locale: "ja",
      allow_promotion_codes: true,
      metadata: { supabase_user_id: user.id },
      subscription_data: { metadata: { supabase_user_id: user.id } },
    });

    if (!session.url) throw new Error("Stripe Checkout URL was not returned");
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return pricingRedirect(request, "error");
  }
}
