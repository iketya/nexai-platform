"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (password.length < 8 || password.length > 72) {
      setMessage("パスワードは8〜72文字で入力してください。");
      return;
    }
    if (password !== confirmation) {
      setMessage("確認用パスワードが一致しません。");
      return;
    }

    setPending(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("再設定リンクが無効か期限切れです。もう一度メールを送信してください。");
    } else {
      setSuccess(true);
      setMessage("パスワードを変更しました。新しいパスワードでログインできます。");
    }
    setPending(false);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">NEW PASSWORD</p>
      <h1 className="mt-3 text-3xl font-black">新しいパスワード</h1>
      {!success && (
        <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-4">
          <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="新しいパスワード（8文字以上）" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
          <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="新しいパスワード（確認）" className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3" />
          <button disabled={pending} className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50">{pending ? "変更中…" : "パスワードを変更"}</button>
        </form>
      )}
      {message && <p aria-live="polite" className={`mt-5 rounded-xl p-3 text-sm leading-6 ${success ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}>{message}</p>}
      <Link href={success ? "/login" : "/reset-password"} className="mt-6 inline-block text-sm font-bold text-cyan-300 hover:text-cyan-200">{success ? "ログインする →" : "再設定メールを送り直す"}</Link>
    </div>
  );
}
