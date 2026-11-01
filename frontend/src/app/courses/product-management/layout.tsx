import { Metadata } from "next";

const title = "Product Management with Generative AI — InsightNest";
const description =
  "Learn product strategy, user research, UX, PRDs, Agile, product analytics and go-to-market in 8 modules, ending in a capstone. ₹2,999.";

export const metadata: Metadata = {
  title,
  description,
  // The root layout's canonical points at the home page; without this the
  // page would tell search engines not to index it separately.
  alternates: { canonical: "/courses/product-management" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/courses/product-management",
  },
};

export default function ProductManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
