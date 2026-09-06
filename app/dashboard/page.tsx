import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteAgentForm from "./delete-agent-form";

export const metadata: Metadata = { title: "ダッシュボード" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ deleted?: string; updated?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents, error } = await supabase
    .from("agents")
    .select("id, slug, name, description, icon, category, is_public, created_at")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  const publishedCount = agents?.filter((agent) => agent.is_public).length ?? 0;

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">CREATOR STUDIO</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">ダッシュボード</h1>
          <p className="mt-3 text-slate-400">作成したAIの公開状態や内容を管理できます。</p>
        </div>
        <Link href="/create" className="w-fit rounded-2xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400">
          ＋ 新しいAIを作る
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">作成したAI</p><p className="mt-2 text-3xl font-black">{agents?.length ?? 0}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">公開中</p><p className="mt-2 text-3xl font-black text-cyan-300">{publishedCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">非公開</p><p className="mt-2 text-3xl font-black">{(agents?.length ?? 0) - publishedCount}</p></div>
      </div>

      {params.deleted && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">AIを削除しました。</p>}
      {params.updated && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">AIの変更を保存しました。</p>}
      {(params.error || error) && <p className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200">AI情報を読み込めませんでした。時間を置いて再度お試しください。</p>}

      {!error && agents?.length === 0 && (
        <section className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <div className="text-5xl">✦</div>
          <h2 className="mt-5 text-2xl font-bold">最初の専門AIを作りましょう</h2>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">名前、役割、話し方を設定すると、すぐに公開して会話を始められます。</p>
          <Link href="/create" className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-bold text-slate-950">AIを作成する</Link>
        </section>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {agents?.map((agent) => (
          <article key={agent.id} className="flex flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="text-4xl">{agent.icon}</div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${agent.is_public ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-700 text-slate-300"}`}>{agent.is_public ? "公開中" : "非公開"}</span>
            </div>
            <p className="mt-5 text-xs font-bold text-cyan-400">{agent.category}</p>
            <h2 className="mt-2 text-xl font-bold">{agent.name}</h2>
            <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">{agent.description || "説明はありません。"}</p>
            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <Link href={`/agents/${agent.slug}`} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold hover:bg-white/5">表示</Link>
              <Link href={`/dashboard/agents/${agent.id}/edit`} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold hover:bg-indigo-400">編集</Link>
              <DeleteAgentForm id={agent.id} name={agent.name} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
