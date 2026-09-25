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
  "Live weekend training in Excel, SQL, Python, Statistics, Power BI and data storytelling. 16 live sessions, 7 portfolio projects and career support.";

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
