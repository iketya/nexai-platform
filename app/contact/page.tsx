import type { Metadata } from "next";

export const metadata: Metadata = { title: "お問い合わせ" };

const supportEmail = "ijetyan1021@gmail.com";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">SUPPORT</p>
      <h1 className="mt-3 text-4xl font-black">お問い合わせ</h1>
      <p className="mt-4 leading-8 text-slate-300">
        NexAIの利用方法、契約・請求、データの開示・訂正・削除、権利侵害や不適切な公開AIの報告はこちらからご連絡ください。
      </p>

      <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-10">
        <h2 className="text-xl font-bold">メール窓口</h2>
        <a
          href={`mailto:${supportEmail}?subject=${encodeURIComponent("NexAIへのお問い合わせ")}`}
          className="mt-4 inline-flex rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-200"
        >
          {supportEmail}
        </a>
        <p className="mt-5 text-sm leading-7 text-slate-400">
          本人確認が必要なご依頼には、登録メールアドレスからご連絡ください。通常7営業日以内を目安に返信します。
          パスワード、カード番号、認証コードはメールに記載しないでください。
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-10">
        <h2 className="text-xl font-bold">アカウント・データの削除</h2>
        <p className="mt-3 leading-8 text-slate-300">
          件名を「アカウント削除依頼」とし、NexAIに登録したメールアドレスからご連絡ください。
          本人確認後、法令や決済記録の保存義務により保持が必要な情報を除き、アカウントと関連データを削除します。
        </p>
      </section>
    </main>
  );
}
