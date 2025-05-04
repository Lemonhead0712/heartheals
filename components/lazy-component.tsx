"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"

interface LazyComponentProps {
  children: React.ReactNode
  threshold?: number
  rootMargin?: string
  placeholder?: React.ReactNode
}

/**
 * LazyComponent - Only renders its children when they come into view
 * Useful for deferring the rendering of heavy components until needed
 */
export default function LazyComponent({
  children,
  threshold = 0.1,
  rootMargin = "100px",
  placeholder = <div className="min-h-[100px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />,
}: LazyComponentProps) {
  const [loaded, setLoaded] = useState(false)
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView && !loaded) {
      setLoaded(true)
    }
  }, [inView, loaded])

  return <div ref={ref}>{loaded ? children : placeholder}</div>
}
