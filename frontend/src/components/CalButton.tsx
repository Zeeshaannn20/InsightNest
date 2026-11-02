"use client";

import { useEffect } from "react";

interface Props {
  calLink: string;
  className?: string;
  children: React.ReactNode;
}

declare global {
  interface Window {
    Cal?: (...args: unknown[]) => void;
  }
}

export default function CalButton({ calLink, className, children }: Props) {
  useEffect(() => {
    if (document.getElementById("cal-embed-script")) return;
    const script = document.createElement("script");
    script.id = "cal-embed-script";
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      window.Cal?.("init", { origin: "https://cal.com" });
      window.Cal?.("ui", {
        styles: { branding: { brandColor: "#3B82F6" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <button
      data-cal-link={calLink}
      data-cal-origin="https://cal.com"
      data-cal-config='{"layout":"month_view"}'
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}
