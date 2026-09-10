"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  text: string;
  path: string;
};

export default function ShareButtons({ title, text, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexai-platform-b7f9-one.vercel.app";
  const shareUrl = `${siteUrl}${path}?utm_source=share&utm_medium=referral&utm_campaign=agent_share`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title}｜NexAI\n${text}`);

  function trackShare(method: string) {
    const analyticsWindow = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    };
    analyticsWindow.gtag?.("event", "share", { method, content_type: "agent", item_id: path });
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: `${title}｜NexAI`, text, url: shareUrl }).catch(() => undefined);
      trackShare("native");
      return;
    }
    await copyUrl();
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(shareUrl);
    trackShare("copy_link");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <p className="text-xs font-bold text-slate-500">このAIを共有</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={share} className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-100">
          共有する
        </button>
        <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer" onClick={() => trackShare("x")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:border-cyan-300/30 hover:text-white">
          Xで共有
        </a>
        <a href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`} target="_blank" rel="noreferrer" onClick={() => trackShare("line")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:border-cyan-300/30 hover:text-white">
          LINE
        </a>
        <button type="button" onClick={copyUrl} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:border-cyan-300/30 hover:text-white">
          {copied ? "コピーしました" : "URLをコピー"}
        </button>
      </div>
    </div>
  );
}
