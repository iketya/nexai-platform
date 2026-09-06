import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, getStripe, requestHasTrustedOrigin } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!requestHasTrustedOrigin(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(new URL("/dashboard?billing=unavailable", request.url), 303);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getSiteUrl()}/dashboard`,
      locale: "ja",
    });
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.redirect(new URL("/dashboard?billing=error", request.url), 303);
  }
}
