"use server";

import { redirect } from "next/navigation";
import { planFor } from "@/lib/billing";
import { parseAgentForm } from "@/lib/agent-options";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CreateAgentState = {
  message: string;
};

function makeSlug(name: string) {
  const base = name
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  return `${base || "agent"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createAgent(
  _previousState: CreateAgentState,
  formData: FormData,
): Promise<CreateAgentState> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const [{ count, error: countError }, { data: subscription }] = await Promise.all([
    supabase
    .from("agents")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", user.id),
    supabase
      .from("subscriptions")
      .select("status, stripe_price_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (countError) {
    console.error("Agent count error:", countError);
    return { message: "利用状況を確認できませんでした。時間を置いて再度お試しください。" };
  }
  const agentLimit = planFor(subscription).agentLimit;
  if ((count ?? 0) >= agentLimit) {
    return { message: `現在のプランで作成できるAIは${agentLimit}個までです。不要なAIを削除するか、料金プランをご確認ください。` };
  }

  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { message: parsed.error };

  const slug = makeSlug(parsed.data.name);

  const { data: created, error } = await createAdminClient().rpc("create_agent_with_limit", {
    p_user_id: user.id,
    p_limit: agentLimit,
    p_name: parsed.data.name,
    p_slug: slug,
    p_description: parsed.data.description,
    p_icon: parsed.data.icon,
    p_category: parsed.data.category,
    p_tone: parsed.data.tone,
    p_system_prompt: parsed.data.systemPrompt,
    p_is_public: parsed.data.isPublic,
  });

  if (error) {
    console.error("Agent insert error:", error);

    return {
      message: "AIの保存に失敗しました。時間を置いて再度お試しください。",
    };
  }
  if (created !== true) {
    return { message: `現在のプランで作成できるAIは${agentLimit}個までです。不要なAIを削除するか、料金プランをご確認ください。` };
  }

  redirect(`/agents/${encodeURIComponent(slug)}`);
}
