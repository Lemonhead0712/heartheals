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
import { Check, Heart, Loader2, Info, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Initialize Stripe with error handling
const getStripePromise = () => {
  try {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      console.error("Stripe publishable key is missing")
      return null
    }
    return loadStripe(key)
  } catch (error) {
    console.error("Error initializing Stripe:", error)
    return null
  }
}

const stripePromise = getStripePromise()

interface PaymentFormProps {
  amount: number
  onPaymentStatusChange: (status: "idle" | "processing" | "success" | "error", message?: string) => void
}

// Success animation component
const PaymentSuccessAnimation = ({
  onComplete,
  emailSent = true,
  emailDetails = "",
}: {
  onComplete: () => void
  emailSent?: boolean
  emailDetails?: string
}) => {
  const [countdown, setCountdown] = useState(5)

  // Trigger confetti effect
  useEffect(() => {
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      try {
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
      } catch (error) {
        console.error("Error with confetti animation:", error)
      }
    }

    try {
      frame()
    } catch (error) {
      console.error("Failed to start confetti animation:", error)
    }

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

        {!emailSent && (
          <motion.div
            className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-amber-800 text-sm font-medium">Confirmation email not sent</p>
              <p className="text-amber-700 text-xs mt-1">
                {emailDetails || "We couldn't send a confirmation email, but your subscription is active."}
              </p>
            </div>
          </motion.div>
        )}

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
  const [stripeError, setStripeError] = useState<string | null>(null)

  if (!stripePromise) {
    return (
      <div className="p-6 border border-red-200 rounded-md bg-red-50">
        <h3 className="text-lg font-medium text-red-800 mb-2">Payment System Error</h3>
        <p className="text-red-600 mb-4">
          The payment system could not be initialized. Please try again later or contact support.
        </p>
      </div>
    )
  }

  return (
    <>
      {stripeError && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
          <AlertDescription className="text-red-800">{stripeError}</AlertDescription>
        </Alert>
      )}
      <Elements stripe={stripePromise}>
        <PaymentFormContent
          amount={amount}
          onPaymentStatusChange={onPaymentStatusChange}
          onStripeError={setStripeError}
        />
      </Elements>
    </>
  )
}

// Payment form content
function PaymentFormContent({
  amount,
  onPaymentStatusChange,
  onStripeError,
}: PaymentFormProps & { onStripeError: (error: string | null) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [cardError, setCardError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const { setTier, setIsActive, setExpiresAt } = useSubscription()
  const { user, isAuthenticated } = useAuth()
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [emailSent, setEmailSent] = useState(true)
  const [emailDetails, setEmailDetails] = useState("")
  const [formValidated, setFormValidated] = useState(false)

  // Validate form inputs
  useEffect(() => {
    const isValid = email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && name.trim() !== ""

    setFormValidated(isValid)
  }, [email, name])

  // Check Stripe initialization
  useEffect(() => {
    if (!stripe) {
      onStripeError("Payment system is initializing. Please wait...")
    } else {
      onStripeError(null)
    }
  }, [stripe, onStripeError])

  // Handle card element changes
  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : "")
  }

  const validateInputs = () => {
    // Email validation
    if (!email) {
      setError("Email is required")
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    // Name validation
    if (!name) {
      setError("Name is required")
      return false
    }

    // Card validation is handled by Stripe
    if (cardError) {
      setError(cardError)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!stripe || !elements) {
      setError("Payment system is not available. Please try again later.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found. Please refresh the page and try again.")
      return
    }

    // Validate inputs
    if (!validateInputs()) {
      return
    }

    setProcessing(true)
    onPaymentStatusChange("processing")

    try {
      // Store payment information for account creation
      localStorage.setItem(
        "heartsHeal_paymentInfo",
        JSON.stringify({
          email,
          name,
          amount,
          timestamp: new Date().toISOString(),
          status: "processing",
        }),
      )

      // For demo purposes, we'll simulate a successful payment without actually charging
      // In a real app, you would create a payment intent on the server and confirm it here

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate successful payment
      setSucceeded(true)
      setProcessing(false)
      onPaymentStatusChange("success")

      // Update payment info status
      localStorage.setItem(
        "heartsHeal_paymentInfo",
        JSON.stringify({
          email,
          name,
          amount,
          timestamp: new Date().toISOString(),
          status: "completed",
        }),
      )

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
            amount: `$${(amount / 100).toFixed(2)}`,
          }),
        })

        if (!response.ok) {
          throw new Error(`Email API responded with status: ${response.status}`)
        }

        const emailResult = await response.json()

        // Check if email was sent successfully
        if (!emailResult.success || emailResult.emailSent === false) {
          console.warn("Email sending issue:", emailResult.warning || "Unknown email issue")
          setEmailSent(false)
          setEmailDetails(emailResult.details || emailResult.warning || "Email delivery failed")
        } else if (emailResult.devMode) {
          // Handle development mode
          console.log("Email logged in development mode:", emailResult.message)
          setEmailSent(true)
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
        setEmailSent(false)
        setEmailDetails(emailError instanceof Error ? emailError.message : "Error connecting to email service")
        // Don't fail the whole process if just the email fails
      }

      // Show success animation
      setShowSuccessAnimation(true)
    } catch (err) {
      console.error("Payment error:", err)

      // Update payment info status to failed
      localStorage.setItem(
        "heartsHeal_paymentInfo",
        JSON.stringify({
          email,
          name,
          amount,
          timestamp: new Date().toISOString(),
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown payment error",
        }),
      )

      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setProcessing(false)
      onPaymentStatusChange("error", errorMessage)

      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleRedirectAfterSuccess = () => {
    try {
      // If user is not logged in, redirect to account creation page
      if (!isAuthenticated) {
        router.push(`/create-account?email=${encodeURIComponent(email)}&source=payment`)
      } else {
        // Otherwise redirect to home page
        router.push("/")

        toast({
          title: "Welcome to Premium!",
          description: "Your subscription has been activated successfully.",
          variant: "default",
        })
      }
    } catch (redirectError) {
      console.error("Error during redirect after payment:", redirectError)

      // Fallback to manual navigation if router fails
      if (!isAuthenticated) {
        window.location.href = `/create-account?email=${encodeURIComponent(email)}&source=payment`
      } else {
        window.location.href = "/"
      }
    }
  }

  return (
    <>
      <AnimatePresence>
        {showSuccessAnimation && (
          <PaymentSuccessAnimation
            onComplete={handleRedirectAfterSuccess}
            emailSent={emailSent}
            emailDetails={emailDetails}
          />
        )}
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

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

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
              aria-invalid={error && !name ? "true" : "false"}
            />
            {error && !name && <p className="text-sm text-red-600 mt-1">Name is required</p>}
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
              aria-invalid={error && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? "true" : "false"}
            />
            {error && !email && <p className="text-sm text-red-600 mt-1">Email is required</p>}
            {error && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
              <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
            )}
          </div>

          <div>
            <Label htmlFor="card-element">Card Details</Label>
            <div className={`mt-1 p-3 border rounded-md bg-white ${cardError ? "border-red-300" : "border-gray-300"}`}>
              <CardElement
                id="card-element"
                onChange={handleCardChange}
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
            {cardError && <p className="text-sm text-red-600 mt-1">{cardError}</p>}
          </div>

          <Button
            type="submit"
            disabled={!stripe || processing || !formValidated}
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

        <div className="text-xs text-gray-500 mt-4">
          By proceeding with this payment, you agree to our{" "}
          <a href="/terms" className="text-purple-600 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-purple-600 hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </form>
    </>
  )
}
