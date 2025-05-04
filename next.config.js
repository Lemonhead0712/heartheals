/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [],
  },
  // Disable all experimental features
  experimental: {},
  // Disable webpack optimizations
  webpack: (config) => {
    config.optimization.minimize = false
    return config
  },
}

module.exports = nextConfig
