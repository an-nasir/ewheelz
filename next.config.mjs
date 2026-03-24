/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow Unsplash images via next/image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  // ── Redirect broken/legacy routes (NO self-redirects!) ───────────────────
  async redirects() {
    return [
      { source: "/learn", destination: "/batteries",    permanent: true },
      { source: "/range", destination: "/ev-range",     permanent: true },
      { source: "/tools", destination: "/trip-planner", permanent: false },
      { source: "/blog",  destination: "/articles",     permanent: true },
      { source: "/news",  destination: "/articles",     permanent: true },
      { source: "/map",   destination: "/charging-map", permanent: false },
      // NOTE: removed /compare → /compare (caused infinite redirect loop)
    ];
  },
};

export default nextConfig;
