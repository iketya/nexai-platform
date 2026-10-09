import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ad-slot";
import { getAdConfig } from "@/lib/ads";
import { FREE_PLAN } from "@/lib/billing";

export const metadata: Metadata = {
  title: "仕事・副業に使える専門AI",
  description: "メールや提案文の下書き、副業アイデアの整理を専門AIと進められます。コトサキは無料で始められ、クレジットカードは不要です。",
  alternates: { canonical: "/" },
};

const workAgents = [
  {
    icon: "✍️",
    title: "ビジネス文章アシスタント",
    description: "メール・提案文・告知文の下書きや推敲に。伝えたい要点から文章案を作ります。",
    example: "取引先へのお礼メールを、丁寧で短めに作りたい",
    href: "/agents/agent-d1961b3a",
  },
  {
    icon: "💡",
    title: "副業アイデア整理AI",
    description: "強みや使える時間を整理し、小さく試せる副業案と行動計画を考えます。",
    example: "週末に3時間使える。自分に合う副業を整理したい",
    href: "/agents/ai-f885de5c",
  },
];

const benefits = [
  {
    number: "01",
    title: "目的から選べる",
    body: "学習、就職、開発、仕事など、今の課題に合った専門AIを見つけられます。",
  },
  {
    number: "02",
    title: "自分仕様に作れる",
    body: "役割・ルール・話し方を設定し、用途に特化したAIを数分で作成できます。",
  },
  {
    number: "03",
    title: "会話を継続できる",
    body: "会話履歴を保存し、前回の続きから相談や作業を再開できます。",
  },
];

export default async function HomePage() {
  const ad = await getAdConfig("HOME");

  return (
    <main>
      <section className="relative overflow-hidden px-5 pb-20 pt-14 md:pb-24 md:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm font-bold text-cyan-300">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_18px_#22d3ee]" />
              仕事を進める、目的別AI
            </div>

            <h1 className="mt-7 text-4xl font-black leading-[1.12] tracking-tight md:text-5xl lg:text-6xl">
              文章作成も、副業の一歩も。
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                AIと一緒に前へ。
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              コトサキは、目的に合った専門AIに相談できるサービスです。メールの下書きやアイデアの整理から始め、自分専用のAIも作れます。
            </p>

            <p className="mt-4 text-sm font-bold text-cyan-200">無料で開始・クレジットカード不要 ／ Freeはチャット1日{FREE_PLAN.dailyMessages}回・月{FREE_PLAN.monthlyMessages}回</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#work-agents" className="rounded-2xl bg-white px-7 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-950/30 hover:bg-cyan-100">
                使えるAIを見る
              </Link>
              <Link href="/create" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-bold backdrop-blur hover:border-cyan-300/40 hover:bg-white/10">
                自分のAIを作る
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.number} className="bg-slate-950/90 p-7 md:p-9">
                <p className="font-mono text-sm font-bold text-cyan-400">{benefit.number}</p>
                <h2 className="mt-5 text-xl font-bold">{benefit.title}</h2>
                <p className="mt-3 leading-7 text-slate-400">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="work-agents" className="scroll-mt-24 border-y border-white/10 bg-slate-900/50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">START HERE</p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">まずは、仕事に使える2つから。</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-400">具体的な目的がなくても、相談例から始められます。AIの回答は必ず確認してから利用してください。</p>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {workAgents.map((agent) => (
              <article key={agent.href} className="flex flex-col rounded-3xl border border-white/10 bg-slate-950/70 p-7 md:p-8">
                <span className="grid size-14 place-items-center rounded-2xl bg-white/5 text-3xl">{agent.icon}</span>
                <h3 className="mt-5 text-2xl font-bold">{agent.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{agent.description}</p>
                <p className="mt-5 flex-1 rounded-xl border border-white/5 bg-white/5 p-4 text-sm leading-6 text-slate-300">相談例：「{agent.example}」</p>
                <Link href={agent.href} className="mt-7 w-fit rounded-xl bg-indigo-500 px-5 py-3 font-bold hover:bg-indigo-400">相談してみる →</Link>
              </article>
            ))}
          </div>
          <Link href="/agents" className="mt-7 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200">すべての専門AIを見る →</Link>
        </div>
      </section>

      {ad && <AdSlot clientId={ad.clientId} slotId={ad.slotId} label="トップページ広告" />}

      <section className="border-y border-white/10 bg-slate-900/50 px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">START BUILDING</p>
            <h2 className="mt-4 text-3xl font-black md:text-5xl">あなたの経験を、誰かの力に。</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              プロンプトの知識がなくても、画面の案内に沿って役割と話し方を設定するだけで始められます。
            </p>
          </div>
          <Link href="/create" className="w-fit rounded-2xl bg-indigo-500 px-7 py-4 font-bold hover:bg-indigo-400">
            無料でAIを作成する
          </Link>
        </div>
      </section>
    </main>
  );
}
