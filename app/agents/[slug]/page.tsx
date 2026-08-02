import { notFound } from "next/navigation";
import AgentChat from "@/components/agent-chat";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, name, description, icon, category, tone")
    .eq("slug", slug)
    .maybeSingle();

  if (!agent) notFound();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-12 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-2xl border border-white/10 bg-slate-900 p-6">
        <div className="text-5xl">{agent.icon}</div>
        <h1 className="mt-5 text-2xl font-black">{agent.name}</h1>
        <p className="mt-3 text-slate-400">{agent.description}</p>
        <p className="mt-5 text-sm text-slate-400">{agent.category}・{agent.tone}</p>
      </aside>
      <AgentChat agentId={agent.id} agentName={agent.name} />
    </main>
  );
}
