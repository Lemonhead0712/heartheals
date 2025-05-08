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
    domains: [],
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  // Configure webpack to disable minification
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.minimize = false
    }
    return config
  },
  compress: false,
}

module.exports = nextConfig
