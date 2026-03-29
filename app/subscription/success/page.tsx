"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { BottomNav } from "@/components/bottom-nav"
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react"

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check if the payment was successful
    const paymentIntentId = searchParams.get("payment_intent")
    const paymentIntentClientSecret = searchParams.get("payment_intent_client_secret")

    if (!paymentIntentId || !paymentIntentClientSecret) {
      setIsVerifying(false)
      setErrorMessage("Invalid payment information. Please try again.")
      return
    }

    // In a real app, you would verify the payment with your backend
    // For this example, we'll simulate a successful verification
    const verifyPayment = async () => {
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // For demo purposes, always succeed
        setIsSuccess(true)
        setIsVerifying(false)
      } catch (error) {
        setIsSuccess(false)
        setIsVerifying(false)
        setErrorMessage("Failed to verify payment. Please contact support.")
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col items-center mb-10">
          <Logo size="small" />
        </div>

        <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-purple-800">
              {isVerifying
                ? "Verifying Your Subscription"
                : isSuccess
                  ? "Subscription Activated!"
                  : "Subscription Error"}
            </CardTitle>
            <CardDescription className="text-purple-600">
              {isVerifying
                ? "Please wait while we confirm your payment..."
                : isSuccess
                  ? "Thank you for subscribing to HeartsHeal Premium"
                  : "There was a problem with your subscription"}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center py-8">
            {isVerifying ? (
              <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
            ) : isSuccess ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="h-24 w-24 text-green-500" />
              </motion.div>
            ) : (
              <div className="text-center text-red-600">
                <p>{errorMessage || "An unknown error occurred."}</p>
              </div>
            )}

            {isSuccess && (
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-purple-700 mb-4">
                  Your premium features are now active! Enjoy enhanced emotional wellness tools and support on your
                  journey.
                </p>
                <p className="text-sm text-purple-600 mb-2">
                  Subscription will renew automatically on a monthly basis.
                </p>
                <p className="text-sm text-purple-600">
                  You can manage your subscription at any time from your account settings.
                </p>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}
