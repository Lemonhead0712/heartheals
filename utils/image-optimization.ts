/**
 * Image Optimization Utilities for HeartHeals
 *
 * This file contains utilities for optimizing images in the application.
 */

export interface ImageFormat {
  format: "webp" | "avif" | "jpg" | "png"
  quality: number
  priority: number // Lower is higher priority
}

export const supportedFormats: ImageFormat[] = [
  { format: "avif", quality: 80, priority: 1 },
  { format: "webp", quality: 85, priority: 2 },
  { format: "jpg", quality: 90, priority: 3 },
]

/**
 * Generates srcset for responsive images
 */
export function generateSrcSet(basePath: string, widths: number[], format: string): string {
  return widths.map((width) => `${basePath}?w=${width}&f=${format} ${width}w`).join(", ")
}

/**
 * Generates sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(", ")
}

/**
 * Default image breakpoints for responsive loading
 */
export const defaultBreakpoints = {
  "640px": "100vw",
  "768px": "50vw",
  "1024px": "33vw",
  "1280px": "25vw",
}

/**
 * Example usage:
 *
 * <img
 *   src="/images/example.jpg?w=800&f=webp"
 *   srcSet={generateSrcSet('/images/example.jpg', [400, 800, 1200, 1600], 'webp')}
 *   sizes={generateSizes(defaultBreakpoints)}
 *   alt="Example image"
 * />
 */

/**
 * Placeholder generation for images
 */
export function generatePlaceholderURL(width: number, height: number, text: string): string {
  return `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(text)}`
}

/**
 * Image loading strategies
 */
export const loadingStrategies = {
  eager: {
    description: "Load immediately, good for above-the-fold images",
    usage: 'loading="eager"',
  },
  lazy: {
    description: "Defer loading until near viewport, good for below-the-fold images",
    usage: 'loading="lazy"',
  },
  progressive: {
    description: "Show low-quality placeholder while loading high-quality image",
    usage: 'placeholder="blur" blurDataURL="data:image/..."',
  },
}
