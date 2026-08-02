import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: agents, error } = await supabase
    .from("agents")
    .select("id, slug, name, description, icon, category, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-bold text-cyan-400">AI MARKETPLACE</p>
          <h1 className="mt-2 text-4xl font-black">公開AI</h1>
        </div>
        <Link href="/create" className="rounded-xl bg-indigo-500 px-5 py-3 font-bold">
          ＋ AIを作る
        </Link>
      </div>

      {error && <p className="mt-8 text-red-300">{error.message}</p>}

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.slug}`}
            className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <div className="text-4xl">{agent.icon}</div>
            <span className="mt-5 inline-block rounded-full border border-white/10 px-3 py-1 text-xs">
              {agent.category}
            </span>
            <h2 className="mt-4 text-xl font-bold">{agent.name}</h2>
            <p className="mt-3 text-slate-400">{agent.description || "説明はありません。"}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
