"use client"

import { useState, useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string
  loadingClassName?: string
  loadedClassName?: string
  errorClassName?: string
  withBlur?: boolean
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  className,
  loadingClassName,
  loadedClassName,
  errorClassName,
  withBlur = true,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(!priority)
  const [error, setError] = useState(false)
  const [blurDataURL, setBlurDataURL] = useState<string | undefined>(
    withBlur
      ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBzdG9wLWNvbG9yPSIjZjJmMmYyIiBvZmZzZXQ9IjAlIi8+PHN0b3Agc3RvcC1jb2xvcj0iI2U2ZTZlNiIgb2Zmc2V0PSIxMDAlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnMSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4="
      : undefined,
  )
  const imageRef = useRef<HTMLImageElement>(null)

  // Check if image is already cached
  useEffect(() => {
    if (priority) return

    if (typeof src === "string") {
      const img = new Image()
      img.src = src
      if (img.complete) {
        setLoading(false)
      }
    }
  }, [src, priority])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  return (
    <div className="relative overflow-hidden">
      <Image
        ref={imageRef}
        src={error && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={cn(
          className,
          loading && loadingClassName,
          !loading && !error && loadedClassName,
          error && errorClassName,
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
        )}
        placeholder={withBlur ? "blur" : undefined}
        blurDataURL={blurDataURL}
        priority={priority}
        onLoadingComplete={handleLoad}
        onError={handleError}
        {...props}
      />
      {loading && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
    </div>
  )
}
