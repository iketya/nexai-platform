import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditAgentForm from "./edit-agent-form";

export const metadata: Metadata = { title: "AIを編集" };

export default async function EditAgentPage({ params }: PageProps<"/dashboard/agents/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name, description, icon, category, tone, system_prompt, is_public")
    .eq("id", id)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!agent) notFound();

  return <main className="mx-auto max-w-4xl px-5 py-14"><p className="text-sm font-bold tracking-[0.18em] text-cyan-400">AGENT SETTINGS</p><h1 className="mt-3 text-4xl font-black">AIを編集</h1><p className="mt-3 text-slate-400">公開内容とAIの回答方針を変更できます。</p><EditAgentForm agent={agent} /></main>;
}
