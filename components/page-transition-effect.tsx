"use client"

import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function PageTransitionEffect() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [direction, setDirection] = useState<"left" | "right">("right")

  // Routes in order for determining direction
  const routes = ["/", "/thoughts", "/breathe", "/emotional-log", "/app-status"]

  useEffect(() => {
    // Determine transition direction based on route change
    const handleRouteChange = () => {
      const prevPathIndex = routes.findIndex((route) => route === localStorage.getItem("heartsHeal_lastPath"))
      const currentPathIndex = routes.findIndex((route) => route === pathname)

      if (prevPathIndex !== -1 && currentPathIndex !== -1) {
        setDirection(currentPathIndex > prevPathIndex ? "left" : "right")
      }

      // Store current path for next comparison
      localStorage.setItem("heartsHeal_lastPath", pathname)

      // Show transition effect
      setIsVisible(true)

      // Hide after animation completes
      setTimeout(() => {
        setIsVisible(false)
      }, 500)
    }

    handleRouteChange()
  }, [pathname])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm"
        initial={{
          x: direction === "left" ? "100%" : "-100%",
          opacity: 0.8,
        }}
        animate={{
          x: 0,
          opacity: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        }}
      />
    </motion.div>
  )
}
