"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import Link from "next/link"
import { PageContainer } from "@/components/page-container"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useHapticContext } from "@/contexts/haptic-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [isFromPayment, setIsFromPayment] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const { authError } = auth
  // Safely access clearAuthError, providing a fallback if it doesn't exist
  const clearAuthError =
    typeof auth.clearAuthError === "function" ? auth.clearAuthError : () => console.log("clearAuthError not available")
  const { toast } = useToast()
  const hapticContext = useHapticContext() // Initialize the hook outside the try block

  // Get parameters from URL
  useEffect(() => {
    try {
      const emailParam = searchParams.get("email")
      const sourceParam = searchParams.get("source")
      const redirectParam = searchParams.get("redirect")

      if (emailParam) {
        setEmail(emailParam)
      }

      if (sourceParam === "payment") {
        setIsFromPayment(true)
      }

      if (redirectParam) {
        setRedirectPath(redirectParam)
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error)
    }
  }, [searchParams])

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      // Safely call clearAuthError
      if (typeof clearAuthError === "function") {
        clearAuthError()
      }
    }
  }, [clearAuthError])

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

  const validateForm = (): boolean => {
    const errors: {
      email?: string
      password?: string
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
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Safely call clearAuthError
    if (typeof clearAuthError === "function") {
      clearAuthError()
    }

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Attempt login
      const success = await auth.login(email, password, redirectPath || undefined)

      if (success) {
        // Set redirecting state to show loading indicator
        setIsRedirecting(true)

        // Safely trigger haptic feedback if available
        try {
          if (hapticContext && typeof hapticContext.haptic === "function") {
            hapticContext.haptic("medium")
          }
        } catch (hapticError) {
          // Silently handle haptic errors to prevent login flow disruption
          console.warn("Haptic feedback error:", hapticError)
        }

        toast({
          title: "Login Successful",
          description: "Welcome back to HeartHeals! Redirecting to home page...",
          variant: "default",
        })
      } else {
        // Login failed but no error was thrown
        if (!authError) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      // Keep isSubmitting true if we're redirecting to show loading state
      if (!isRedirecting) {
        setIsSubmitting(false)
      }
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
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center text-purple-800">Welcome Back</CardTitle>
                <CardDescription className="text-center text-purple-600">
                  Log in to continue your wellness journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {authError && (
                  <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <AlertDescription>{authError.message}</AlertDescription>
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
                        disabled={!!searchParams.get("email") || isSubmitting}
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
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-purple-700 font-medium">
                        Password
                      </Label>
                      <Link href="/forgot-password" className="text-xs text-purple-600 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
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
                        disabled={isSubmitting}
                        aria-invalid={fieldErrors.password ? "true" : "false"}
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-600 focus:outline-none"
                        aria-label={passwordVisible ? "Hide password" : "Show password"}
                        tabIndex={0}
                        disabled={isSubmitting}
                      >
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <div className="flex items-center text-sm text-red-600 mt-1">
                        <X size={14} className="mr-1 flex-shrink-0" />
                        <span>{fieldErrors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 transition-all duration-200 h-11"
                      disabled={isSubmitting || Object.values(fieldErrors).some(Boolean)}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isRedirecting ? "Redirecting..." : "Logging in..."}
                        </span>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-0">
                <div className="text-sm text-center text-gray-500">
                  Don't have an account?{" "}
                  <Link
                    href={`/create-account${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="w-full pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => router.push("/")}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div className="mt-6 text-center text-sm text-gray-500" variants={item}>
            By logging in, you agree to our{" "}
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
