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
    <main className="mx-auto max-w-3xl px-5 py-14">
      <p className="font-bold text-cyan-400">AI BUILDER</p>
      <h1 className="mt-2 text-4xl font-black">自分のAIを作る</h1>
      <CreateAgentForm />
    </main>
  );
}