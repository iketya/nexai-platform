import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexai-platform-b7f9-one.vercel.app";
  const paths = ["", "/agents", "/login", "/terms", "/privacy", "/commercial-transactions"];
  return paths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() }));
}
