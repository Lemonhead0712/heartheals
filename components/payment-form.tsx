"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/contexts/subscription-context"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { Check, Heart, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error", message?: string) => void
}

// Success animation component
const PaymentSuccessAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [countdown, setCountdown] = useState(5)

  // Trigger confetti effect
  useEffect(() => {
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#9C27B0", "#E91E63", "#673AB7"],
      })

      confetti({
        particleCount: 2,
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

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-purple-900/80 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 text-center relative overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        {/* Floating hearts animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: Math.random() * 100 - 50 + "%",
                y: "100%",
                opacity: 0.7,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: "-100%",
                opacity: 0,
                transition: {
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: Math.random() * 2,
                },
              }}
            >
              <Heart className="h-6 w-6 text-pink-400 fill-pink-400" />
            </motion.div>
          ))}
        </div>

        {/* Success checkmark with sparkles */}
        <motion.div
          className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
          initial={{ rotate: -180, scale: 0.5 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
        >
          <Check className="h-12 w-12 text-white" />

          {/* Sparkles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 bg-white rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: Math.cos((i * Math.PI) / 4) * 50,
                y: Math.sin((i * Math.PI) / 4) * 50,
                opacity: [0, 1, 0],
                transition: {
                  duration: 1.5,
                  delay: 0.4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1,
                },
              }}
            />
          ))}
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-purple-800 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Payment Successful!
        </motion.h2>

        <motion.p
          className="text-purple-600 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your premium subscription has been activated
        </motion.p>

        <motion.div
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Redirecting to dashboard in {countdown} seconds...
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// Payment form wrapper with Stripe provider
export function PaymentForm({ amount, onPaymentStatusChange }: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent amount={amount} onPaymentStatusChange={onPaymentStatusChange} />
    </Elements>
  )
}

// Payment form content
function PaymentFormContent({ amount, onPaymentStatusChange }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const { setTier, setIsActive, setExpiresAt } = useSubscription()
  const { user, isAuthenticated } = useAuth() // Use our custom auth context instead of Clerk
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setProcessing(true)
    onPaymentStatusChange("processing")

    try {
      // For demo purposes, we'll simulate a successful payment without actually charging
      // In a real app, you would create a payment intent on the server and confirm it here

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      setSucceeded(true)
      setProcessing(false)
      onPaymentStatusChange("success")

      // Update subscription status
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1) // Set expiry to 1 month from now

      setTier("premium")
      setIsActive(true)
      setExpiresAt(expiryDate)

      // Send confirmation email
      try {
        const response = await fetch("/api/subscription/send-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            userName: name || "Valued User",
            subscriptionPlan: "Premium",
            amount: "$5.00",
          }),
        })

        const emailResult = await response.json()
        if (!emailResult.success) {
          console.error("Failed to send confirmation email:", emailResult.error)
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
      }

      // Show success animation
      setShowSuccessAnimation(true)
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setProcessing(false)
      onPaymentStatusChange("error", err instanceof Error ? err.message : "Payment processing failed")

      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "There was an issue processing your payment",
        variant: "destructive",
      })
    }
  }

  const handleRedirectAfterSuccess = () => {
    // If user is not logged in, redirect to account creation page
    if (!isAuthenticated) {
      router.push(`/create-account?email=${encodeURIComponent(email)}`)
    } else {
      // Otherwise redirect to home page
      router.push("/")

      toast({
        title: "Welcome to Premium!",
        description: "Your subscription has been activated successfully.",
        variant: "default",
      })
    }
  }

  return (
    <>
      <AnimatePresence>
        {showSuccessAnimation && <PaymentSuccessAnimation onComplete={handleRedirectAfterSuccess} />}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Test Credit Cards</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <span className="inline-block w-16 bg-green-100 text-green-800 text-center rounded-sm mr-2 py-0.5">
                Success
              </span>
              <span className="text-blue-700">4242 4242 4242 4242</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-16 bg-red-100 text-red-800 text-center rounded-sm mr-2 py-0.5">
                Declined
              </span>
              <span className="text-blue-700">4000 0000 0000 0002</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="card-element">Card Details</Label>
            <div className="mt-1 p-3 border rounded-md bg-white">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
