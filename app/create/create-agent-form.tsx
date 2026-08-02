"use client";

import { useActionState } from "react";
import { createAgent, type CreateAgentState } from "./actions";

const initialState: CreateAgentState = { message: "" };

export default function CreateAgentForm() {
  const [state, action, pending] = useActionState(createAgent, initialState);

  return (
    <form action={action}
      className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-slate-900 p-7">
      <input name="name" required maxLength={60} placeholder="AI名"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
      <input name="description" maxLength={300} placeholder="説明"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />

      <div className="grid gap-4 md:grid-cols-2">
        <input name="icon" defaultValue="🤖" maxLength={16}
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        <select name="category"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
          <option>学習</option><option>就活</option><option>開発</option>
          <option>仕事</option><option>その他</option>
        </select>
      </div>

      <select name="tone"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3">
        <option>やさしく丁寧</option><option>短く簡潔</option>
        <option>明るくフレンドリー</option><option>専門家のように論理的</option>
      </select>

      <textarea name="systemPrompt" required minLength={10} maxLength={5000} rows={9}
        placeholder="AIの役割・ルール"
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />

      <label className="flex items-center gap-3">
        <input name="isPublic" type="checkbox" defaultChecked />
        公開AIとして表示する
      </label>

      {state.message && <p className="text-red-300">{state.message}</p>}

      <button disabled={pending}
        className="w-full rounded-xl bg-indigo-500 px-5 py-4 font-bold disabled:opacity-60">
        {pending ? "作成中…" : "AIを作成して公開"}
      </button>
    </form>
  );
}
