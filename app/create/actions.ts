"use server";

import { redirect } from "next/navigation";
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

  const name = String(formData.get("name") ?? "").trim();
  const description = String(
    formData.get("description") ?? "",
  ).trim();
  const icon =
    String(formData.get("icon") ?? "🤖").trim() || "🤖";
  const category = String(
    formData.get("category") ?? "その他",
  );
  const tone = String(
    formData.get("tone") ?? "やさしく丁寧",
  );
  const systemPrompt = String(
    formData.get("systemPrompt") ?? "",
  ).trim();
  const isPublic = formData.get("isPublic") === "on";

  if (!name) {
    return {
      message: "AI名を入力してください。",
    };
  }

  if (systemPrompt.length < 10) {
    return {
      message: "役割・ルールを10文字以上入力してください。",
    };
  }

  const slug = makeSlug(name);

  const { error } = await supabase.from("agents").insert({
    creator_id: user.id,
    name,
    slug,
    description,
    icon,
    category,
    tone,
    system_prompt: systemPrompt,
    is_public: isPublic,
  });

  if (error) {
    console.error("Agent insert error:", error);

    return {
      message: `AIの保存に失敗しました：${error.message}`,
    };
  }

  redirect(`/agents/${encodeURIComponent(slug)}`);
}