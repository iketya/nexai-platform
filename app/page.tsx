import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/ad-slot";
import { getAdConfig } from "@/lib/ads";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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
      <section className="relative overflow-hidden px-5 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm font-bold text-cyan-300">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_18px_#22d3ee]" />
              専門AIを、すべての人に
            </div>

            <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-tight md:text-7xl lg:text-8xl">
              知識を、使えるAIに。
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                あなたの専門性を世界へ。
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
              NexAIは、目的に合ったAIを探し、自分だけの専門AIを作成・公開できるプラットフォームです。
            </p>

            <p className="mt-4 text-sm font-bold text-cyan-200">登録無料・クレジットカード不要ですぐ試せます</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/agents" className="rounded-2xl bg-white px-7 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-950/30 hover:bg-cyan-100">
                専門AIを探す
              </Link>
              <Link href="/create" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-bold backdrop-blur hover:border-cyan-300/40 hover:bg-white/10">
                自分のAIを作る
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
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
