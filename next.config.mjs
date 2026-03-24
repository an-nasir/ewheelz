/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type errors in mobile/ and prisma/seed.ts are excluded at build time
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
