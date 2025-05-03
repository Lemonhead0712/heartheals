/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Use SWC for minification instead of Terser
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Disable the problematic minification plugin
    if (!isServer) {
      config.optimization.minimize = true;
      // Use SWC minifier instead of the default
      config.optimization.minimizer = [];
    }
    return config;
  },
}

export default nextConfig;
