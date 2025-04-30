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

// Network status detection
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Set initial status
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

// Scroll performance testing
export function useScrollPerformance() {
  const [fps, setFps] = useState(60)
  const [jank, setJank] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const startMonitoring = () => {
    if (typeof window === "undefined") return
    setIsMonitoring(true)
  }

  const stopMonitoring = () => {
    setIsMonitoring(false)
  }

  useEffect(() => {
    if (!isMonitoring || typeof window === "undefined") return

    let frameCount = 0
    let lastTime = performance.now()
    const frameTimes: number[] = []
    let rafId: number

    const measureFps = (timestamp: number) => {
      frameCount++
      const elapsed = timestamp - lastTime
      frameTimes.push(elapsed)

      // Keep only the last 60 frames
      if (frameTimes.length > 60) {
        frameTimes.shift()
      }

      // Calculate FPS every second
      if (timestamp - lastTime >= 1000) {
        const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length
        const currentFps = Math.round(1000 / averageFrameTime)

        // Calculate jank (percentage of frames that took longer than 16.7ms)
        const jankFrames = frameTimes.filter((time) => time > 16.7).length
        const jankPercentage = Math.round((jankFrames / frameTimes.length) * 100)

        setFps(currentFps)
        setJank(jankPercentage)

        frameCount = 0
        lastTime = timestamp
      }

      rafId = requestAnimationFrame(measureFps)
    }

    rafId = requestAnimationFrame(measureFps)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isMonitoring])

  return { fps, jank, startMonitoring, stopMonitoring, isMonitoring }
}

// Detect scroll capability
export function detectScrollCapability() {
  if (typeof window === "undefined")
    return {
      smoothScrollSupported: true,
      passiveEventsSupported: true,
      momentumScrollSupported: true,
    }

  // Check for smooth scrolling support
  const smoothScrollSupported = "scrollBehavior" in document.documentElement.style

  // Check for passive event listeners
  let passiveEventsSupported = false
  try {
    const options = {
      get passive() {
        passiveEventsSupported = true
        return false
      },
    }
    window.addEventListener("test", null as any, options)
    window.removeEventListener("test", null as any, options)
  } catch (err) {
    passiveEventsSupported = false
  }

  // Check for momentum scrolling (best guess based on platform)
  const momentumScrollSupported = /iPhone|iPad|iPod|Android/.test(navigator.userAgent)

  return {
    smoothScrollSupported,
    passiveEventsSupported,
    momentumScrollSupported,
  }
}
