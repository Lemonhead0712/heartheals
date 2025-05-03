/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove swcMinify as it's not recognized
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Simplify webpack configuration
  webpack: (config, { isServer }) => {
    // Disable minification completely to avoid the webpack error
    if (!isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
}

export default nextConfig;
