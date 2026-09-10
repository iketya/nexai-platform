import type { Metadata } from "next";
import GoogleAnalytics from "@/components/google-analytics";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NexAI｜専門AIを作成・公開できるプラットフォーム",
    template: "%s｜NexAI",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["専門AI", "生成AI", "AIチャット", "AI作成", "AIプラットフォーム", "NexAI"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    siteName: SITE_NAME,
    title: "NexAI｜知識を、使えるAIに。",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/marketing/nexai-social-launch.png",
        width: 1254,
        height: 1254,
        alt: "複数の専門AIがNexAIにつながるイメージ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexAI｜知識を、使えるAIに。",
    description: SITE_DESCRIPTION,
    images: ["/marketing/nexai-social-launch.png"],
  },
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION ??
      "XM6Gym3CRlMLTC8oSmURG0s8ijisGmDcAZI6cAFV5gA",
  },
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
          <GoogleAnalytics />
        </div>
      </body>
    </html>
  );
}
