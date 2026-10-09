import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { hasProAccess, planFor, startOfJapanPeriod } from "@/lib/billing";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteAgentForm from "./delete-agent-form";

export const metadata: Metadata = { title: "ダッシュボード" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ deleted?: string; updated?: string; error?: string; checkout?: string; billing?: string; admin?: string; password?: string }>;
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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, stripe_price_id, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: favoriteRows, error: favoriteError } = await supabase
    .from("agent_favorites")
    .select("agent_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const favoriteIds = favoriteRows?.map((row) => row.agent_id) ?? [];
  const { data: favoriteAgents, error: favoriteAgentsError } = favoriteIds.length
    ? await supabase.from("agents").select("id, slug, name, description, icon, category").in("id", favoriteIds)
    : { data: [], error: null };
  const visibleFavorites = favoriteIds.flatMap((id) => {
    const agent = favoriteAgents?.find((candidate) => candidate.id === id);
    return agent ? [agent] : [];
  });

  const publishedCount = agents?.filter((agent) => agent.is_public).length ?? 0;
  const isPro = hasProAccess(subscription);
  const plan = planFor(subscription);
  const admin = createAdminClient();
  const [{ count: dailyUsed, error: dailyUsageError }, { count: monthlyUsed, error: monthlyUsageError }] = await Promise.all([
    admin.from("chat_usage_events").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).gte("created_at", startOfJapanPeriod("day")),
    admin.from("chat_usage_events").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).gte("created_at", startOfJapanPeriod("month")),
  ]);

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

      {params.checkout && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">お申し込みを受け付けました。契約状態は通常数秒で反映されます。</p>}
      {params.billing && <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-amber-100">契約管理画面を開けませんでした。時間を置いて再度お試しください。</p>}
      {params.admin === "denied" && <p className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200">管理者画面へのアクセス権限がありません。</p>}
      {params.password === "updated" && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">パスワードを変更しました。ログイン状態も正常に反映されています。</p>}

      <section className="mt-10 flex flex-col gap-5 rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-indigo-500/15 to-cyan-400/5 p-6 md:flex-row md:items-center">
        <div className="mr-auto">
          <p className="text-sm font-bold text-cyan-300">現在のプラン</p>
          <h2 className="mt-1 text-3xl font-black">{isPro ? "Pro" : "Free"}</h2>
          <p className="mt-2 text-sm text-slate-400">AIチャット 1日{plan.dailyMessages}回・月{plan.monthlyMessages}回、AI作成 {plan.agentLimit}個・お気に入り固定 {plan.favoriteLimit}件まで</p>
          {!dailyUsageError && !monthlyUsageError && (
            <p className="mt-2 text-sm text-cyan-200">本日の残り {Math.max(0, plan.dailyMessages - (dailyUsed ?? 0))}回 ／ 今月の残り {Math.max(0, plan.monthlyMessages - (monthlyUsed ?? 0))}回</p>
          )}
          {isPro && subscription?.cancel_at_period_end && subscription.current_period_end && (
            <p className="mt-2 text-sm text-amber-200">{new Date(subscription.current_period_end).toLocaleDateString("ja-JP")} にProが終了します。</p>
          )}
        </div>
        {subscription?.stripe_customer_id ? (
          <form action="/api/stripe/portal" method="post">
            <button className="rounded-xl bg-white px-5 py-3 font-bold text-slate-950 hover:bg-cyan-100">契約・支払いを管理</button>
          </form>
        ) : (
          <Link href="/pricing" className="rounded-xl bg-cyan-300 px-5 py-3 text-center font-bold text-slate-950 hover:bg-cyan-200">プランを見る</Link>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">作成したAI</p><p className="mt-2 text-3xl font-black">{agents?.length ?? 0}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">公開中</p><p className="mt-2 text-3xl font-black text-cyan-300">{publishedCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">非公開</p><p className="mt-2 text-3xl font-black">{(agents?.length ?? 0) - publishedCount}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><p className="text-sm text-slate-400">お気に入り固定</p><p className="mt-2 text-3xl font-black text-amber-200">{favoriteRows?.length ?? 0}<span className="ml-1 text-sm font-medium text-slate-500">/ {plan.favoriteLimit}</span></p></div>
      </div>

      {params.deleted && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">AIを削除しました。</p>}
      {params.updated && <p className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">AIの変更を保存しました。</p>}
      {(params.error || error || dailyUsageError || monthlyUsageError || favoriteError || favoriteAgentsError) && <p className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200">利用情報を読み込めませんでした。時間を置いて再度お試しください。</p>}

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">★ お気に入り固定</h2>
          <Link href="/agents" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">AIを探す →</Link>
        </div>
        {!favoriteError && !favoriteAgentsError && visibleFavorites.length === 0 && (
          <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-5 py-8 text-sm text-slate-400">よく使うAIを固定すると、ここからすぐに開けます。</p>
        )}
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleFavorites.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.slug}`} className="rounded-2xl border border-amber-300/15 bg-slate-900/80 p-5 hover:border-amber-300/40">
              <div className="text-3xl">{agent.icon}</div>
              <p className="mt-3 text-xs font-bold text-amber-200">{agent.category}</p>
              <h3 className="mt-1 text-lg font-bold">{agent.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{agent.description || "説明はありません。"}</p>
            </Link>
          ))}
        </div>
      </section>

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
