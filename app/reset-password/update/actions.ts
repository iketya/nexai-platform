"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PasswordUpdateState = { message: string };

export async function updatePassword(
  _: PasswordUpdateState,
  formData: FormData,
): Promise<PasswordUpdateState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8 || password.length > 72) {
    return { message: "パスワードは8〜72文字で入力してください。" };
  }
  if (password !== confirmation) {
    return { message: "確認用パスワードが一致しません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "再設定の認証を確認できません。最新のメールリンクを同じブラウザで開いてください。" };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { message: "パスワードを変更できませんでした。もう一度お試しください。" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?password=updated");
}
