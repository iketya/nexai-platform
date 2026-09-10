import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexai-platform-b7f9-one.vercel.app";
  const paths = ["", "/agents", "/pricing", "/login", "/terms", "/privacy", "/commercial-transactions", "/contact"];
  return paths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() }));
}
