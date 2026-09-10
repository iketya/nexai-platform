import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexai-platform-b7f9-one.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/create", "/api/", "/reset-password/update"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
