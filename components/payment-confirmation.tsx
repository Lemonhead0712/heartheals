"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { safeLocalStorage, safeJsonParse } from "@/utils/error-utils"

interface PaymentConfirmationProps {
  paymentId?: string
  email?: string
  amount?: number
  redirectPath?: string
  onComplete?: () => void
}

export function PaymentConfirmation({ paymentId, email, amount, redirectPath, onComplete }: PaymentConfirmationProps) {
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Try to get payment info from localStorage
    const storedInfo = safeLocalStorage("heartsHeal_paymentInfo", "get")

    if (storedInfo) {
      try {
        const parsedInfo = safeJsonParse(storedInfo, null)
        if (parsedInfo) {
          setPaymentInfo(parsedInfo)

          // If email wasn't provided but is in payment info, use it
          if (!email && parsedInfo.email) {
            email = parsedInfo.email
          }

          // If amount wasn't provided but is in payment info, use it
          if (!amount && parsedInfo.amount) {
            amount = parsedInfo.amount
          }
        }
      } catch (error) {
        console.error("Error parsing payment info:", error)
        setError("Could not retrieve payment details. Please contact support.")
      }
    }
  }, [email, amount])

  const handleCreateAccount = () => {
    try {
      const redirectUrl = `/create-account?source=payment${email ? `&email=${encodeURIComponent(email as string)}` : ""}`
      router.push(redirectUrl)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location
      window.location.href = `/create-account?source=payment${email ? `&email=${encodeURIComponent(email as string)}` : ""}`
    }
  }

  const handleLogin = () => {
    try {
      const redirectUrl = `/login?source=payment${email ? `&email=${encodeURIComponent(email as string)}` : ""}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`
      router.push(redirectUrl)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location
      window.location.href = `/login?source=payment${email ? `&email=${encodeURIComponent(email as string)}` : ""}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`
    }
  }

  const handleContinue = () => {
    if (onComplete) {
      onComplete()
      return
    }

    try {
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location
      window.location.href = redirectPath || "/"
    }
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-purple-800">Payment Successful!</CardTitle>
        <CardDescription className="text-purple-600">Your payment has been processed successfully</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        {error ? (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
            <AlertDescription className="text-amber-800">{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="text-center space-y-2 mb-6">
            <p className="text-gray-700">
              Thank you for subscribing to HeartHeals Premium!
              {amount && <span> Your payment of ${(amount / 100).toFixed(2)} has been confirmed.</span>}
            </p>
            <p className="text-gray-700">To access your premium features, please create an account or log in.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleCreateAccount}>
          Create Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={handleLogin}
        >
          Log In
        </Button>
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          onClick={handleContinue}
        >
          Continue as Guest
        </Button>
      </CardFooter>
    </Card>
  )
}
