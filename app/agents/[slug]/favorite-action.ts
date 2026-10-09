"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { planFor } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function setFavorite(formData: FormData) {
  const agentId = String(formData.get("agentId") ?? "");
  const wantFavorite = formData.get("favorite") === "true";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentId)) {
    redirect("/agents");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: agent } = await supabase.from("agents").select("id, slug").eq("id", agentId).maybeSingle();
  if (!agent) redirect("/agents");
  const path = `/agents/${encodeURIComponent(agent.slug)}`;
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);

  const { data: subscription, error: subscriptionError } = await supabase.from("subscriptions")
    .select("status, stripe_price_id").eq("user_id", user.id).maybeSingle();
  if (subscriptionError) redirect(`${path}?favorite=error`);
  const { data: result, error } = await createAdminClient().rpc("set_agent_favorite", {
    p_user_id: user.id,
    p_agent_id: agent.id,
    p_favorite: wantFavorite,
    p_limit: planFor(subscription).favoriteLimit,
  });
  if (error || typeof result !== "string" || result === "not_found") {
    console.error("Favorite update error:", error);
    redirect(`${path}?favorite=error`);
  }
  revalidatePath(path);
  revalidatePath("/dashboard");
  redirect(result === "limit" ? `${path}?favorite=limit` : path);
}
