"use client"

import { useState, useEffect, useRef } from "react"

interface UseIntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  triggerOnce?: boolean
}

/**
 * Custom hook for intersection observer API
 * Useful for lazy loading components and images
 */
export function useIntersectionObserver<T extends Element>({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  triggerOnce = false,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<T | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry)
        setIsIntersecting(entry.isIntersecting)

        // If triggerOnce is true and element is intersecting, disconnect observer
        if (triggerOnce && entry.isIntersecting) {
          observerRef.current?.disconnect()
        }
      },
      { root, rootMargin, threshold },
    )

    // Observe element if it exists
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current)
    }

    // Cleanup on unmount
    return () => {
      observerRef.current?.disconnect()
    }
  }, [root, rootMargin, threshold, triggerOnce])

  return { ref: elementRef, entry, isIntersecting }
}
