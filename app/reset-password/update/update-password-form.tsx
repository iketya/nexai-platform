"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword, type PasswordUpdateState } from "./actions";

const initialState: PasswordUpdateState = { message: "" };

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">NEW PASSWORD</p>
      <h1 className="mt-3 text-3xl font-black">新しいパスワード</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">8〜72文字で、新しいパスワードを2回入力してください。</p>
      <form action={formAction} className="mt-7 space-y-4">
        <input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} placeholder="新しいパスワード（8文字以上）" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        <input name="confirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={72} placeholder="新しいパスワード（確認）" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        <button disabled={pending} className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50">{pending ? "変更中…" : "パスワードを変更"}</button>
      </form>
      {state.message && <p aria-live="polite" className="mt-5 rounded-xl bg-rose-400/10 p-3 text-sm leading-6 text-rose-200">{state.message}</p>}
      <Link href="/reset-password" className="mt-6 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200">再設定メールを送り直す</Link>
    </div>
  );
}
