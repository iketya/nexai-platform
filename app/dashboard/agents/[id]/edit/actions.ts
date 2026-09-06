"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAgentForm } from "@/lib/agent-options";
import { createClient } from "@/lib/supabase/server";

export type UpdateAgentState = { message: string };

export async function updateAgent(_previousState: UpdateAgentState, formData: FormData): Promise<UpdateAgentState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { message: "AIを特定できませんでした。" };

  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { message: parsed.error };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("agents")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      icon: parsed.data.icon,
      category: parsed.data.category,
      tone: parsed.data.tone,
      system_prompt: parsed.data.systemPrompt,
      is_public: parsed.data.isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("creator_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error || !data) {
    console.error("Agent update error:", error);
    return { message: "AIの更新に失敗しました。時間を置いて再度お試しください。" };
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/${data.slug}`);
  revalidatePath("/dashboard");
  redirect("/dashboard?updated=1");
}
