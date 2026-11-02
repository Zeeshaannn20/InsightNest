import type { Metadata } from "next";

import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Privacy Policy",
  "How InsightNest collects, uses and protects your personal information when you use our website and enroll in our courses.",
  "/privacy"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
