import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Augmented Data Analytics Bootcamp — InsightNest",
  description: "Master Excel, SQL, Python, Power BI, and Microsoft Fabric in our 4-week intensive live bootcamp. Build real-world projects and accelerate your data career.",
  openGraph: {
    title: "AI-Augmented Data Analytics Bootcamp — InsightNest",
    description: "Master Excel, SQL, Python, Power BI, and Microsoft Fabric in our 4-week intensive live bootcamp. Build real-world projects and accelerate your data career.",
    type: "website",
  }
};

export default function DataAnalystLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
