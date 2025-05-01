"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSubscription } from "./subscription-context"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  email: string
  name?: string
}

type AuthError = {
  code: string
  message: string
  details?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, redirectTo?: string) => Promise<boolean>
  logout: () => void
  requiresLogin: () => boolean
  setIntendedDestination: (path: string) => void
  getIntendedDestination: () => string | null
  checkPremiumAccess: (path: string) => boolean
  authError: AuthError | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// List of paths that require premium subscription
const PREMIUM_PATHS = ["/premium", "/emotional-log", "/analytics", "/export", "/advanced-features"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const { tier, isActive, updateSubscriptionStatus } = useSubscription()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Clear auth error
  const clearAuthError = () => {
    setAuthError(null)
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for saved user data
        const savedUser = localStorage.getItem("heartsHeal_user")
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }

        // Check for subscription data
        const savedSubscription = localStorage.getItem("heartsHeal_subscription")
        if (savedSubscription) {
          try {
            const subscriptionData = JSON.parse(savedSubscription)
            if (subscriptionData.tier && subscriptionData.isActive !== undefined) {
              updateSubscriptionStatus(subscriptionData.tier, subscriptionData.isActive)
            }
          } catch (subError) {
            console.error("Error parsing subscription data:", subError)
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setAuthError({
          code: "auth/check-failed",
          message: "Failed to check authentication status",
          details: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [updateSubscriptionStatus])

  // Store intended destination when redirecting to login
  useEffect(() => {
    // If we're not on the login page and not authenticated, store current path
    if (pathname !== "/login" && !user && !isLoading) {
      // Only store paths that might require authentication
      if (
        pathname.includes("/premium") ||
        pathname.includes("/profile") ||
        PREMIUM_PATHS.some((path) => pathname.startsWith(path))
      ) {
        try {
          localStorage.setItem("heartsHeal_intendedDestination", pathname)
        } catch (error) {
          console.error("Error saving intended destination:", error)
        }
      }
    }
  }, [pathname, user, isLoading])

  // Check if the current path requires premium access
  const checkPremiumAccess = (path: string): boolean => {
    return PREMIUM_PATHS.some((premiumPath) => path.startsWith(premiumPath))
  }

  // Check if user has premium access
  const hasPremiumAccess = (): boolean => {
    return tier === "premium" && isActive
  }

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string, redirectTo?: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      clearAuthError()

      // Simple validation
      if (!email || !password) {
        setAuthError({
          code: "auth/invalid-credentials",
          message: "Email and password are required",
        })
        return false
      }

      // In a real app, this would be an API call to verify credentials
      // For demo purposes, we'll accept any valid email format with any password
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setAuthError({
          code: "auth/invalid-email",
          message: "Invalid email format",
        })
        return false
      }

      // Create a user object
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0],
      }

      // Save to localStorage
      try {
        localStorage.setItem("heartsHeal_user", JSON.stringify(newUser))
      } catch (error) {
        console.error("Error saving user to localStorage:", error)
        // Continue even if localStorage fails
      }

      // Update state
      setUser(newUser)

      // Check if this login is after payment
      try {
        const paymentInfo = localStorage.getItem("heartsHeal_paymentInfo")
        if (paymentInfo) {
          // If we have payment info, set subscription to premium
          // In a real app, this would be verified with the backend
          try {
            const parsedPaymentInfo = JSON.parse(paymentInfo)

            if (parsedPaymentInfo.status === "completed") {
              updateSubscriptionStatus("premium", true)

              // Set expiry date to 1 month from now
              const expiryDate = new Date()
              expiryDate.setMonth(expiryDate.getMonth() + 1)

              localStorage.setItem(
                "heartsHeal_subscription",
                JSON.stringify({
                  tier: "premium",
                  isActive: true,
                  startDate: new Date().toISOString(),
                  expiryDate: expiryDate.toISOString(),
                  paymentInfo: parsedPaymentInfo,
                }),
              )

              toast({
                title: "Premium Activated",
                description: "Your premium subscription has been activated successfully.",
                variant: "default",
              })
            }
          } catch (parseError) {
            console.error("Error parsing payment info:", parseError)
          }
        }
      } catch (paymentCheckError) {
        console.error("Error checking payment info:", paymentCheckError)
        // Continue even if payment check fails
      }

      // Handle redirect after successful login
      if (redirectTo) {
        // Use explicit redirect if provided
        setTimeout(() => {
          try {
            router.push(redirectTo)
          } catch (redirectError) {
            console.error("Error during explicit redirect:", redirectError)
            // Fallback to window.location if router fails
            window.location.href = redirectTo
          }
        }, 100)
      } else {
        // Check for stored intended destination
        setTimeout(() => {
          try {
            const storedDestination = localStorage.getItem("heartsHeal_intendedDestination")
            if (storedDestination) {
              localStorage.removeItem("heartsHeal_intendedDestination")
              router.push(storedDestination)
            } else {
              // Default redirect to home
              router.push("/")
            }
          } catch (redirectError) {
            console.error("Error during redirect after login:", redirectError)
            // Fallback to home page if redirect fails
            window.location.href = "/"
          }
        }, 100)
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      setAuthError({
        code: "auth/unknown-error",
        message: "An unexpected error occurred during login",
        details: error instanceof Error ? error.message : "Unknown error",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("heartsHeal_user")
      setUser(null)

      // Redirect to home page after logout
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)

      // Fallback to window.location if router fails
      try {
        window.location.href = "/"
      } catch (fallbackError) {
        console.error("Fallback navigation error:", fallbackError)
      }

      toast({
        title: "Logout Error",
        description: "There was an issue during logout, but you've been signed out.",
        variant: "destructive",
      })
    }
  }

  // Function to determine if login is required based on subscription status
  const requiresLogin = () => {
    return tier === "premium" && isActive && !user
  }

  // Helper functions for managing intended destination
  const setIntendedDestinationHelper = (path: string) => {
    try {
      localStorage.setItem("heartsHeal_intendedDestination", path)
      setIntendedDestination(path)
    } catch (error) {
      console.error("Error setting intended destination:", error)
    }
  }

  const getIntendedDestination = () => {
    try {
      const stored = localStorage.getItem("heartsHeal_intendedDestination")
      return stored || intendedDestination
    } catch (error) {
      console.error("Error getting intended destination:", error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        requiresLogin,
        setIntendedDestination: setIntendedDestinationHelper,
        getIntendedDestination,
        checkPremiumAccess,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
