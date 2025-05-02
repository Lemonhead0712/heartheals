"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { Crown, Calendar, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export function PremiumDashboard() {
  const { tier, isActive, remainingDays } = useSubscription()
  const [showAnimation, setShowAnimation] = useState(false)

  // Check if this is a newly activated premium account
  useEffect(() => {
    if (tier === "premium" && isActive) {
      const lastActivation = localStorage.getItem("heartsHeal_lastActivationTime")
      const now = Date.now()

      // If newly activated (within last 5 minutes)
      if (!lastActivation || now - Number.parseInt(lastActivation, 10) < 5 * 60 * 1000) {
        setShowAnimation(true)
        localStorage.setItem("heartsHeal_lastActivationTime", now.toString())
      }
    }
  }, [tier, isActive])

  if (tier !== "premium" || !isActive) return null

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-purple-800 flex items-center">
                <Crown className="h-5 w-5 text-amber-500 mr-2" />
                Premium Account
              </CardTitle>
              <CardDescription className="text-purple-600">All premium features unlocked</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-purple-700 mb-2">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            {remainingDays !== null ? (
              <span>Your subscription renews in {remainingDays} days</span>
            ) : (
              <span>Your subscription is active</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-purple-700">Unlimited logs</span>
            </div>
            <div className="flex items-center text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-purple-700">Advanced analytics</span>
            </div>
            <div className="flex items-center text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-purple-700">Data export</span>
            </div>
            <div className="flex items-center text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-purple-700">Premium support</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
