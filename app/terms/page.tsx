import type { Metadata } from "next";

export const metadata: Metadata = { title: "利用規約" };

const sections = [
  ["1. 適用", "本規約は、NexAIが提供する専門AIの作成・公開・会話その他の機能の利用条件を定めるものです。利用者は、本サービスを利用することで本規約に同意します。"],
  ["2. アカウント", "利用者は正確な情報を登録し、認証情報を自身の責任で管理してください。アカウントを第三者に利用させることはできません。"],
  ["3. 投稿内容とAI", "利用者は、作成するAIの設定、名称、説明および入力内容について必要な権利を有するものとします。個人情報、営業秘密、第三者の権利を侵害する情報を入力しないでください。"],
  ["4. 禁止事項", "違法行為、他者への嫌がらせ、差別、詐欺、マルウェア作成、不正アクセス、権利侵害、サービスへの過度な負荷、制限の回避、その他運営上不適切と判断する行為を禁止します。"],
  ["5. AI生成内容", "AIの回答は誤りや不適切な内容を含む場合があります。医療・法律・金融その他重要な判断では、必ず資格を有する専門家や一次情報を確認してください。"],
  ["6. 公開と削除", "公開設定にしたAIは他の利用者が閲覧・利用できます。規約違反、安全上の問題、権利侵害のおそれがある場合、運営者は公開停止または削除できるものとします。"],
  ["7. サービス変更", "保守、安全確保、法令対応その他必要な場合、機能の変更・停止を行うことがあります。重要な変更は合理的な方法で案内します。"],
  ["8. 免責・責任制限", "運営者はサービスの完全性、正確性、特定目的への適合性を保証しません。法令で認められる範囲で、間接損害や特別損害について責任を負いません。"],
  ["9. 規約変更", "必要に応じて本規約を変更できます。利用者に重大な影響がある変更は、効力発生日までにサービス上で案内します。"],
  ["10. 準拠法", "本規約は日本法に準拠します。紛争が生じた場合は、運営者の所在地を管轄する日本の裁判所を第一審の専属的合意管轄裁判所とします。"],
];

export default function TermsPage() {
  return <LegalPage title="利用規約" intro="施行日：2026年9月7日" sections={sections} />;
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: string[][] }) {
  return <main className="mx-auto max-w-4xl px-5 py-16"><p className="text-sm font-bold tracking-[0.18em] text-cyan-400">LEGAL</p><h1 className="mt-3 text-4xl font-black">{title}</h1><p className="mt-3 text-slate-500">{intro}</p><div className="mt-10 space-y-9 rounded-3xl border border-white/10 bg-slate-900/70 p-6 md:p-10">{sections.map(([heading, body]) => <section key={heading}><h2 className="text-xl font-bold">{heading}</h2><p className="mt-3 leading-8 text-slate-300">{body}</p></section>)}</div></main>;
}
