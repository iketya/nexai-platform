import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ad-slot";
import { AGENT_CATEGORIES } from "@/lib/agent-options";
import { getAdConfig } from "@/lib/ads";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "専門AIを探す" };
export const dynamic = "force-dynamic";

export default async function AgentsPage({ searchParams }: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const adPromise = getAdConfig("AGENTS");
  const params = await searchParams;
  const search = String(params.q ?? "").trim().slice(0, 80);
  const category = AGENT_CATEGORIES.includes(params.category as (typeof AGENT_CATEGORIES)[number])
    ? params.category
    : "";
  const safeSearch = search.replace(/[,().%_]/g, " ").replace(/\s+/g, " ").trim();

  const supabase = await createClient();
  let query = supabase
    .from("agents")
    .select("id, slug, name, description, icon, category, tone, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (category) query = query.eq("category", category);
  if (safeSearch) {
    query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
  }

  const { data: agents, error } = await query;
  const ad = await adPromise;

  return (
    <main className="mx-auto max-w-7xl px-5 py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">AI MARKETPLACE</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">専門AIを探す</h1>
          <p className="mt-3 text-slate-400">今の目的に合うAIを見つけて、すぐに相談できます。</p>
        </div>
        <Link href="/create" className="w-fit rounded-2xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400">＋ AIを作る</Link>
      </div>

      <form className="mt-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-3 sm:flex-row">
        <label htmlFor="agent-search" className="sr-only">AIを検索</label>
        <input id="agent-search" name="q" defaultValue={search} maxLength={80} placeholder="AI名や説明から検索" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 text-white placeholder:text-slate-500" />
        {category && <input type="hidden" name="category" value={category} />}
        <button className="min-h-12 rounded-xl bg-white px-6 font-bold text-slate-950 hover:bg-cyan-100">検索</button>
      </form>

      <nav aria-label="カテゴリ" className="mt-5 flex flex-wrap gap-2">
        <Link href={search ? `/agents?q=${encodeURIComponent(search)}` : "/agents"} className={`rounded-full border px-4 py-2 text-sm font-bold ${!category ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>すべて</Link>
        {AGENT_CATEGORIES.map((item) => {
          const href = `/agents?category=${encodeURIComponent(item)}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
          return <Link key={item} href={href} className={`rounded-full border px-4 py-2 text-sm font-bold ${category === item ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-400 hover:text-white"}`}>{item}</Link>;
        })}
      </nav>

      {ad && <AdSlot clientId={ad.clientId} slotId={ad.slotId} label="AI一覧広告" />}

      {error && <p className="mt-10 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200">AI一覧を読み込めませんでした。時間を置いて再度お試しください。</p>}

      {!error && agents?.length === 0 && (
        <section className="mt-10 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center"><div className="text-5xl">⌕</div><h2 className="mt-5 text-2xl font-bold">条件に合うAIが見つかりません</h2><p className="mt-3 text-slate-400">検索条件を変えるか、新しいAIを作成してみてください。</p><Link href="/agents" className="mt-7 inline-block rounded-xl border border-white/15 px-5 py-3 font-bold">条件をリセット</Link></section>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map((agent) => (
          <Link key={agent.id} href={`/agents/${agent.slug}`} className="group rounded-3xl border border-white/10 bg-slate-900/80 p-6 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900">
            <div className="flex items-start justify-between gap-4"><div className="grid size-14 place-items-center rounded-2xl bg-white/5 text-4xl">{agent.icon}</div><span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-400">{agent.category}</span></div>
            <h2 className="mt-5 text-xl font-bold group-hover:text-cyan-200">{agent.name}</h2>
            <p className="mt-3 line-clamp-3 min-h-[4.5rem] leading-6 text-slate-400">{agent.description || "説明はありません。"}</p>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm"><span className="text-slate-500">{agent.tone}</span><span className="font-bold text-cyan-300">会話する →</span></div>
          </Link>
        ))}
      </div>
    </main>
  );
}
