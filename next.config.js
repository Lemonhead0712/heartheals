/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove swcMinify as it's not supported in your version
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
