import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Crawl rules.
 *
 * The private areas are disallowed for tidiness, not for security — a
 * disallow line is a request, not an access control. Those routes are
 * protected by auth and RLS regardless.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/instructor", "/course/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
