"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export default function AdSlot({ clientId, slotId, label }: {
  clientId: string;
  slotId: string;
  label: string;
}) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and unavailable inventory must not affect the page itself.
    }
  }, []);

  return (
    <aside aria-label={label} className="mx-auto my-10 max-w-7xl px-5">
      <p className="mb-2 text-center text-[10px] font-bold tracking-[0.16em] text-slate-600">広告</p>
      <div className="min-h-24 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <ins
          className="adsbygoogle block"
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      <Script
        id="google-adsense"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </aside>
  );
}
