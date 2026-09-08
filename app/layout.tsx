import type { Metadata } from "next";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://nexai-platform-b7f9-one.vercel.app",
  ),
  title: {
    default: "NexAI｜専門AIを作成・公開できるプラットフォーム",
    template: "%s｜NexAI",
  },
  description: "目的に合う専門AIを探したり、自分だけのAIを作成・公開したりできるプラットフォームです。",
  applicationName: "NexAI",
  robots: { index: true, follow: true },
  other: {
    "google-adsense-account": "ca-pub-4894969476950914",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
