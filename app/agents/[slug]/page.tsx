import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AgentChat from "@/components/agent-chat";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/agents/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: agent } = await supabase.from("agents").select("name, description").eq("slug", slug).maybeSingle();
  if (!agent) return { title: "AIが見つかりません" };
  return { title: agent.name, description: agent.description || `${agent.name}と会話できます。` };
}

export default async function AgentPage({ params }: PageProps<"/agents/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name, description, icon, category, tone")
    .eq("slug", slug)
    .maybeSingle();

  if (!agent) notFound();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <Link href="/agents" className="text-sm font-bold text-slate-400 hover:text-white">← AI一覧へ</Link>
        <div className="mt-7 grid size-16 place-items-center rounded-2xl bg-white/5 text-5xl">{agent.icon}</div>
        <span className="mt-5 inline-block rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1 text-xs font-bold text-cyan-300">{agent.category}</span>
        <h1 className="mt-4 text-2xl font-black">{agent.name}</h1>
        <p className="mt-3 leading-7 text-slate-400">{agent.description || "説明はありません。"}</p>
        <div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs font-bold text-slate-500">話し方</p><p className="mt-2 text-sm text-slate-300">{agent.tone}</p></div>
        <p className="mt-6 rounded-xl bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/70">AIの回答は誤る場合があります。重要な判断では一次情報も確認してください。</p>
      </aside>
      <AgentChat agentId={agent.id} agentName={agent.name} />
    </main>
  );
}
