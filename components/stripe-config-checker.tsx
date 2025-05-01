"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export function StripeConfigChecker() {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const response = await fetch("/api/subscription/validate-config")
        const data = await response.json()

        if (response.ok && data.status === "ok") {
          setStatus("valid")
        } else {
          setStatus("invalid")
          setMessage(data.message || "Stripe configuration is invalid")
        }
      } catch (error) {
        setStatus("invalid")
        setMessage("Failed to validate Stripe configuration")
        console.error("Error checking Stripe config:", error)
      }
    }

    checkStripeConfig()
  }, [])

  if (status === "loading") {
    return null
  }

  if (status === "valid") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Stripe Configuration Valid</AlertTitle>
        <AlertDescription className="text-green-700">
          Payment system is properly configured and ready to use.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Stripe Configuration Error</AlertTitle>
      <AlertDescription>{message || "There is an issue with the payment system configuration."}</AlertDescription>
    </Alert>
  )
}
