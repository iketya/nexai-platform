"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthNav() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const timeoutId = window.setTimeout(() => {
      void supabase.auth.getUser().then(({ data }) => {
        setAuthenticated(Boolean(data.user));
      });
    }, 0);
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
    });

    return () => {
      window.clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthenticated(false);
    router.push("/");
    router.refresh();
  }

  if (authenticated === null) {
    return <span aria-hidden="true" className="h-10 w-24 animate-pulse rounded-xl bg-white/5" />;
  }

  if (!authenticated) {
    return <Link href="/login" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">ログイン</Link>;
  }

  return (
    <div className="flex items-center gap-1">
      <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">ダッシュボード</Link>
      <button type="button" onClick={() => void handleSignOut()} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/5">ログアウト</button>
    </div>
  );
}
