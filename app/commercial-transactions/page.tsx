import type { Metadata } from "next";

export const metadata: Metadata = { title: "特定商取引法に基づく表記" };

export default function CommercialTransactionsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">COMMERCIAL DISCLOSURE</p><h1 className="mt-3 text-4xl font-black">特定商取引法に基づく表記</h1>
      <div className="mt-10 rounded-3xl border border-amber-300/20 bg-amber-300/5 p-6 md:p-10">
        <h2 className="text-xl font-bold text-amber-200">有料サービスの提供開始前です</h2>
        <p className="mt-3 leading-8 text-slate-300">現在、NexAIでは有料契約の申込みを受け付けていません。料金プランの提供開始時に、販売事業者名、運営責任者、所在地、連絡先、販売価格、支払方法、提供時期、解約・返金条件など法令上必要な情報を本ページに掲載します。</p>
      </div>
    </main>
  );
}
