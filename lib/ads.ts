import "server-only";

import { hasProAccess } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";

type AdPlacement = "HOME" | "AGENTS";

export type AdConfig = {
  clientId: string;
  slotId: string;
};

function validClientId(value: string) {
  return /^ca-pub-\d{10,}$/.test(value);
}

function validSlotId(value: string) {
  return /^\d{6,}$/.test(value);
}

export async function getAdConfig(placement: AdPlacement): Promise<AdConfig | null> {
  if (process.env.ADSENSE_ENABLED !== "true") return null;

  const clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID?.trim() ?? "";
  const slotId = process.env[`GOOGLE_ADSENSE_${placement}_SLOT_ID`]?.trim() ?? "";
  if (!validClientId(clientId) || !validSlotId(slotId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("status, stripe_price_id, current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || hasProAccess(subscription)) return null;
  }

  return { clientId, slotId };
}
