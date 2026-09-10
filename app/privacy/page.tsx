import type { Metadata } from "next";

export const metadata: Metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">PRIVACY</p><h1 className="mt-3 text-4xl font-black">プライバシーポリシー</h1><p className="mt-3 text-slate-500">施行日：2026年9月7日（2026年9月9日更新）</p>
      <div className="mt-10 space-y-9 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-10">
        <section><h2 className="text-xl font-bold">取得する情報</h2><p className="mt-3 leading-8 text-slate-300">メールアドレス、表示名、認証情報、作成したAIの設定、会話内容、利用日時、端末・ブラウザに関する一般的な技術情報を取得することがあります。パスワードは認証基盤で安全に処理され、運営者が平文で保存することはありません。</p></section>
        <section><h2 className="text-xl font-bold">利用目的</h2><p className="mt-3 leading-8 text-slate-300">本人確認、サービス提供、会話履歴の保存、安全対策、不正利用防止、品質改善、問い合わせ対応、重要なお知らせのために利用します。</p></section>
        <section><h2 className="text-xl font-bold">外部サービスへの送信</h2><p className="mt-3 leading-8 text-slate-300">サービス提供のため、認証・データ保存にSupabase、ホスティングにVercel、AI回答生成にGoogle Gemini APIを利用します。利用状況の把握にGoogle Analytics、広告配信を有効にした場合はGoogle AdSenseを利用することがあります。会話内容は回答生成のためGoogleのAPIへ送信されます。機密情報や不要な個人情報を入力しないでください。</p></section>
        <section><h2 className="text-xl font-bold">Cookieと広告配信</h2><p className="mt-3 leading-8 text-slate-300">ログイン状態の維持とセキュリティのためCookieを使用します。広告配信を有効にした場合、Googleおよびそのパートナーが、広告の配信・効果測定・不正防止のためCookieなどを使用し、閲覧情報を処理することがあります。地域や同意状況に応じて、パーソナライズされていない広告が表示される場合があります。必須Cookieを無効にすると、一部機能を利用できない場合があります。</p></section>
        <section><h2 className="text-xl font-bold">保存期間と安全管理</h2><p className="mt-3 leading-8 text-slate-300">利用目的に必要な期間、または法令上必要な期間情報を保持します。アクセス制御、暗号化通信、権限分離など合理的な安全管理措置を講じます。</p></section>
        <section><h2 className="text-xl font-bold">利用者の権利</h2><p className="mt-3 leading-8 text-slate-300">法令に基づき、保有する個人情報の開示、訂正、利用停止、削除などを請求できます。本人確認のうえ合理的な期間内に対応します。</p></section>
        <section><h2 className="text-xl font-bold">お問い合わせ・削除依頼</h2><p className="mt-3 leading-8 text-slate-300">個人情報に関するお問い合わせ、開示・訂正・利用停止・削除のご依頼は、お問い合わせページに記載した窓口へご連絡ください。本人確認が必要な場合があります。</p></section>
        <section><h2 className="text-xl font-bold">改定</h2><p className="mt-3 leading-8 text-slate-300">サービスや法令の変更に応じて本ポリシーを改定することがあります。重要な変更はサービス上で案内します。</p></section>
      </div>
    </main>
  );
}
