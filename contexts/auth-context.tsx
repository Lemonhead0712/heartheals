"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSubscription } from "./subscription-context"

type User = {
  id: string
  email: string
  name?: string
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [intendedDestination, setIntendedDestination] = useState<string | null>(null)
  const { tier, isActive } = useSubscription()
  const router = useRouter()
  const pathname = usePathname()

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
      if (pathname.includes("/premium") || pathname.includes("/profile")) {
        localStorage.setItem("heartsHeal_intendedDestination", pathname)
      }
    }
  }, [pathname, user, isLoading])

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string, redirectTo?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Simple validation
      if (!email || !password) {
        return false
      }

      // In a real app, this would be an API call to verify credentials
      // For demo purposes, we'll accept any valid email format with any password
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false
      }

      // Create a user object
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0],
      }

      // Save to localStorage
      localStorage.setItem("heartsHeal_user", JSON.stringify(newUser))

      // Update state
      setUser(newUser)

      // Handle redirect after successful login
      setTimeout(() => {
        // Check for explicit redirect destination first
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          // Check for stored intended destination
          const storedDestination = localStorage.getItem("heartsHeal_intendedDestination")
          if (storedDestination) {
            localStorage.removeItem("heartsHeal_intendedDestination")
            router.push(storedDestination)
          } else {
            // Default redirect to home
            router.push("/")
          }
        }
      }, 100) // Small timeout to ensure state updates before redirect

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("heartsHeal_user")
    setUser(null)
    // Redirect to home page after logout
    router.push("/")
  }

  // Function to determine if login is required based on subscription status
  const requiresLogin = () => {
    return tier === "premium" && isActive && !user
  }

  // Helper functions for managing intended destination
  const setIntendedDestinationHelper = (path: string) => {
    localStorage.setItem("heartsHeal_intendedDestination", path)
    setIntendedDestination(path)
  }

  const getIntendedDestination = () => {
    const stored = localStorage.getItem("heartsHeal_intendedDestination")
    return stored || intendedDestination
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
