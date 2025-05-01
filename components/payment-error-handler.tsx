"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentErrorHandlerProps {
  error: string
  onRetry?: () => void
  onCancel?: () => void
  showRetry?: boolean
  showCancel?: boolean
  retryText?: string
  cancelText?: string
}

export function PaymentErrorHandler({
  error,
  onRetry,
  onCancel,
  showRetry = true,
  showCancel = true,
  retryText = "Try Again",
  cancelText = "Cancel Payment",
}: PaymentErrorHandlerProps) {
  const router = useRouter()
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    // Parse error message for more details if available
    if (error.includes(":")) {
      const [main, details] = error.split(":", 2)
      setErrorDetails(details.trim())
    } else {
      setErrorDetails(null)
    }
  }, [error])

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      // Default behavior: go back to subscription page
      router.push("/subscription")
    }
  }

  return (
    <Alert className="border-red-200 bg-red-50 mb-6">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 font-medium">Payment Error</AlertTitle>
      <AlertDescription className="text-red-700">
        <p className="mb-2">{error}</p>
        {errorDetails && <p className="text-sm opacity-80 mb-3">{errorDetails}</p>}
        <div className="flex flex-wrap gap-3 mt-4">
          {showRetry && onRetry && (
            <Button size="sm" onClick={onRetry} className="bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          )}
          {showCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {cancelText}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
