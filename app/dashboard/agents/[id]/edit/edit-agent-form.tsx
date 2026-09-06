"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AGENT_CATEGORIES, AGENT_TONES } from "@/lib/agent-options";
import { updateAgent, type UpdateAgentState } from "./actions";

type Agent = { id: string; name: string; description: string; icon: string; category: string; tone: string; system_prompt: string; is_public: boolean };
const initialState: UpdateAgentState = { message: "" };

export default function EditAgentForm({ agent }: { agent: Agent }) {
  const [state, action, pending] = useActionState(updateAgent, initialState);

  return (
    <form action={action} className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
      <input type="hidden" name="id" value={agent.id} />
      <div><label htmlFor="name" className="text-sm font-bold text-slate-200">AI名</label><input id="name" name="name" required maxLength={60} defaultValue={agent.name} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" /></div>
      <div><label htmlFor="description" className="text-sm font-bold text-slate-200">説明</label><textarea id="description" name="description" maxLength={300} rows={3} defaultValue={agent.description} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" /></div>
      <div className="grid gap-5 md:grid-cols-3">
        <div><label htmlFor="icon" className="text-sm font-bold text-slate-200">アイコン</label><input id="icon" name="icon" maxLength={16} defaultValue={agent.icon} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" /></div>
        <div><label htmlFor="category" className="text-sm font-bold text-slate-200">カテゴリ</label><select id="category" name="category" defaultValue={agent.category} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">{AGENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div><label htmlFor="tone" className="text-sm font-bold text-slate-200">話し方</label><select id="tone" name="tone" defaultValue={agent.tone} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">{AGENT_TONES.map((tone) => <option key={tone}>{tone}</option>)}</select></div>
      </div>
      <div><label htmlFor="systemPrompt" className="text-sm font-bold text-slate-200">役割・ルール</label><p className="mt-1 text-sm text-slate-500">回答方針、得意分野、禁止事項を具体的に記載してください。</p><textarea id="systemPrompt" name="systemPrompt" required minLength={10} maxLength={5000} rows={11} defaultValue={agent.system_prompt} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 leading-7" /></div>
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4"><input name="isPublic" type="checkbox" defaultChecked={agent.is_public} className="mt-1 size-4" /><span><span className="block font-bold">公開AIとして表示する</span><span className="mt-1 block text-sm text-slate-400">オフにすると、公開一覧には表示されません。</span></span></label>
      {state.message && <p aria-live="polite" className="rounded-xl bg-rose-400/10 px-4 py-3 text-rose-200">{state.message}</p>}
      <div className="flex flex-wrap gap-3"><button disabled={pending} className="rounded-xl bg-indigo-500 px-6 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50">{pending ? "保存中…" : "変更を保存"}</button><Link href="/dashboard" className="rounded-xl border border-white/10 px-6 py-3 font-bold hover:bg-white/5">キャンセル</Link></div>
    </form>
  );
}
