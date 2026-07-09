import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Enabled Business Analytics — InsightNest",
  description: "One-month intensive Business Analytics course. Business thinking first, then data & visualization — no coding required. Frameworks, spreadsheets, AI, and no-code BI dashboards.",
  openGraph: {
    title: "AI-Enabled Business Analytics — InsightNest",
    description: "One-month intensive Business Analytics course. Business thinking first, then data & visualization — no coding required. Frameworks, spreadsheets, AI, and no-code BI dashboards.",
    type: "website",
  }
};

export default function BusinessAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
