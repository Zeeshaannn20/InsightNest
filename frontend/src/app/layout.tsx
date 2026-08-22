import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Become a Job-Ready Data Analyst in 8 Weekends — InsightNest";
const description =
  "Live weekend training in Excel, SQL, Python, Statistics, Power BI and data storytelling. 16 live sessions, 7 portfolio projects and career support, for ₹2,999.";

export const metadata: Metadata = {
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
    siteName: "InsightNest",
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
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
