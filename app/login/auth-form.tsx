"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, signUp, type AuthState } from "./actions";

const initialState: AuthState = { message: "" };

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const action = mode === "login" ? login : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-black/30">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">WELCOME TO NEXAI</p>
      <h1 className="text-3xl font-black">{mode === "login" ? "ログイン" : "新規登録"}</h1>

      <form action={formAction} className="mt-7 space-y-4">
        {mode === "signup" && (
          <input name="displayName" maxLength={60} autoComplete="name" placeholder="表示名"
            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        )}
        <input name="email" type="email" required autoComplete="email" placeholder="メールアドレス"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        <input name="password" type="password" required minLength={8} maxLength={72} autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="パスワード（8文字以上）"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />

        {state.message && (
          <p className="rounded-lg bg-white/5 p-3 text-sm text-amber-300">{state.message}</p>
        )}

        <button disabled={pending}
          className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold disabled:opacity-60">
          {pending ? "処理中…" : mode === "login" ? "ログイン" : "アカウントを作成"}
        </button>
      </form>

      {mode === "login" && (
        <Link href="/reset-password" className="mt-4 inline-block text-sm text-slate-400 hover:text-cyan-300">パスワードを忘れた方</Link>
      )}

      {mode === "signup" && (
        <p className="mt-4 text-xs leading-5 text-slate-500">
          登録すると、<Link href="/terms" className="underline hover:text-slate-300">利用規約</Link>と<Link href="/privacy" className="underline hover:text-slate-300">プライバシーポリシー</Link>に同意したものとみなされます。
        </p>
      )}

      <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="mt-6 w-full text-sm text-indigo-300">
        {mode === "login" ? "アカウントを持っていない方はこちら" : "ログインへ戻る"}
      </button>
    </div>
  );
}
