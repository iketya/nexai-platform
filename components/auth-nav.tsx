import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { isAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">ログイン</Link>;
  }

  return (
    <div className="flex items-center gap-1">
      {isAdminUser(user) && (
        <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-bold text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200">管理</Link>
      )}
      <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">ダッシュボード</Link>
      <form action={signOut}>
        <button type="submit" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5">ログアウト</button>
      </form>
    </div>
  );
}
