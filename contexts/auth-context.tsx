"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getActivationStatus, markAccountCreated } from "@/lib/activation-utils"

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
  authError: AuthError | null
  clearAuthError: () => void
}

// Create a default context with safe fallbacks
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  requiresLogin: () => false,
  setIntendedDestination: () => {},
  getIntendedDestination: () => null,
  authError: null,
  clearAuthError: () => {},
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

// List of paths that require authentication
const AUTH_REQUIRED_PATHS = ["/profile", "/settings"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null)
  const [authError, setAuthError] = useState<AuthError | null>(null)
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
  }, [])

  // Store intended destination when redirecting to login
  useEffect(() => {
    // If we're not on the login page and not authenticated, store current path
    if (pathname !== "/login" && !user && !isLoading) {
      // Only store paths that might require authentication
      if (AUTH_REQUIRED_PATHS.some((path) => pathname.startsWith(path))) {
        try {
          localStorage.setItem("heartsHeal_intendedDestination", pathname)
        } catch (error) {
          console.error("Error saving intended destination:", error)
        }
      }
    }
  }, [pathname, user, isLoading])

  // Helper function to handle navigation with fallback
  const safeNavigate = (path: string) => {
    try {
      router.push(path)
    } catch (error) {
      console.error(`Navigation error to ${path}:`, error)
      // Fallback to window.location if router fails
      try {
        window.location.href = path
      } catch (fallbackError) {
        console.error(`Fallback navigation error to ${path}:`, fallbackError)
      }
    }
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

      // Check if this completes an activation flow
      const activationStatus = getActivationStatus()
      if (activationStatus.paymentComplete && !activationStatus.accountCreated) {
        // Mark account creation as complete
        markAccountCreated()

        // If both steps are now complete, redirect to activation success
        const updatedStatus = getActivationStatus()
        if (updatedStatus.paymentComplete && updatedStatus.accountCreated) {
          // Both payment and account creation are complete
          // Redirect to activation success page
          setTimeout(() => {
            safeNavigate("/activation-success")
          }, 100)
          return true
        }
      }

      // Handle redirect after successful login
      setTimeout(() => {
        // Always redirect to home page by default
        const homePath = "/"

        // Only use explicit redirect if provided and it's not the login page
        if (redirectTo && redirectTo !== "/login") {
          safeNavigate(redirectTo)
        } else {
          // Default redirect to home
          safeNavigate(homePath)
        }
      }, 100)

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

  // Function to determine if login is required
  const requiresLogin = () => {
    return AUTH_REQUIRED_PATHS.some((path) => pathname.startsWith(path)) && !user
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
    console.error("useAuth must be used within an AuthProvider")
    return defaultAuthContext
  }
  return context
}
