"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/page-container"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/contexts/subscription-context"

// Password validation rules
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/

export default function CreateAccountPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFromPayment, setIsFromPayment] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { login } = useAuth()
  const { toast } = useToast()
  const { updateSubscriptionStatus } = useSubscription()

  // Get email from query parameter and check if coming from payment
  useEffect(() => {
    try {
      const emailParam = searchParams.get("email")
      const sourceParam = searchParams.get("source")

      if (emailParam) {
        setEmail(emailParam)
      }

      if (sourceParam === "payment") {
        setIsFromPayment(true)

        // Get payment info from localStorage
        const storedPaymentInfo = localStorage.getItem("heartsHeal_paymentInfo")
        if (storedPaymentInfo) {
          try {
            const parsedInfo = JSON.parse(storedPaymentInfo)
            setPaymentInfo(parsedInfo)

            // If email wasn't in URL params but is in payment info, use it
            if (!emailParam && parsedInfo.email) {
              setEmail(parsedInfo.email)
            }
          } catch (parseError) {
            console.error("Error parsing payment info:", parseError)
          }
        }

        toast({
          title: "Payment Successful",
          description: "Please create your account to access premium features",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error)
    }
  }, [searchParams, toast])

  const validateForm = (): boolean => {
    const errors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}

    // Email validation
    if (!email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password = "Password must include uppercase, lowercase, number and special character"
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create user account with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user?.identities?.length === 0) {
        throw new Error("This email is already registered. Please log in instead.")
      }

      // Show success message
      setSuccess(true)

      // If from payment, update subscription status
      if (isFromPayment) {
        updateSubscriptionStatus("premium", true)
      }

      // Automatically log the user in
      try {
        const loginSuccess = await login(email, password)

        if (loginSuccess) {
          toast({
            title: "Account Created",
            description: "Your account has been created and you've been logged in automatically.",
            variant: "default",
          })

          // Clear payment info from localStorage
          localStorage.removeItem("heartsHeal_paymentInfo")

          // Set redirecting state
          setIsRedirecting(true)

          // Redirect based on source
          if (isFromPayment) {
            // Check for stored redirect destination
            const redirectDestination = localStorage.getItem("heartsHeal_postSubscriptionRedirect")
            if (redirectDestination) {
              localStorage.removeItem("heartsHeal_postSubscriptionRedirect")
              router.push(redirectDestination)
            } else {
              // Default to dashboard
              router.push("/")
            }
          } else {
            // Regular account creation flow
            router.push("/")
          }
        } else {
          // If auto-login fails, show message and redirect to login page
          toast({
            title: "Account Created",
            description: "Your account has been created. Please log in to continue.",
            variant: "default",
          })

          setTimeout(() => {
            setIsRedirecting(true)
            router.push("/login")
          }, 2000)
        }
      } catch (loginError) {
        console.error("Auto-login error:", loginError)

        // If auto-login fails, redirect to login page
        toast({
          title: "Account Created",
          description: "Your account has been created, but we couldn't log you in automatically. Please log in.",
          variant: "default",
        })

        setTimeout(() => {
          setIsRedirecting(true)
          router.push("/login")
        }, 2000)
      }
    } catch (err: any) {
      console.error("Account creation error:", err)

      // Handle specific Supabase errors
      if (err.message?.includes("already registered")) {
        setError("This email is already registered. Please log in instead.")
      } else {
        setError(err.message || "Failed to create account. Please try again.")
      }

      setIsSubmitting(false)
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] flex flex-col items-center justify-center p-4">
        <motion.div className="w-full max-w-md" initial="hidden" animate="show" variants={container}>
          <motion.div className="flex justify-center mb-6" variants={item}>
            <Logo size="large" animate={true} />
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-purple-800">Create Your Account</CardTitle>
                <CardDescription className="text-center text-purple-600">
                  {isFromPayment
                    ? "Complete your account setup to access your premium features"
                    : "Join HeartHeals to start your wellness journey"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <AlertDescription>
                      {isRedirecting ? "Redirecting you..." : "Account created successfully! Logging you in..."}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-purple-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 ${
                        fieldErrors.email ? "border-red-300" : ""
                      }`}
                      disabled={!!searchParams.get("email") || isSubmitting || success}
                      aria-invalid={fieldErrors.email ? "true" : "false"}
                    />
                    {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-purple-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 ${
                          fieldErrors.password ? "border-red-300" : ""
                        } pr-10`}
                        disabled={isSubmitting || success}
                        aria-invalid={fieldErrors.password ? "true" : "false"}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-600 focus:outline-none"
                        aria-label={passwordVisible ? "Hide password" : "Show password"}
                        tabIndex={0}
                        disabled={isSubmitting || success}
                      >
                        {passwordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters and include uppercase, lowercase, number and special
                      character.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-purple-700">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={confirmPasswordVisible ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 ${
                          fieldErrors.confirmPassword ? "border-red-300" : ""
                        } pr-10`}
                        disabled={isSubmitting || success}
                        aria-invalid={fieldErrors.confirmPassword ? "true" : "false"}
                      />
                      <button
                        type="button"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-600 focus:outline-none"
                        aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                        tabIndex={0}
                        disabled={isSubmitting || success}
                      >
                        {confirmPasswordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting || success}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-600 hover:underline">
                    Sign in
                  </Link>
                </div>
                <div className="w-full pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => router.push("/")}
                    disabled={isSubmitting || success}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div className="mt-6 text-center text-sm text-gray-500" variants={item}>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
