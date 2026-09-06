"use server";

import { redirect } from "next/navigation";
import { parseAgentForm } from "@/lib/agent-options";
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

  const { count, error: countError } = await supabase
    .from("agents")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", user.id);
  if (countError) {
    console.error("Agent count error:", countError);
    return { message: "利用状況を確認できませんでした。時間を置いて再度お試しください。" };
  }
  if ((count ?? 0) >= 25) {
    return { message: "作成できるAIは25個までです。不要なAIを削除してからお試しください。" };
  }

  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { message: parsed.error };

  const slug = makeSlug(parsed.data.name);

  const { error } = await supabase.from("agents").insert({
    creator_id: user.id,
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    icon: parsed.data.icon,
    category: parsed.data.category,
    tone: parsed.data.tone,
    system_prompt: parsed.data.systemPrompt,
    is_public: parsed.data.isPublic,
  });

  if (error) {
    console.error("Agent insert error:", error);

    return {
      message: "AIの保存に失敗しました。時間を置いて再度お試しください。",
    };
  }

  redirect(`/agents/${encodeURIComponent(slug)}`);
}
