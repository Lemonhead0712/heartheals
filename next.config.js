/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable SWC minification
  swcMinify: false,
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
  webpack: (config, { dev, isServer }) => {
    // Disable minification even in production
    if (!dev) {
      config.optimization.minimize = false
    }

    return config
  },
  // Disable compression in output
  compress: false,
}

module.exports = nextConfig
