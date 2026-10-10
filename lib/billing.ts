type SubscriptionLike = {
  status?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
  stripe_customer_id?: string | null;
  stripe_price_id?: string | null;
};

const PRO_STATUSES = new Set(["active", "trialing"]);

export const FREE_PLAN = {
  dailyMessages: 30,
  monthlyMessages: 300,
  agentLimit: 10,
  favoriteLimit: 10,
  model: "gemini-3.1-flash-lite",
} as const;

export const PRO_PLAN = {
  dailyMessages: 100,
  monthlyMessages: 1000,
  agentLimit: 25,
  favoriteLimit: 100,
  model: "gemini-2.5-flash",
} as const;

export function hasProAccess(subscription: SubscriptionLike | null | undefined) {
  if (!subscription?.status || !PRO_STATUSES.has(subscription.status)) return false;
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
  return Boolean(proPriceId) && subscription.stripe_price_id === proPriceId;
}

export function planFor(subscription: SubscriptionLike | null | undefined) {
  return hasProAccess(subscription) ? PRO_PLAN : FREE_PLAN;
}

export function startOfJapanPeriod(period: "day" | "month", now = new Date()) {
  const japanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const startUtc = Date.UTC(
    japanTime.getUTCFullYear(),
    japanTime.getUTCMonth(),
    period === "day" ? japanTime.getUTCDate() : 1,
  ) - 9 * 60 * 60 * 1000;
  return new Date(startUtc).toISOString();
}
