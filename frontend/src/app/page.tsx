import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta(
    "Data Analytics & Product Management Courses",
    "Live weekend courses in data analytics and product management with GenAI, taught by industry instructors. Real projects and career support for ₹2,999 per course.",
    "/"
  ),
  title: { absolute: "Data Analytics & Product Management Courses | InsightNest" },
};

export default function Page() {
  return <HomePage />;
}
