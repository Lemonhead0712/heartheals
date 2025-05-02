"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface ActivationSuccessProps {
  userName?: string
  redirectDelay?: number
  redirectPath?: string
  onComplete?: () => void
}

export function ActivationSuccess({
  userName,
  redirectDelay = 5,
  redirectPath = "/",
  onComplete,
}: ActivationSuccessProps) {
  const [countdown, setCountdown] = useState(redirectDelay)
  const router = useRouter()
  const { toast } = useToast()

  // Trigger confetti effect on mount
  useEffect(() => {
    try {
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#9C27B0", "#E91E63", "#673AB7"],
        })

        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#9C27B0", "#E91E63", "#673AB7"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    } catch (error) {
      console.error("Error with confetti animation:", error)
    }

    // Show toast notification
    toast({
      title: "Premium Activated!",
      description: "Your account has been fully activated with premium features.",
      variant: "default",
    })

    // Countdown timer for auto-redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [toast])

  const handleRedirect = () => {
    if (onComplete) {
      onComplete()
      return
    }

    try {
      router.push(redirectPath)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location
      window.location.href = redirectPath
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-lg w-full max-w-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>

          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <motion.div
                className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                initial={{ rotate: -180, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">Account Activated!</CardTitle>
            <CardDescription className="text-purple-600">
              {userName ? `Welcome, ${userName}!` : "Welcome to HeartHeals Premium!"}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <p className="text-gray-700 mb-2">
                Your account has been successfully activated with full premium access.
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center bg-purple-50 p-3 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                  <span className="text-purple-700 text-sm">Unlimited emotional log entries</span>
                </div>
                <div className="flex items-center bg-purple-50 p-3 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                  <span className="text-purple-700 text-sm">Advanced analytics and insights</span>
                </div>
                <div className="flex items-center bg-purple-50 p-3 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-500 mr-3 flex-shrink-0" />
                  <span className="text-purple-700 text-sm">All premium features unlocked</span>
                </div>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200"
              onClick={handleRedirect}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="text-sm text-center text-gray-500">Redirecting in {countdown} seconds...</div>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
