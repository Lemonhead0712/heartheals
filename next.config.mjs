import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'recharts', 
      'lucide-react', 
      '@radix-ui/react-icons',
      'date-fns',
      'framer-motion'
    ],
    // Enable modern JavaScript features
    browsersListForSwc: true,
    legacyBrowsers: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enhanced image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [],
    path: '/_next/image',
    loader: 'default',
    disableStaticImages: false,
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Only apply obfuscation in production and for client bundles
    if (!dev && !isServer) {
      const JavaScriptObfuscator = require('javascript-obfuscator');
      const WebpackObfuscator = require('webpack-obfuscator');
      const TerserPlugin = require('terser-webpack-plugin');
      
      // Add the JavaScript Obfuscator plugin
      config.optimization.minimizer.push(
        new WebpackObfuscator({
          compact: true,
          controlFlowFlattening: false, // Can cause performance issues if true
          deadCodeInjection: false, // Can increase bundle size if true
          debugProtection: false,
          debugProtectionInterval: 0,
          disableConsoleOutput: true,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          splitStrings: false,
          stringArray: true,
          stringArrayCallsTransform: false,
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 1,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 2,
          stringArrayWrappersType: 'variable',
          stringArrayThreshold: 0.75,
          unicodeEscapeSequence: false
        }, [])
      );
      
      // Add Terser with custom configuration for better minification
      config.optimization.minimize = true;
      
      // Enable tree shaking
      config.optimization.usedExports = true;
      
      // Implement module/nomodule pattern
      config.output.environment = {
        arrowFunction: true,
        bigIntLiteral: false,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true,
        optionalChaining: true,
        templateLiteral: true,
      };
    }
    
    return config;
  },
};

export default nextConfig;
