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
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/page-container"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useSubscription } from "@/contexts/subscription-context"
import { Progress } from "@/components/ui/progress"
import {
  getActivationStatus,
  markAccountCreated,
  checkExistingPayment,
  getStoredPaymentDetails,
} from "@/lib/activation-utils"
import { ActivationSuccess } from "@/components/activation-success"

// Password validation rules
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
const HAS_LOWERCASE = /[a-z]/
const HAS_UPPERCASE = /[A-Z]/
const HAS_NUMBER = /\d/
const HAS_SPECIAL = /[@$!%*?&]/

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
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const [activationComplete, setActivationComplete] = useState(false)
  const [activationDetails, setActivationDetails] = useState<any>(null)
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

  // Validate email in real-time
  useEffect(() => {
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }))
      } else {
        setFieldErrors((prev) => ({ ...prev, email: undefined }))
      }
    }
  }, [email])

  // Validate password in real-time and calculate strength
  useEffect(() => {
    if (password) {
      const criteria = {
        length: password.length >= PASSWORD_MIN_LENGTH,
        lowercase: HAS_LOWERCASE.test(password),
        uppercase: HAS_UPPERCASE.test(password),
        number: HAS_NUMBER.test(password),
        special: HAS_SPECIAL.test(password),
      }

      setPasswordCriteria(criteria)

      // Calculate password strength (0-100)
      const criteriaCount = Object.values(criteria).filter(Boolean).length
      setPasswordStrength(criteriaCount * 20)

      if (!PASSWORD_REGEX.test(password)) {
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password must include uppercase, lowercase, number and special character",
        }))
      } else {
        setFieldErrors((prev) => ({ ...prev, password: undefined }))
      }
    } else {
      setPasswordStrength(0)
    }

    // Check if confirm password matches
    if (confirmPassword && password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
    } else if (confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
  }, [password, confirmPassword])

  useEffect(() => {
    // Check activation status
    const activationStatus = getActivationStatus()

    // If payment is complete but account not yet created, we'll handle that in form submission
    if (activationStatus.paymentComplete && activationStatus.accountCreated && activationStatus.activationComplete) {
      // Both payment and account creation are complete
      setActivationComplete(true)
      setActivationDetails(activationStatus.paymentDetails || {})
    }

    // Check for existing payment even if activation status doesn't show it
    if (!activationStatus.paymentComplete && checkExistingPayment()) {
      const paymentDetails = getStoredPaymentDetails()
      if (paymentDetails) {
        setPaymentInfo(paymentDetails)
        setIsFromPayment(true)
      }
    }
  }, [])

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

        // Mark account creation as complete in activation flow
        markAccountCreated()

        // Check if both payment and account creation are now complete
        const updatedStatus = getActivationStatus()
        if (updatedStatus.paymentComplete && updatedStatus.accountCreated) {
          // Both steps are complete, show activation success
          setActivationComplete(true)
          setActivationDetails(updatedStatus.paymentDetails || {})
        }
      }

      // Automatically log the user in
      try {
        const loginSuccess = await login(email, password)

        if (loginSuccess) {
          // Only show toast if not showing activation success
          if (!activationComplete) {
            toast({
              title: "Account Created",
              description: "Your account has been created and you've been logged in automatically.",
              variant: "default",
            })
          }

          // Clear payment info from localStorage
          localStorage.removeItem("heartsHeal_paymentInfo")

          // Set redirecting state
          setIsRedirecting(true)

          // Only redirect if not showing activation success
          if (!activationComplete) {
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

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
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

  if (activationComplete) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] flex flex-col items-center justify-center p-4">
          <motion.div className="w-full max-w-md" initial="hidden" animate="show" variants={container}>
            <motion.div className="flex justify-center mb-6" variants={item}>
              <Logo size="large" animate={true} />
            </motion.div>

            <motion.div variants={item}>
              <ActivationSuccess userName={email.split("@")[0]} redirectPath="/" />
            </motion.div>
          </motion.div>
        </div>
      </PageContainer>
    )
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
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center text-purple-800">Create Your Account</CardTitle>
                <CardDescription className="text-center text-purple-600">
                  {isFromPayment
                    ? "Complete your account setup to access your premium features"
                    : "Join HeartHeals to start your wellness journey"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
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

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-purple-700 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`border-purple-200 focus:border-purple-400 focus:ring-purple-400 ${
                          fieldErrors.email ? "border-red-300" : email ? "border-green-300" : ""
                        }`}
                        disabled={!!searchParams.get("email") || isSubmitting || success}
                        aria-invalid={fieldErrors.email ? "true" : "false"}
                        placeholder="your.email@example.com"
                      />
                      {email && !fieldErrors.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          <Check size={18} />
                        </div>
                      )}
                    </div>
                    {fieldErrors.email && (
                      <div className="flex items-center text-sm text-red-600 mt-1">
                        <X size={14} className="mr-1 flex-shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-purple-700 font-medium">
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
                          fieldErrors.password
                            ? "border-red-300"
                            : password && !fieldErrors.password
                              ? "border-green-300"
                              : ""
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
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Password strength</span>
                          <span
                            className={`font-medium ${
                              passwordStrength < 40
                                ? "text-red-500"
                                : passwordStrength < 80
                                  ? "text-yellow-500"
                                  : "text-green-500"
                            }`}
                          >
                            {passwordStrength < 40 ? "Weak" : passwordStrength < 80 ? "Medium" : "Strong"}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-1.5" indicatorClassName={getStrengthColor()} />

                        <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                          <div
                            className={`flex items-center ${passwordCriteria.length ? "text-green-600" : "text-gray-500"}`}
                          >
                            {passwordCriteria.length ? (
                              <Check size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            <span>At least 6 characters</span>
                          </div>
                          <div
                            className={`flex items-center ${passwordCriteria.lowercase ? "text-green-600" : "text-gray-500"}`}
                          >
                            {passwordCriteria.lowercase ? (
                              <Check size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            <span>Lowercase letter</span>
                          </div>
                          <div
                            className={`flex items-center ${passwordCriteria.uppercase ? "text-green-600" : "text-gray-500"}`}
                          >
                            {passwordCriteria.uppercase ? (
                              <Check size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            <span>Uppercase letter</span>
                          </div>
                          <div
                            className={`flex items-center ${passwordCriteria.number ? "text-green-600" : "text-gray-500"}`}
                          >
                            {passwordCriteria.number ? (
                              <Check size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            <span>Number</span>
                          </div>
                          <div
                            className={`flex items-center ${passwordCriteria.special ? "text-green-600" : "text-gray-500"}`}
                          >
                            {passwordCriteria.special ? (
                              <Check size={12} className="mr-1" />
                            ) : (
                              <X size={12} className="mr-1" />
                            )}
                            <span>Special character</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {fieldErrors.password && (
                      <div className="flex items-center text-sm text-red-600 mt-1">
                        <X size={14} className="mr-1 flex-shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-purple-700 font-medium">
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
                          fieldErrors.confirmPassword
                            ? "border-red-300"
                            : confirmPassword && !fieldErrors.confirmPassword
                              ? "border-green-300"
                              : ""
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
                        {confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>

                      {confirmPassword && !fieldErrors.confirmPassword && (
                        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500">
                          <Check size={18} />
                        </div>
                      )}
                    </div>
                    {fieldErrors.confirmPassword && (
                      <div className="flex items-center text-sm text-red-600 mt-1">
                        <X size={14} className="mr-1 flex-shrink-0" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 h-11"
                      disabled={isSubmitting || success || Object.values(fieldErrors).some(Boolean)}
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
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-0">
                <div className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-600 hover:underline font-medium">
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
