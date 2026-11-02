import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

/**
 * The sitemap is generated from the database, not hard-coded, so an article
 * appears here the moment it is published rather than on the next deploy.
 * Revalidated hourly — frequent enough that Google finds new posts quickly,
 * rare enough that a crawler cannot hammer the database.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/courses/data-analytics"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/courses/product-management"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/articles"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.1 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const articles: MetadataRoute.Sitemap = (data ?? []).map((a) => ({
      url: absoluteUrl(`/articles/${a.slug}`),
      lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...articles];
  } catch {
    // A database hiccup must not produce a 500 for a crawler. Serving the
    // static routes alone is better than serving nothing.
    return staticRoutes;
  }
}
