"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, AlertTriangle, RefreshCw, PhoneCall } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { BottomNav } from "@/components/bottom-nav"
import { PageContainer } from "@/components/page-container"
import { PaymentErrorGuidance } from "@/components/payment-error-guidance"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Get error details from URL parameters
    const code = searchParams.get("code")
    const message = searchParams.get("message")

    if (code) setErrorCode(code)
    if (message) setErrorMessage(decodeURIComponent(message))
  }, [searchParams])

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20">
        <motion.div
          className="container mx-auto px-4 py-8 max-w-4xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="flex flex-col items-center mb-6" variants={item}>
            <Logo size="small" />
          </motion.div>

          <motion.div className="mb-8" variants={item}>
            <Link
              href="/subscription"
              className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Subscription
            </Link>
            <h1 className="text-3xl font-bold text-purple-800 mt-4 mb-2">Payment Unsuccessful</h1>
            <p className="text-purple-600">We encountered an issue processing your payment</p>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  <CardTitle className="text-purple-800">Payment Failed</CardTitle>
                </div>
                <CardDescription className="text-purple-600">Your payment could not be processed</CardDescription>
              </CardHeader>

              <CardContent>
                <PaymentErrorGuidance errorCode={errorCode || undefined} errorMessage={errorMessage || undefined} />
              </CardContent>

              <CardFooter className="flex flex-col items-start space-y-4">
                <div className="w-full">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => (window.location.href = "/subscription")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>

                <div className="flex items-center justify-between w-full">
                  <Button
                    variant="outline"
                    className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={() => (window.location.href = "mailto:support@heartsheals.com")}
                  >
                    <PhoneCall className="mr-1 h-4 w-4" />
                    Contact Support
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={() => (window.location.href = "/")}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Return Home
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        <BottomNav />
      </div>
    </PageContainer>
  )
}
