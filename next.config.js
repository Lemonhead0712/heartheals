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
  // Disable webpack minification
  webpack: (config, { dev, isServer }) => {
    // Disable minification completely
    config.optimization.minimize = false

    // Remove the problematic minify plugin
    if (config.optimization.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (minimizer) => !minimizer.constructor.name.includes("Terser"),
      )
    }

    return config
  },
}

module.exports = nextConfig
