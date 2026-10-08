"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    nexaiAnalyticsInitialized?: boolean;
  }
}

export default function GoogleAnalytics() {
  const measurementId =
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "G-VMS85VQ0PE";
  const pathname = usePathname();
  const isValidId = /^G-[A-Z0-9]+$/i.test(measurementId);

  useEffect(() => {
    if (!isValidId) return;
    window.dataLayer ||= [];
    window.gtag ||= (...args: unknown[]) => { window.dataLayer?.push(args); };
    if (!window.nexaiAnalyticsInitialized) {
      window.gtag("js", new Date());
      window.nexaiAnalyticsInitialized = true;
    }
    window.gtag("config", measurementId, { page_path: pathname, anonymize_ip: true });
  }, [isValidId, measurementId, pathname]);

  if (!isValidId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
