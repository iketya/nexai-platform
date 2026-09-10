"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics() {
  const measurementId =
    process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "G-VMS85VQ0PE";
  const pathname = usePathname();

  useEffect(() => {
    if (measurementId && window.gtag) {
      window.gtag("config", measurementId, { page_path: pathname, anonymize_ip: true });
    }
  }, [measurementId, pathname]);

  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { anonymize_ip: true, send_page_view: false });`}
      </Script>
    </>
  );
}
