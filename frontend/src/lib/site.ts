import type { Metadata } from "next";

/**
 * One canonical origin for the whole site.
 *
 * Everything that emits an absolute URL — canonical tags, Open Graph, the
 * sitemap, JSON-LD — reads it from here, so the site can never disagree with
 * itself about where it lives. Google treats http/https and www/non-www as
 * different sites, and a mismatch splits ranking signals between them.
 */
export const SITE_URL = "https://insightnest.in";

export const SITE_NAME = "InsightNest";

export const SITE_DESCRIPTION =
  "Live weekend courses in data analytics and product management with GenAI, taught by Zeeshan. 16 live sessions, 7 portfolio projects and career support.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Meta (Facebook) Pixel ID.
 *
 * Public by design: it is visible in the page source of every site that runs
 * a pixel. Kept here rather than in an environment variable so it needs no
 * dashboard configuration to work.
 */
export const META_PIXEL_ID = "2303152423863109";

/** Title, description, self-canonical and share tags for one public page. */
export function pageMeta(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`;
  // A page's own openGraph replaces the parent's, so the shared image is named here.
  const images = ["/opengraph-image"];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_IN", images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}
