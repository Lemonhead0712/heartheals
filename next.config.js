/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable minification for troubleshooting
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add module resolution aliases if needed
  experimental: {
    // Enable if you need to resolve modules from both src and root
    esmExternals: "loose",
  },
  // Add webpack configuration to help with module resolution
  webpack: (config, { isServer }) => {
    // Add resolve fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    }

    // Add resolve modules to help find files in both src and root
    config.resolve.modules = [...(config.resolve.modules || []), "./src", "."]

    return config
  },
}

module.exports = nextConfig
