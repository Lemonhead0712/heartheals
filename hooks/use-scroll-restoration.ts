"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface ScrollPositions {
  [key: string]: number
}

export function useScrollRestoration() {
  const pathname = usePathname()
  const scrollPositions = useRef<ScrollPositions>({})
  const isBack = useRef(false)

  // Store scroll position before navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleBeforeUnload = () => {
      scrollPositions.current[pathname] = window.scrollY
      sessionStorage.setItem("scrollPositions", JSON.stringify(scrollPositions.current))
    }

    // Try to load saved positions from sessionStorage
    try {
      const savedPositions = sessionStorage.getItem("scrollPositions")
      if (savedPositions) {
        scrollPositions.current = JSON.parse(savedPositions)
      }
    } catch (e) {
      console.error("Failed to restore scroll positions:", e)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      scrollPositions.current[pathname] = window.scrollY
    }
  }, [pathname])

  // Handle back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      isBack.current = true
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  // Restore scroll position
  useEffect(() => {
    if (typeof window === "undefined") return

    // Wait for content to render
    const timeoutId = setTimeout(() => {
      if (isBack.current && scrollPositions.current[pathname]) {
        window.scrollTo(0, scrollPositions.current[pathname])
        isBack.current = false
      } else {
        window.scrollTo(0, 0)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return null
}
