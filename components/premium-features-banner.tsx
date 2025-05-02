"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

export function PremiumFeaturesBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const { tier, isActive } = useSubscription()

  useEffect(() => {
    // Check if this is a newly activated premium account
    const checkNewActivation = () => {
      try {
        const lastActivationTime = localStorage.getItem("heartsHeal_lastActivationBanner")
        const now = Date.now()

        // If premium is active and banner hasn't been shown in the last 24 hours
        if (tier === "premium" && isActive) {
          if (!lastActivationTime || now - Number.parseInt(lastActivationTime, 10) > 24 * 60 * 60 * 1000) {
            // Show banner after a short delay
            setTimeout(() => {
              setIsVisible(true)
              setHasShown(true)
              localStorage.setItem("heartsHeal_lastActivationBanner", now.toString())
            }, 1000)
          }
        }
      } catch (error) {
        console.error("Error checking activation banner status:", error)
      }
    }

    checkNewActivation()
  }, [tier, isActive])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-0 right-0 mx-auto px-4 z-50 max-w-md"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <Card className="border-purple-200 bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>

          <CardContent className="pt-6 pb-4">
            <div className="flex items-center mb-3">
              <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="font-medium text-purple-800">Premium Features Activated!</h3>
            </div>

            <p className="text-sm text-purple-700 mb-3">Your account now has full access to all premium features.</p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center bg-purple-50 p-2 rounded">
                <Sparkles className="h-3 w-3 text-purple-400 mr-1 flex-shrink-0" />
                <span className="text-purple-700">Unlimited logs</span>
              </div>
              <div className="flex items-center bg-purple-50 p-2 rounded">
                <Sparkles className="h-3 w-3 text-purple-400 mr-1 flex-shrink-0" />
                <span className="text-purple-700">Advanced analytics</span>
              </div>
              <div className="flex items-center bg-purple-50 p-2 rounded">
                <Sparkles className="h-3 w-3 text-purple-400 mr-1 flex-shrink-0" />
                <span className="text-purple-700">Data export</span>
              </div>
              <div className="flex items-center bg-purple-50 p-2 rounded">
                <Sparkles className="h-3 w-3 text-purple-400 mr-1 flex-shrink-0" />
                <span className="text-purple-700">Premium support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
