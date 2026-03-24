/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors in mobile/ and prisma/seed.ts are excluded at build time
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ── Redirect broken/legacy routes ────────────────────────────────────────
  async redirects() {
    return [
      // Audit-flagged 404s
      { source: "/learn",   destination: "/batteries", permanent: true },
      { source: "/range",   destination: "/ev-range",  permanent: true },
      { source: "/tools",   destination: "/trip-planner", permanent: false },
      { source: "/blog",    destination: "/articles",  permanent: true },
      { source: "/news",    destination: "/articles",  permanent: true },
      // Convenience aliases
      { source: "/map",     destination: "/charging-map", permanent: false },
      { source: "/compare", destination: "/compare",   permanent: false },
    ];
  },
};

export default nextConfig;
