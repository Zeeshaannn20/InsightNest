import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import MetaPixel from "@/components/MetaPixel";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Become a Job-Ready Data Analyst in 8 Weekends — InsightNest";
const description =
  "Live weekend training in Excel, SQL, Python, Statistics, Power BI and data storytelling. 16 live sessions, 7 portfolio projects and career support, for ₹2,999.";

export const metadata: Metadata = {
  // Makes every relative URL in metadata resolve to one canonical origin.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title,
  description,
  keywords: [
    "data analyst course",
    "data analytics bootcamp",
    "live weekend classes",
    "Excel",
    "SQL",
    "Python",
    "Power BI",
    "statistics",
    "data analytics course India",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: "/icon.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
      {/*
        Rendered only when the measurement ID is set, so local development and
        preview builds do not report into the production property. The ID is
        public by design — it identifies the property, it does not grant
        access to the data.
      */}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {/* Production only, so local runs and previews stay out of the pixel. */}
      {isProduction ? <MetaPixel /> : null}
    </html>
  );
}
