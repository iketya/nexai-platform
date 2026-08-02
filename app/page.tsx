import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-950 px-5 py-24 text-white">
      <section className="mx-auto max-w-5xl text-center">
        <p className="font-bold text-cyan-400">
          CREATE YOUR OWN AI
        </p>

        <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
          自分のAIを作り、
          <br />
          世界へ公開する。
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          NexAIでは、AIの名前・役割・話し方を設定し、
          専用AIとして公開できます。
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/agents"
            className="rounded-xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400"
          >
            公開AIを見る
          </Link>

          <Link
            href="/create"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-bold hover:bg-white/10"
          >
            AIを作る
          </Link>
        </div>
      </section>
    </main>
  );
}