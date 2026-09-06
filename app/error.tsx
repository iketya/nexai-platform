"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-5 py-20 text-center">
      <div>
        <p className="font-mono text-sm font-bold text-rose-300">TEMPORARY ERROR</p>
        <h1 className="mt-4 text-4xl font-black">ページを表示できませんでした</h1>
        <p className="mt-4 text-slate-400">一時的な問題が発生しています。少し待ってから再度お試しください。</p>
        <button onClick={() => unstable_retry()} className="mt-8 rounded-xl bg-white px-5 py-3 font-bold text-slate-950">再読み込み</button>
      </div>
    </main>
  );
}
