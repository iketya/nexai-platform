import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateAgentForm from "./create-agent-form";

export default async function CreatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-14">
      <p className="text-sm font-bold tracking-[0.18em] text-cyan-400">AI BUILDER</p>
      <h1 className="mt-3 text-4xl font-black md:text-5xl">自分のAIを作る</h1>
      <p className="mt-3 text-slate-400">専門知識と回答方針を設定して、目的に特化したAIを作成します。</p>
      <CreateAgentForm />
    </main>
  );
}
