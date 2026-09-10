import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/agents", "/pricing", "/login", "/terms", "/privacy", "/commercial-transactions", "/contact"];
  const staticPages = paths.map((path) => ({ url: `${SITE_URL}${path}`, lastModified: new Date() }));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return staticPages;

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: agents } = await supabase
    .from("agents")
    .select("slug, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  const agentPages = (agents ?? []).map((agent) => ({
    url: `${SITE_URL}/agents/${encodeURIComponent(agent.slug)}`,
    lastModified: new Date(agent.created_at),
  }));

  return [...staticPages, ...agentPages];
}
