/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    domains: [],
    formats: ["image/avif", "image/webp"],
  },
  // Minimal configuration to avoid webpack issues
}

module.exports = nextConfig
