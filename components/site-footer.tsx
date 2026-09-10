import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 text-sm text-slate-400 md:flex-row md:items-center">
        <div className="mr-auto">
          <p className="font-bold text-slate-200">NexAI</p>
          <p className="mt-1">専門AIを作成・公開・活用できるプラットフォーム</p>
        </div>
        <nav aria-label="フッターナビゲーション" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pricing" className="hover:text-white">料金</Link>
          <Link href="/terms" className="hover:text-white">利用規約</Link>
          <Link href="/privacy" className="hover:text-white">プライバシー</Link>
          <Link href="/commercial-transactions" className="hover:text-white">特定商取引法に基づく表記</Link>
          <Link href="/contact" className="hover:text-white">お問い合わせ</Link>
        </nav>
        <p>© {new Date().getFullYear()} NexAI</p>
      </div>
    </footer>
  );
}
