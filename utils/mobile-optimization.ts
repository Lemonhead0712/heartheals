"use client"

// Mobile optimization utilities
import { useEffect, useState } from "react"

// Device detection
export function useDeviceDetection() {
  const [device, setDevice] = useState<{
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    isIOS: boolean
    isAndroid: boolean
    isTouchDevice: boolean
    orientation: "portrait" | "landscape"
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    orientation: "portrait",
  })

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window === "undefined") return

      const ua = navigator.userAgent
      const width = window.innerWidth

      // Check for mobile/tablet/desktop
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Check for iOS/Android
      const isIOS = /iPhone|iPad|iPod/i.test(ua)
      const isAndroid = /Android/i.test(ua)

      // Check for touch capability
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // Check orientation
      const orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape"

      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouchDevice,
        orientation,
      })
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    window.addEventListener("orientationchange", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", checkDevice)
    }
  }, [])

  return device
}

// Optimize image loading based on device
export function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number
    quality?: number
    format?: "webp" | "jpeg" | "png" | "avif"
    devicePixelRatio?: number
  } = {},
) {
  if (!baseUrl) return ""

  // Default options
  const {
    width = 800,
    quality = 80,
    format = "webp",
    devicePixelRatio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  } = options

  // Calculate actual width based on device pixel ratio
  const actualWidth = Math.round(width * devicePixelRatio)

  // For placeholder.svg URLs
  if (baseUrl.includes("placeholder.svg")) {
    return `${baseUrl}&width=${actualWidth}&quality=${quality}`
  }

  // For other images, assume we're using a service like Vercel's Image Optimization
  return `${baseUrl}?width=${actualWidth}&quality=${quality}&format=${format}`
}

// Handle orientation changes
export function useOrientationChange(callback: (orientation: "portrait" | "landscape") => void) {
  useEffect(() => {
    const handleOrientationChange = () => {
      const orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      callback(orientation)
    }

    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)

    // Initial call
    handleOrientationChange()

    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [callback])
}

// Detect network status for offline capabilities
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}
