"use client"

import { useState, useEffect } from "react"
import { useIntersectionObserver } from "./use-intersection-observer"

/**
 * Hook for lazy loading components when they enter the viewport
 * @param threshold Intersection threshold to trigger loading
 * @param rootMargin Margin around the root
 * @returns Object with ref to attach to container and isVisible state
 */
export function useLazyLoad(threshold = 0.1, rootMargin = "100px") {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    if (isIntersecting && !isLoaded) {
      setIsLoaded(true)
    }
  }, [isIntersecting, isLoaded])

  return { ref, isLoaded }
}
