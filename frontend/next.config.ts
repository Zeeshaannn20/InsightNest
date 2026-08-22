import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // The programme page is now the home page. Keep the old URL working
        // for existing links, ads and search results.
        source: "/courses/data-analyst",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
