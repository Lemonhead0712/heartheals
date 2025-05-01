"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, Check, Shield, CreditCard, Calendar, Info, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { BottomNav } from "@/components/bottom-nav"
import { PaymentForm } from "@/components/payment-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { SubscriptionStatus } from "@/components/subscription-status"
import { SubscriptionQRCode } from "@/components/subscription-qr-code"
import { PageContainer } from "@/components/page-container"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
  const { tier, isActive, setTier, setIsActive } = useSubscription()
  const { user } = useAuth()
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | "manage">("card")
  const [redirectDestination, setRedirectDestination] = useState<string | null>(null)
  const paymentSectionRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [isLoaded, setIsLoaded] = useState(false)
  const [stripeConfigValid, setStripeConfigValid] = useState(true)
  const router = useRouter()

  // Check if Stripe is properly initialized
  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        const response = await fetch("/api/subscription/validate-config")
        const data = await response.json()

        // Check if the response indicates success
        if (response.ok && data.status === "ok") {
          setStripeConfigValid(true)
        } else {
          console.error("Stripe configuration issue:", data.message)
          setStripeConfigValid(false)
          toast({
            title: "Payment System Notice",
            description: data.message || "Payment system configuration issue detected.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error checking Stripe configuration:", error)
        setStripeConfigValid(false)
        toast({
          title: "Payment System Error",
          description: "Unable to validate payment system configuration.",
          variant: "destructive",
        })
      } finally {
        setIsLoaded(true)
      }
    }

    checkStripeConfig()
  }, [toast])

  // Check for post-subscription redirect
  useEffect(() => {
    const storedRedirect = localStorage.getItem("heartsHeal_postSubscriptionRedirect")
    if (storedRedirect) {
      setRedirectDestination(storedRedirect)
    }
  }, [])

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

  const handlePaymentStatusChange = (status: "idle" | "processing" | "success" | "error", message?: string) => {
    setPaymentStatus(status)

    if (status === "success") {
      // Update subscription status
      setTier("premium")
      setIsActive(true)

      // Show success message
      toast({
        title: "Payment Successful",
        description: "Your payment was processed successfully. Creating your account...",
        variant: "default",
      })

      // If user is not logged in, redirect to account creation
      if (!user) {
        // Short delay to allow toast to be seen
        setTimeout(() => {
          router.push("/create-account?source=payment")
        }, 1500)
      } else {
        // User is already logged in, handle redirect after successful subscription
        setTimeout(() => {
          if (redirectDestination) {
            localStorage.removeItem("heartsHeal_postSubscriptionRedirect")
            router.push(redirectDestination)
          } else {
            router.push("/")
          }
        }, 1500)
      }
    }

    if (status === "error" && message) {
      setErrorMessage(message)
      toast({
        title: "Payment Error",
        description: message || "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Loading state
  if (!isLoaded) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
            <p className="text-purple-700">Loading subscription options...</p>
          </div>
        </div>
      </PageContainer>
    )
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

          <motion.div className="mb-8 flex justify-between items-center" variants={item}>
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-purple-800 mt-4 mb-2">HeartsHeal Premium</h1>
              <p className="text-purple-600">Unlock advanced features to support your emotional wellness journey</p>
            </div>
            <div>
              <SubscriptionStatus />
            </div>
          </motion.div>

          {/* Redirect Notice */}
          {redirectDestination && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Premium Access Required</AlertTitle>
                <AlertDescription className="text-blue-700">
                  The page you were trying to access requires a premium subscription. After subscribing, you'll be
                  automatically redirected to your destination.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Stripe Configuration Warning */}
          {!stripeConfigValid && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Payment System Notice</AlertTitle>
                <AlertDescription className="text-amber-700">
                  The payment system is currently in test mode. You can try the subscription flow, but no actual charges
                  will be made.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Payment Status Messages */}
          {paymentStatus === "error" && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <Info className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Payment Failed</AlertTitle>
                <AlertDescription className="text-red-700">
                  {errorMessage || "There was an issue processing your payment. Please try again."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Not Logged In Warning */}
          {!user && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Account Required</AlertTitle>
                <AlertDescription className="text-amber-700 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span>Please log in or create an account to manage your subscription.</span>
                  <Link href="/login" className="text-amber-800 font-medium hover:underline">
                    <Button variant="outline" size="sm" className="border-amber-300 bg-amber-100/50">
                      Log In
                    </Button>
                  </Link>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Subscription Tiers */}
          <motion.div className="mb-8" variants={item}>
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free Tier */}
              <Card
                className={`border-purple-200 bg-white/90 backdrop-blur-sm shadow-md ${tier === "free" && isActive ? "ring-2 ring-purple-400" : ""}`}
              >
                <CardHeader>
                  <CardTitle className="text-purple-800">Free Tier</CardTitle>
                  <CardDescription className="text-purple-600">Basic access to wellness tools</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-purple-800">$0</span>
                    <span className="text-purple-600 ml-1">/ forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">3 emotional log entries</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">3 breathing exercises</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">3 journal entries</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">1 reflective quiz</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">No analytics features</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">No data export</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    disabled={tier === "free" && isActive}
                    onClick={() => {
                      // If there was a redirect destination, clear it
                      if (redirectDestination) {
                        localStorage.removeItem("heartsHeal_postSubscriptionRedirect")
                      }
                      window.location.href = "/"
                    }}
                  >
                    {tier === "free" && isActive ? "Current Plan" : "Continue with Free"}
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Tier */}
              <Card
                className={`border-purple-200 bg-white/90 backdrop-blur-sm shadow-md ${tier === "premium" && isActive ? "ring-2 ring-purple-400" : ""}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-purple-800">Premium</CardTitle>
                      <CardDescription className="text-purple-600">
                        Enhanced features for your wellness journey
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Recommended</Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-purple-800">$5</span>
                    <span className="text-purple-600 ml-1">/ month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">
                        <strong>Unlimited</strong> emotional log entries
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">
                        <strong>Unlimited</strong> breathing exercises
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">
                        <strong>Unlimited</strong> journal entries
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">
                        <strong>Unlimited</strong> reflective quizzes
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">Advanced emotion tracking analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-purple-700">Data export capabilities</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  {tier === "premium" && isActive ? (
                    <Button
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        paymentSectionRef.current?.scrollIntoView({ behavior: "smooth" })
                        setPaymentMethod("card")
                      }}
                    >
                      {tier === "premium" && !isActive ? "Reactivate Subscription" : "Upgrade to Premium"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </motion.div>

          {/* Payment Form - Only show if not already premium active */}
          {!(tier === "premium" && isActive) && (
            <motion.div variants={item}>
              <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md" ref={paymentSectionRef}>
                <CardHeader>
                  <CardTitle className="text-purple-800">Payment Details</CardTitle>
                  <CardDescription className="text-purple-600">Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="card"
                    className="w-full"
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "card" | "qr" | "manage")}
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="card" className="text-purple-700 data-[state=active]:bg-purple-100">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit Card
                      </TabsTrigger>
                      <TabsTrigger value="qr" className="text-purple-700 data-[state=active]:bg-purple-100">
                        <svg
                          className="h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 3H9V9H3V3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 3H21V9H15V3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3 15H9V21H3V15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M15 15H21V21H15V15Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        QR Code
                      </TabsTrigger>
                      <TabsTrigger value="manage" className="text-purple-700 data-[state=active]:bg-purple-100">
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="card">
                      <ErrorBoundary>
                        <PaymentForm
                          amount={500} // $5.00 in cents
                          onPaymentStatusChange={handlePaymentStatusChange}
                        />
                      </ErrorBoundary>
                    </TabsContent>

                    <TabsContent value="qr">
                      <SubscriptionQRCode
                        imageUrl="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HgUOiZK4dEWl1cIWAmS9THCj3G7JpZ.png"
                        title="Scan to Subscribe"
                        description="Scan this QR code with your phone camera to subscribe to HeartsHeal Premium"
                      />
                    </TabsContent>

                    <TabsContent value="manage">
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-md">
                          <h3 className="font-medium text-gray-800 mb-2">Current Subscription</h3>
                          <p className="text-gray-600 mb-4">
                            Manage your existing subscription or view payment history.
                          </p>
                          <Button
                            variant="outline"
                            className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => {
                              try {
                                window.location.href = "/api/subscription/portal"
                              } catch (error) {
                                console.error("Error navigating to subscription portal:", error)
                                toast({
                                  title: "Navigation Error",
                                  description: "Could not access subscription portal. Please try again later.",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            Manage Subscription
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          You'll be redirected to a secure customer portal where you can manage your subscription,
                          update payment methods, or view your billing history.
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Shield className="h-4 w-4 mr-2 text-gray-400" />
                    Your payment information is secure and encrypted
                  </div>
                  <div className="text-xs text-gray-500">
                    By subscribing, you agree to our{" "}
                    <Link href="/terms" className="text-purple-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-purple-600 hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </motion.div>

        <BottomNav />
      </div>
    </PageContainer>
  )
}

// Error boundary component to catch and display errors
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error)
      setHasError(true)
      setError(error.error || new Error("Unknown error occurred"))
      return true
    }

    window.addEventListener("error", errorHandler)
    return () => window.removeEventListener("error", errorHandler)
  }, [])

  if (hasError) {
    return (
      <div className="p-6 border border-red-200 rounded-md bg-red-50">
        <h3 className="text-lg font-medium text-red-800 mb-2">Payment System Error</h3>
        <p className="text-red-600 mb-4">
          {error?.message || "There was an issue loading the payment system. Please try again later."}
        </p>
        <Button
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-100"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
