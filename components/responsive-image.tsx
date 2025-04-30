"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getOptimizedImageUrl } from "@/utils/mobile-optimization"
import { useMobile } from "@/hooks/use-mobile"

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  width?: number
  height?: number
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  quality = 80,
  fill = false,
  width,
  height,
  style,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const { deviceType, viewportWidth } = useMobile()
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Skip optimization for SVGs, data URLs, and external URLs that can't be optimized
    if (src.startsWith("data:") || src.endsWith(".svg") || src.includes("placeholder.svg")) {
      setOptimizedSrc(src)
      return
    }

    // Calculate appropriate image width based on device
    let imageWidth = width || 800

    if (!width && deviceType === "mobile") {
      imageWidth = Math.min(viewportWidth, 640)
    } else if (!width && deviceType === "tablet") {
      imageWidth = Math.min(viewportWidth, 1024)
    }

    // Get optimized image URL
    const optimized = getOptimizedImageUrl(src, {
      width: imageWidth,
      quality,
      format: "webp",
    })

    setOptimizedSrc(optimized)
  }, [src, deviceType, viewportWidth, width, quality])

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  return (
    <div className={`relative ${className || ""}`} style={style}>
      {isLoading && <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md" />}

      {hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      ) : (
        <Image
          src={optimizedSrc || "/placeholder.svg"}
          alt={alt}
          sizes={sizes}
          priority={priority}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />
      )}
    </div>
  )
}
