type SubscriptionLike = {
  status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
};

const PRO_STATUSES = new Set(["active", "trialing"]);

export function hasProAccess(subscription: SubscriptionLike | null | undefined) {
  if (!subscription?.status || !PRO_STATUSES.has(subscription.status)) return false;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  return !proPriceId || subscription.stripe_price_id === proPriceId;
}

function configuredLimit(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? Math.min(value, 5000) : fallback;
}

export function dailyMessageLimit(subscription: SubscriptionLike | null | undefined) {
  return hasProAccess(subscription)
    ? configuredLimit("PRO_DAILY_MESSAGE_LIMIT", 300)
    : configuredLimit("FREE_DAILY_MESSAGE_LIMIT", 30);
}
