/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC minification
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Disable image optimization
    domains: [],
  },
  // Simplified webpack config
  webpack: (config) => {
    // Disable minification completely
    config.optimization.minimize = false
    return config
  },
}

module.exports = nextConfig
