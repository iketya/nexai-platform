import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function configuredAdminIds() {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminUser(user: User) {
  const hasAdminRole = user.app_metadata?.role === "admin";
  const hasAdminId = configuredAdminIds().has(user.id);
  const hasAdminEmail = user.email
    ? configuredAdminEmails().has(user.email.toLowerCase())
    : false;

  return hasAdminRole || hasAdminId || hasAdminEmail;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");
  if (!isAdminUser(user)) redirect("/dashboard?admin=denied");

  return user;
}
