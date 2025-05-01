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
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { PageContainer } from "@/components/page-container"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null)
  const router = useRouter()
  const { login, getIntendedDestination } = useAuth()
  const searchParams = useSearchParams()

  // Check for redirect parameter in URL or stored intended destination
  useEffect(() => {
    const redirectParam = searchParams.get("redirect")
    if (redirectParam) {
      setRedirectTarget(redirectParam)
    } else {
      const intended = getIntendedDestination()
      if (intended) {
        setRedirectTarget(intended)
      }
    }
  }, [searchParams, getIntendedDestination])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = await login(email, password, redirectTarget || undefined)
      if (!success) {
        setError("Invalid email or password. Please try again.")
      }
      // No need to handle redirect here as it's now managed in the auth context
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
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
                <CardTitle className="text-2xl font-bold text-center text-purple-800">Welcome Back</CardTitle>
                <CardDescription className="text-center text-purple-600">
                  Sign in to access your premium features
                  {redirectTarget && <span className="block mt-1 text-xs">You'll be redirected after login</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
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
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-purple-700">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center text-purple-600">
                  <Link href="/forgot-password" className="hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-sm text-center text-gray-500">
                  Don't have an account?{" "}
                  <Link href="/subscription" className="text-purple-600 hover:underline">
                    Subscribe to Premium
                  </Link>
                </div>
                <div className="w-full pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={() => router.push("/")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue as Guest
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div className="mt-6 text-center text-sm text-gray-500" variants={item}>
            By signing in, you agree to our{" "}
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
