import Link from "next/link";
import AuthNav from "@/components/auth-nav";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-4 px-5 py-3">
        <Link href="/" className="mr-auto flex items-center gap-2 font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-slate-950">
            N
          </span>
          <span className="text-xl">NexAI</span>
        </Link>

        <nav aria-label="メインナビゲーション" className="flex items-center gap-1 text-sm">
          <Link href="/agents" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white">
            AIを探す
          </Link>
        </nav>
        <AuthNav />
      </div>
    </header>
  );
}
