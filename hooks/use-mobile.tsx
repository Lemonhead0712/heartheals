"use client"

import { useState, useEffect, useCallback } from "react"

export type DeviceType = "mobile" | "tablet" | "desktop"
export type Orientation = "portrait" | "landscape"

interface MobileState {
  deviceType: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: Orientation
  isPortrait: boolean
  isLandscape: boolean
  touchSupported: boolean
  viewportWidth: number
  viewportHeight: number
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export function useMobile() {
  const [state, setState] = useState<MobileState>({
    deviceType: "desktop",
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: "portrait",
    isPortrait: true,
    isLandscape: false,
    touchSupported: false,
    viewportWidth: 0,
    viewportHeight: 0,
    safeAreaInsets: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  })

  const updateDeviceInfo = useCallback(() => {
    if (typeof window === "undefined") return

    const width = window.innerWidth
    const height = window.innerHeight

    // Determine device type based on screen width
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024
    const isDesktop = width >= 1024
    const deviceType: DeviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"

    // Determine orientation
    const orientation: Orientation = height > width ? "portrait" : "landscape"

    // Check for touch support
    const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0

    // Get safe area insets (for notches, home indicators, etc.)
    const safeAreaInsets = {
      top: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat") || "0", 10),
      right: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar") || "0", 10),
      bottom: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab") || "0", 10),
      left: Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal") || "0", 10),
    }

    setState({
      deviceType,
      isMobile,
      isTablet,
      isDesktop,
      orientation,
      isPortrait: orientation === "portrait",
      isLandscape: orientation === "landscape",
      touchSupported,
      viewportWidth: width,
      viewportHeight: height,
      safeAreaInsets,
    })
  }, [])

  useEffect(() => {
    // Initial check
    updateDeviceInfo()

    // Add event listeners for resize and orientation change
    window.addEventListener("resize", updateDeviceInfo)
    window.addEventListener("orientationchange", updateDeviceInfo)

    // Clean up
    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
      window.removeEventListener("orientationchange", updateDeviceInfo)
    }
  }, [updateDeviceInfo])

  return state
}
