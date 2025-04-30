"use client"

import { useEffect } from "react"

export function PWASetup() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope)
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
      })
    }

    // Set up safe area insets for iOS
    function updateSafeAreaInsets() {
      if (CSS.supports("padding: env(safe-area-inset-top)")) {
        document.documentElement.style.setProperty("--sat", "env(safe-area-inset-top)")
        document.documentElement.style.setProperty("--sar", "env(safe-area-inset-right)")
        document.documentElement.style.setProperty("--sab", "env(safe-area-inset-bottom)")
        document.documentElement.style.setProperty("--sal", "env(safe-area-inset-left)")
      }
    }

    // Update safe area insets on load and orientation change
    updateSafeAreaInsets()
    window.addEventListener("orientationchange", updateSafeAreaInsets)

    // Prevent pull-to-refresh on mobile
    document.body.addEventListener(
      "touchmove",
      (e) => {
        if (document.documentElement.scrollTop === 0 && e.touches[0].clientY > 0) {
          e.preventDefault()
        }
      },
      { passive: false },
    )

    return () => {
      window.removeEventListener("orientationchange", updateSafeAreaInsets)
    }
  }, [])

  return null
}
