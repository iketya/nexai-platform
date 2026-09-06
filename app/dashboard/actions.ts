"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteAgent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("creator_id", user.id);

  if (error) {
    console.error("Agent delete error:", error);
    redirect("/dashboard?error=delete_failed");
  }

  revalidatePath("/dashboard");
  revalidatePath("/agents");
  redirect("/dashboard?deleted=1");
}
