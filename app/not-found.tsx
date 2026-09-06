import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-5 py-20 text-center">
      <div>
        <p className="font-mono text-sm font-bold text-cyan-400">404</p>
        <h1 className="mt-4 text-4xl font-black">ページが見つかりません</h1>
        <p className="mt-4 text-slate-400">URLが変更されたか、ページが削除された可能性があります。</p>
        <Link href="/" className="mt-8 inline-block rounded-xl bg-white px-5 py-3 font-bold text-slate-950">トップへ戻る</Link>
      </div>
    </main>
  );
}
