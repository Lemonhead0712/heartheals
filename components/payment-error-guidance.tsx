"use client"

import { AlertCircle, CreditCard, RefreshCw, PhoneCall, HelpCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type PaymentErrorGuidanceProps = {
  errorCode?: string
  errorMessage?: string
  onRetry?: () => void
}

// Map Stripe error codes to user-friendly messages and solutions
const errorGuidance: Record<string, { title: string; description: string; solution: string }> = {
  card_declined: {
    title: "Card Declined",
    description: "Your card was declined by your bank or card issuer.",
    solution: "Try another card or contact your bank to resolve any issues with your card.",
  },
  insufficient_funds: {
    title: "Insufficient Funds",
    description: "Your card has insufficient funds to complete this purchase.",
    solution: "Try using another card or add funds to your current card.",
  },
  expired_card: {
    title: "Expired Card",
    description: "Your card has expired.",
    solution: "Please use a different card or contact your bank for a replacement.",
  },
  incorrect_cvc: {
    title: "Incorrect CVC",
    description: "The security code (CVC) you entered is incorrect.",
    solution: "Check the 3 or 4 digit security code on the back of your card and try again.",
  },
  processing_error: {
    title: "Processing Error",
    description: "An error occurred while processing your card.",
    solution: "Please try again or use a different payment method.",
  },
  incorrect_number: {
    title: "Incorrect Card Number",
    description: "The card number you entered is incorrect.",
    solution: "Please check your card number and try again.",
  },
  default: {
    title: "Payment Failed",
    description: "We couldn't process your payment.",
    solution: "Please try again or use a different payment method.",
  },
}

export function PaymentErrorGuidance({ errorCode, errorMessage, onRetry }: PaymentErrorGuidanceProps) {
  // Determine the appropriate guidance based on the error code or message
  const getErrorType = () => {
    if (!errorCode && !errorMessage) return "default"

    if (errorCode) return errorCode

    // Try to infer error type from message if code isn't available
    const message = errorMessage?.toLowerCase() || ""
    if (message.includes("declined")) return "card_declined"
    if (message.includes("insufficient") || message.includes("funds")) return "insufficient_funds"
    if (message.includes("expired")) return "expired_card"
    if (message.includes("cvc") || message.includes("security code")) return "incorrect_cvc"
    if (message.includes("processing")) return "processing_error"
    if (message.includes("card number") || message.includes("incorrect number")) return "incorrect_number"

    return "default"
  }

  const errorType = getErrorType()
  const guidance = errorGuidance[errorType] || errorGuidance.default

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">{guidance.title}</AlertTitle>
        <AlertDescription className="text-red-700">{guidance.description}</AlertDescription>
      </Alert>

      <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How to resolve this issue:</h3>
        <p className="text-sm text-gray-700 mb-4">{guidance.solution}</p>

        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Try Again
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
            onClick={() => (window.location.href = "/subscription")}
          >
            <CreditCard className="mr-1 h-3 w-3" />
            Use Different Card
          </Button>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="common-issues">
          <AccordionTrigger className="text-sm text-purple-700">Common reasons for card declines</AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>Insufficient funds in your account</li>
              <li>Unusual activity detected by your bank</li>
              <li>Incorrect card information entered</li>
              <li>Card restrictions for online or international purchases</li>
              <li>Expired card or outdated card information</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact-support">
          <AccordionTrigger className="text-sm text-purple-700">Need more help?</AccordionTrigger>
          <AccordionContent className="text-sm text-gray-600">
            <p className="mb-3">
              If you continue to experience issues, please contact your bank or reach out to our support team.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
                onClick={() => (window.location.href = "mailto:support@heartsheals.com")}
              >
                <HelpCircle className="mr-1 h-3 w-3" />
                Email Support
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-purple-700 border-purple-200 hover:bg-purple-50"
                onClick={() => (window.location.href = "tel:+18005551234")}
              >
                <PhoneCall className="mr-1 h-3 w-3" />
                Call Support
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
