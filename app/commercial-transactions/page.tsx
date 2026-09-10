import type { Metadata } from "next";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

const rows = [
  ["販売事業者", "NexAI運営者（個人）。氏名は請求があった場合、遅滞なく開示します。"],
  ["運営責任者", "請求があった場合、遅滞なく開示します。"],
  ["所在地・電話番号", "請求があった場合、遅滞なく開示します。"],
  ["お問い合わせ", "ijetyan1021@gmail.com（お問い合わせページからもご連絡いただけます）"],
  ["販売価格", "Proプラン：月額980円（税込）"],
  ["販売価格以外の費用", "インターネット接続料金および通信料金は利用者の負担となります。"],
  ["支払方法", "クレジットカード決済（Stripe）"],
  ["支払時期", "初回申込時に決済し、その後は解約されるまで毎月同日に自動更新・決済されます。"],
  ["サービス提供時期", "決済完了後、契約状態が反映され次第すぐに利用できます。通常は数秒以内です。"],
  ["解約", "契約管理画面からいつでも解約できます。解約後も現在の請求期間の終了まではPro機能を利用できます。"],
  ["返品・返金", "デジタルサービスの性質上、提供開始後の利用者都合による返品・返金には応じません。ただし、法令上必要な場合または当サービスの責に帰すべき事由がある場合を除きます。"],
  ["動作環境", "最新版の主要ブラウザ、JavaScriptおよびCookieが利用可能なインターネット接続環境が必要です。"],
];

export default function CommercialTransactionsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">COMMERCIAL DISCLOSURE</p><h1 className="mt-3 text-4xl font-black">特定商取引法に基づく表記</h1>
      <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        <dl className="divide-y divide-white/10">
          {rows.map(([label, value]) => (
            <div key={label} className="grid gap-2 px-6 py-5 md:grid-cols-[12rem_1fr] md:px-10">
              <dt className="font-bold text-slate-100">{label}</dt>
              <dd className="leading-7 text-slate-300">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
