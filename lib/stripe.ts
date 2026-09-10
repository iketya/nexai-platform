import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return "http://localhost:3000";
  try {
    return new URL(configured).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function paymentsEnabled() {
  return (
    process.env.PAYMENTS_ENABLED === "true" &&
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    Boolean(process.env.STRIPE_PRO_PRICE_ID) &&
    Boolean(process.env.STRIPE_WEBHOOK_SECRET) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function requestHasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === getSiteUrl();
}
