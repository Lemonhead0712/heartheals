/**
 * CDN Integration Utilities for HeartHeals
 *
 * This file contains utilities and configurations for integrating
 * with Content Delivery Networks to optimize asset delivery.
 */

export interface CDNConfig {
  provider: string
  enabled: boolean
  cacheControl: string
  assetTypes: string[]
}

export const defaultCDNConfig: CDNConfig = {
  provider: "vercel",
  enabled: true,
  cacheControl: "public, max-age=31536000, immutable",
  assetTypes: ["images", "fonts", "static"],
}

/**
 * Generates the appropriate cache control headers for different asset types
 */
export function generateCacheHeaders(assetType: string): Record<string, string> {
  switch (assetType) {
    case "images":
      return {
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    case "fonts":
      return {
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    case "static":
      return {
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    case "api":
      return {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
      }
    case "html":
      return {
        "Cache-Control": "public, max-age=0, must-revalidate",
      }
    default:
      return {
        "Cache-Control": "no-cache, no-store",
      }
  }
}

/**
 * Vercel Edge Network configuration recommendations
 */
export const vercelEdgeConfig = {
  images: {
    domains: ["placeholder.svg"],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  headers: [
    {
      source: "/fonts/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/images/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
}

/**
 * Cloudflare configuration recommendations
 */
export const cloudflareConfig = {
  pageRules: [
    {
      url: "*.heartheals.com/images/*",
      settings: {
        cacheLevel: "Cache Everything",
        edgeCacheTtl: 2592000, // 30 days
        browserCacheTtl: 2592000, // 30 days
      },
    },
    {
      url: "*.heartheals.com/fonts/*",
      settings: {
        cacheLevel: "Cache Everything",
        edgeCacheTtl: 2592000, // 30 days
        browserCacheTtl: 2592000, // 30 days
      },
    },
    {
      url: "*.heartheals.com/_next/static/*",
      settings: {
        cacheLevel: "Cache Everything",
        edgeCacheTtl: 2592000, // 30 days
        browserCacheTtl: 2592000, // 30 days
      },
    },
  ],
}

/**
 * Utility to determine if a path should be cached
 */
export function shouldCachePath(path: string): boolean {
  const cachePaths = [/^\/_next\/static\/.*/, /^\/images\/.*/, /^\/fonts\/.*/, /^\/icons\/.*/, /^\/assets\/.*/]

  return cachePaths.some((regex) => regex.test(path))
}
