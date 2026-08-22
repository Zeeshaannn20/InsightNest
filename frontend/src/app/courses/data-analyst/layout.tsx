import { Metadata } from "next";

const title = "Become a Job-Ready Data Analyst in 8 Weekends — InsightNest";
const description =
  "Live weekend training in Excel, SQL, Python, Statistics, Power BI and data storytelling. 16 live sessions, 7 portfolio projects and career support, for ₹2,999.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "InsightNest",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function DataAnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
