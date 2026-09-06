"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || pending) return;
    setPending(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    });

    setMessage(
      error
        ? "メールを送信できませんでした。時間を置いて再度お試しください。"
        : "登録済みのアドレスの場合、パスワード再設定メールを送信しました。",
    );
    setPending(false);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">ACCOUNT RECOVERY</p>
      <h1 className="mt-3 text-3xl font-black">パスワードを再設定</h1>
      <p className="mt-3 leading-7 text-slate-400">登録したメールアドレスへ再設定リンクを送ります。</p>
      <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4">
        <label htmlFor="reset-email" className="sr-only">メールアドレス</label>
        <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="メールアドレス" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
        {message && <p aria-live="polite" className="rounded-xl bg-white/5 p-3 text-sm leading-6 text-slate-300">{message}</p>}
        <button disabled={pending} className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50">{pending ? "送信中…" : "再設定メールを送る"}</button>
      </form>
      <Link href="/login" className="mt-6 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200">← ログインへ戻る</Link>
    </div>
  );
}
