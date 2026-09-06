"use client";

import { useActionState } from "react";
import { AGENT_CATEGORIES, AGENT_TONES } from "@/lib/agent-options";
import { createAgent, type CreateAgentState } from "./actions";

const initialState: CreateAgentState = { message: "" };

export default function CreateAgentForm() {
  const [state, action, pending] = useActionState(createAgent, initialState);

  return (
    <form action={action}
      className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
      <div>
        <label htmlFor="name" className="text-sm font-bold text-slate-200">AI名</label>
        <input id="name" name="name" required maxLength={60} placeholder="例：Python家庭教師AI"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-bold text-slate-200">説明</label>
        <textarea id="description" name="description" maxLength={300} rows={3} placeholder="このAIが何を手伝えるかを簡潔に説明してください"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><label htmlFor="icon" className="text-sm font-bold text-slate-200">アイコン</label><input id="icon" name="icon" defaultValue="🤖" maxLength={16} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" /></div>
        <div><label htmlFor="category" className="text-sm font-bold text-slate-200">カテゴリ</label><select id="category" name="category" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">{AGENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
      </div>

      <div><label htmlFor="tone" className="text-sm font-bold text-slate-200">話し方</label><select id="tone" name="tone" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">{AGENT_TONES.map((tone) => <option key={tone}>{tone}</option>)}</select></div>

      <div><label htmlFor="systemPrompt" className="text-sm font-bold text-slate-200">役割・ルール</label><p className="mt-1 text-sm text-slate-500">対象者、回答方法、守るべきルール、回答しない内容を具体的に記載してください。</p><textarea id="systemPrompt" name="systemPrompt" required minLength={10} maxLength={5000} rows={10} placeholder="あなたはPython初心者向けの家庭教師です。専門用語をかみ砕き、必ず短い例を添えて説明してください。"
        className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 leading-7" /></div>

      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4"><input name="isPublic" type="checkbox" defaultChecked className="mt-1 size-4" /><span><span className="block font-bold">公開AIとして表示する</span><span className="mt-1 block text-sm text-slate-400">公開すると、すべてのユーザーがこのAIを見つけられます。</span></span></label>

      {state.message && <p aria-live="polite" className="rounded-xl bg-rose-400/10 px-4 py-3 text-rose-200">{state.message}</p>}

      <button disabled={pending}
        className="w-full rounded-xl bg-indigo-500 px-5 py-4 font-bold hover:bg-indigo-400 disabled:opacity-60">
        {pending ? "作成中…" : "AIを作成"}
      </button>
    </form>
  );
}
