import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexAI",
  description: "自分のAIを作り、公開し、会話できるプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}