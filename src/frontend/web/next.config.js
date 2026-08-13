/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
};
module.exports = nextConfig;
