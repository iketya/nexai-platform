import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "管理者ダッシュボード" };
export const dynamic = "force-dynamic";

const numberFormatter = new Intl.NumberFormat("ja-JP");
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value?: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function StatCard({ label, value, detail, tone = "default" }: {
  label: string;
  value: number;
  detail: string;
  tone?: "default" | "cyan" | "emerald" | "amber";
}) {
  const colors = {
    default: "text-white",
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    amber: "text-amber-200",
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/10">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${colors[tone]}`}>{numberFormatter.format(value)}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-700/70 text-slate-300"}`}>
      {active ? "公開" : "非公開"}
    </span>
  );
}

export default async function AdminPage() {
  const currentUser = await requireAdmin();
  const admin = createAdminClient();

  const [
    usersResult,
    profilesResult,
    agentsResult,
    publicAgentsResult,
    conversationsResult,
    messagesResult,
    paidSubscriptionsResult,
    recentAgentsResult,
    subscriptionsResult,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 10 }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("agents").select("id", { count: "exact", head: true }),
    admin.from("agents").select("id", { count: "exact", head: true }).eq("is_public", true),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("messages").select("id", { count: "exact", head: true }),
    admin.from("subscriptions").select("user_id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
    admin
      .from("agents")
      .select("id, slug, name, icon, category, is_public, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("subscriptions")
      .select("user_id, status, cancel_at_period_end, current_period_end, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const recentUsers = usersResult.data?.users ?? [];
  const recentAgents = recentAgentsResult.data ?? [];
  const subscriptions = subscriptionsResult.data ?? [];
  const dataErrors = [
    usersResult.error,
    profilesResult.error,
    agentsResult.error,
    publicAgentsResult.error,
    conversationsResult.error,
    messagesResult.error,
    paidSubscriptionsResult.error,
    recentAgentsResult.error,
    subscriptionsResult.error,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">NEXAI ADMIN</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">管理者ダッシュボード</h1>
          <p className="mt-3 text-slate-400">サービス全体の登録・利用・契約状況を確認できます。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/agents" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5">公開画面を見る</Link>
          <Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">作成者画面へ</Link>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-cyan-400/10 to-indigo-500/10 px-5 py-4">
        <p className="text-sm text-slate-300">
          管理者としてログイン中 <span className="ml-2 font-bold text-white">{currentUser.email ?? currentUser.id}</span>
        </p>
      </section>

      {dataErrors.length > 0 && (
        <p className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          一部の集計を取得できませんでした。少し時間を置いて再読み込みしてください。
        </p>
      )}

      <section aria-labelledby="summary-heading" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-slate-500">OVERVIEW</p>
            <h2 id="summary-heading" className="mt-2 text-2xl font-black">全体サマリー</h2>
          </div>
          <p className="text-xs text-slate-500">ページを開いた時点の情報</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="登録ユーザー" value={profilesResult.count ?? recentUsers.length} detail="プロフィール作成済み" tone="cyan" />
          <StatCard label="作成されたAI" value={agentsResult.count ?? 0} detail={`公開中 ${numberFormatter.format(publicAgentsResult.count ?? 0)}件`} />
          <StatCard label="会話" value={conversationsResult.count ?? 0} detail={`メッセージ ${numberFormatter.format(messagesResult.count ?? 0)}件`} tone="amber" />
          <StatCard label="Pro契約" value={paidSubscriptionsResult.count ?? 0} detail="有効・トライアル中" tone="emerald" />
        </div>
      </section>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="users-heading" className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="text-xs font-bold tracking-[0.16em] text-cyan-400">USERS</p>
            <h2 id="users-heading" className="mt-2 text-xl font-black">最近の登録ユーザー</h2>
          </div>
          <div className="divide-y divide-white/5">
            {recentUsers.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">登録ユーザーはいません。</p>}
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-500/15 font-black text-indigo-200">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-100">{user.email ?? "メールアドレスなし"}</p>
                  <p className="mt-1 text-xs text-slate-500">登録 {formatDate(user.created_at)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.email_confirmed_at ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-300/10 text-amber-200"}`}>
                  {user.email_confirmed_at ? "確認済み" : "未確認"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="agents-heading" className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-cyan-400">AGENTS</p>
              <h2 id="agents-heading" className="mt-2 text-xl font-black">最近作成されたAI</h2>
            </div>
            <Link href="/agents" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">一覧を見る</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentAgents.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">作成されたAIはありません。</p>}
            {recentAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 px-6 py-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">{agent.icon}</div>
                <div className="min-w-0 flex-1">
                  <Link href={`/agents/${agent.slug}`} className="truncate text-sm font-bold text-slate-100 hover:text-cyan-300">{agent.name}</Link>
                  <p className="mt-1 truncate text-xs text-slate-500">{agent.category} ・ {formatDate(agent.created_at)}</p>
                </div>
                <StatusBadge active={agent.is_public} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section aria-labelledby="billing-heading" className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-bold tracking-[0.16em] text-emerald-400">BILLING</p>
          <h2 id="billing-heading" className="mt-2 text-xl font-black">最近の契約状況</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">ユーザーID</th>
                <th className="px-6 py-3 font-semibold">状態</th>
                <th className="px-6 py-3 font-semibold">次回更新・終了</th>
                <th className="px-6 py-3 font-semibold">登録日時</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">契約データはまだありません。</td></tr>
              )}
              {subscriptions.map((subscription) => (
                <tr key={subscription.user_id} className="text-slate-300">
                  <td className="max-w-56 truncate px-6 py-4 font-mono text-xs text-slate-400">{subscription.user_id}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold">{subscription.status}</span></td>
                  <td className="whitespace-nowrap px-6 py-4">{subscription.cancel_at_period_end ? "解約予定・" : ""}{formatDate(subscription.current_period_end)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">{formatDate(subscription.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
