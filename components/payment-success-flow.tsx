"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { PaymentSuccessAnimation } from "@/components/payment-success-animation"

interface PaymentSuccessFlowProps {
  paymentId?: string
  email?: string
  redirectPath?: string
}

export function PaymentSuccessFlow({ paymentId, email, redirectPath }: PaymentSuccessFlowProps) {
  const [step, setStep] = useState<"success" | "account" | "complete">("success")
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // If user is already authenticated, skip to complete
    if (isAuthenticated && user) {
      setStep("complete")
    }

    // Store payment info if available
    if (paymentId) {
      localStorage.setItem(
        "heartsHeal_paymentInfo",
        JSON.stringify({
          paymentId,
          timestamp: new Date().toISOString(),
          status: "completed",
        }),
      )
    }
  }, [isAuthenticated, user, paymentId])

  const handleCreateAccount = () => {
    const redirectUrl = `/create-account?source=payment${email ? `&email=${encodeURIComponent(email)}` : ""}`
    router.push(redirectUrl)
  }

  const handleLogin = () => {
    const redirectUrl = `/login?source=payment${email ? `&email=${encodeURIComponent(email)}` : ""}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`
    router.push(redirectUrl)
  }

  const handleContinue = () => {
    if (redirectPath) {
      router.push(redirectPath)
    } else {
      router.push("/")
    }
  }

  if (step === "success") {
    return (
      <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800">Payment Successful!</CardTitle>
          <CardDescription className="text-purple-600">Your payment has been processed successfully</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <PaymentSuccessAnimation />
          <p className="text-center text-gray-700 mt-4">
            Thank you for subscribing to HeartHeals Premium! To access your premium features, please create an account
            or log in.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleCreateAccount}>
            Create Account
          </Button>
          <Button
            variant="outline"
            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={handleLogin}
          >
            Log In
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (step === "complete") {
    return (
      <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-800">All Set!</CardTitle>
          <CardDescription className="text-purple-600">Your premium subscription is now active</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <PaymentSuccessAnimation />
          <p className="text-center text-gray-700 mt-4">
            You now have access to all premium features. Enjoy your enhanced HeartHeals experience!
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return null
}
