"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentFailureMessageProps {
  title?: string
  message?: string
  details?: string
  onRetry?: () => void
  onUpdatePaymentMethod?: () => void
}

export function PaymentFailureMessage({
  title = "Payment Failed",
  message = "We were unable to process your payment.",
  details,
  onRetry,
  onUpdatePaymentMethod,
}: PaymentFailureMessageProps) {
  return (
    <Card className="border-rose-200 bg-rose-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-rose-700">{title}</CardTitle>
        </div>
        <CardDescription className="text-rose-700/90">{message}</CardDescription>
      </CardHeader>
      {details && (
        <CardContent className="pb-2">
          <p className="text-sm text-rose-700/80">{details}</p>
        </CardContent>
      )}
      <CardFooter className="flex gap-2">
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
          >
            Try Again
          </Button>
        )}
        {onUpdatePaymentMethod && (
          <Button onClick={onUpdatePaymentMethod} className="bg-rose-600 text-white hover:bg-rose-700">
            Update Payment Method
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
