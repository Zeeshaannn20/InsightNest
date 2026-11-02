import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Keep the old URL working for existing links, ads and search results.
        source: "/courses/data-analyst",
        destination: "/courses/data-analytics",
        permanent: true,
      },
      {
        // This course is no longer offered.
        source: "/courses/business-analytics",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
