import type { Metadata } from "next";
import Link from "next/link";
import { FREE_PLAN, hasProAccess, PRO_PLAN } from "@/lib/billing";
import { paymentsEnabled } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "料金プラン",
  description: "コトサキの無料プランとProプランをご案内します。",
};
export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  cancelled: "お申し込みはキャンセルされました。料金は発生していません。",
  unavailable: "現在、有料プランのお申し込み準備中です。",
  error: "決済画面を開けませんでした。時間を置いて再度お試しください。",
  "already-pro": "すでにProプランをご利用中です。",
};

export default async function PricingPage({ searchParams }: {
  searchParams: Promise<{ result?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = user
    ? await supabase
        .from("subscriptions")
        .select("status, stripe_price_id, cancel_at_period_end, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };
  const isPro = hasProAccess(subscription);
  const canPurchase = paymentsEnabled();

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">PRICING</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">必要な分だけ、シンプルに。</h1>
        <p className="mt-5 leading-8 text-slate-400">まずは無料で始め、もっと活用したくなったらいつでもProへ。</p>
      </div>

      {params.result && notices[params.result] && (
        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200">
          {notices[params.result]}
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
          <p className="font-bold text-slate-300">Free</p>
          <p className="mt-5 text-5xl font-black">¥0</p>
          <p className="mt-2 text-sm text-slate-500">ずっと無料</p>
          <ul className="mt-8 space-y-4 text-slate-300">
            <li>✓ AIチャット 1日{FREE_PLAN.dailyMessages}回・月{FREE_PLAN.monthlyMessages}回まで</li>
            <li>✓ 専門AIを{FREE_PLAN.agentLimit}個まで作成</li>
            <li>✓ お気に入りを{FREE_PLAN.favoriteLimit}件まで固定</li>
            <li>✓ 標準AIで気軽に相談</li>
            <li>✓ 会話履歴の保存</li>
            <li>✓ 公開AIの利用</li>
          </ul>
          <Link href={user ? "/dashboard" : "/login"} className="mt-9 block rounded-xl border border-white/15 px-5 py-3 text-center font-bold hover:bg-white/5">
            {user ? "現在のプランを確認" : "無料で始める"}
          </Link>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-cyan-300/30 bg-gradient-to-b from-indigo-500/20 to-slate-900 p-8 shadow-2xl shadow-indigo-950/40">
          <span className="absolute right-5 top-5 rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">おすすめ</span>
          <p className="font-bold text-cyan-300">Pro</p>
          <p className="mt-5 text-5xl font-black">¥980<span className="text-base font-medium text-slate-400"> / 月（税込）</span></p>
          <p className="mt-2 text-sm text-slate-400">いつでも解約できます</p>
          <ul className="mt-8 space-y-4 text-slate-200">
            <li>✓ AIチャット 1日{PRO_PLAN.dailyMessages}回・月{PRO_PLAN.monthlyMessages}回まで</li>
            <li>✓ 専門AIを{PRO_PLAN.agentLimit}個まで作成</li>
            <li>✓ お気に入りを{PRO_PLAN.favoriteLimit}件まで固定</li>
            <li>✓ より高品質なAIで回答</li>
            <li>✓ 広告を表示しない</li>
            <li>✓ Freeの全機能</li>
          </ul>

          {isPro ? (
            <form action="/api/stripe/portal" method="post" className="mt-9">
              <button className="w-full rounded-xl bg-white px-5 py-3 font-black text-slate-950 hover:bg-cyan-100">契約・お支払いを管理</button>
            </form>
          ) : !canPurchase ? (
            <p className="mt-9 rounded-xl border border-amber-300/20 bg-amber-300/10 px-5 py-3 text-center text-sm font-bold text-amber-100">有料プランは販売開始準備中です</p>
          ) : user ? (
            <form action="/api/stripe/checkout" method="post" className="mt-9">
              <button className="w-full rounded-xl bg-cyan-300 px-5 py-3 font-black text-slate-950 hover:bg-cyan-200">Proを始める</button>
            </form>
          ) : (
            <Link href="/login?next=/pricing" className="mt-9 block rounded-xl bg-cyan-300 px-5 py-3 text-center font-black text-slate-950 hover:bg-cyan-200">ログインして申し込む</Link>
          )}
        </section>
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-slate-500">
        利用回数は日本時間の毎日0時・毎月1日0時にリセットされます。月間上限に達した場合は翌月まで利用できません。無料チャットにはサービス全体の安全上限もあり、全体枠に達した場合は月内に利用を制限することがあります。<br />
        Proは月単位の自動更新です。解約後も現在の請求期間の終了までは利用できます。お申し込み前に
        <Link href="/terms" className="text-slate-300 underline">利用規約</Link>と
        <Link href="/commercial-transactions" className="text-slate-300 underline">特定商取引法に基づく表記</Link>をご確認ください。
      </p>
    </main>
  );
}
