"use client"

import { useState } from "react"
import Link from "next/link"
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
import { SubscriptionStatus } from "@/components/subscription-status"
import { StripeSubscriptionButton } from "@/components/stripe-subscription-button"
import { SubscriptionQRCode } from "@/components/subscription-qr-code"
import { PageContainer } from "@/components/page-container"

export default function SubscriptionPage() {
  const { tier, isActive, isTestMode } = useSubscription()
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr" | "manage">("card")

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
    if (status === "error" && message) {
      setErrorMessage(message)
    }
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

          {/* Test Mode Toggle - Only visible in development */}
          {isTestMode && (
            <motion.div className="mb-6" variants={item}>
              <Card className="border-yellow-200 bg-yellow-50/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">Test Mode Active</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This is a test environment. Use the test panel to simulate subscription states.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Status Messages */}
          {paymentStatus === "success" && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Payment Successful!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your subscription has been activated. Thank you for supporting HeartsHeal!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

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
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
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
              <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle className="text-purple-800">Payment Details</CardTitle>
                  <CardDescription className="text-purple-600">Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  {isTestMode && (
                    <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Test Mode Credit Cards</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <Badge className="bg-green-100 text-green-800 mr-2">Success</Badge>
                          <span className="text-blue-700">4242 4242 4242 4242</span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-red-100 text-red-800 mr-2">Declined</Badge>
                          <span className="text-blue-700">4000 0000 0000 0002</span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-yellow-100 text-yellow-800 mr-2">Auth Required</Badge>
                          <span className="text-blue-700">4000 0025 0000 3155</span>
                        </div>
                        <div className="flex items-center">
                          <Badge className="bg-purple-100 text-purple-800 mr-2">Any Future Date</Badge>
                          <span className="text-blue-700">Exp: 12/34, CVC: Any</span>
                        </div>
                      </div>
                    </div>
                  )}

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
                      {isTestMode ? (
                        <StripeSubscriptionButton
                          buyButtonId="buy_btn_1RJ8gsPVn60sGdDzjgejmFFT"
                          publishableKey="pk_test_51RHmIePVn60sGdDzn67iigTSQqtiExeHG8VIJL7FLOTg23xZkU8JiCDfSDXvoHgOo6PgApefFiXCRkHH3UQwDDsP00mYjI9ZAf"
                        />
                      ) : (
                        <PaymentForm
                          amount={500} // $5.00 in cents
                          isTestMode={isTestMode}
                          onPaymentStatusChange={handlePaymentStatusChange}
                        />
                      )}
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
                            onClick={() => (window.location.href = "/api/subscription/portal")}
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
