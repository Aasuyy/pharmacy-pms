/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', '192.168.1.64'],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
