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
      // Enable tree shaking
      config.optimization.usedExports = true;
      
      // Add Terser with custom configuration for better minification
      config.optimization.minimize = true;
      
      // Try to use obfuscation if packages are available
      try {
        // Check if the obfuscator packages are available
        const WebpackObfuscator = require('webpack-obfuscator');
        
        // Add the JavaScript Obfuscator plugin if available
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
        console.log('Code obfuscation enabled');
      } catch (error) {
        console.warn('Code obfuscation disabled: Required packages not found');
        console.warn('To enable code obfuscation, install: npm install --save-dev javascript-obfuscator webpack-obfuscator');
      }
      
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
