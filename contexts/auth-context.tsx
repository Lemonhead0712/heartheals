"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  requiresLogin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { tier, isActive } = useSubscription()

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

  // Mock login function - in a real app, this would call an API
  const login = async (email: string, password: string): Promise<boolean> => {
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
  }

  // Function to determine if login is required based on subscription status
  const requiresLogin = () => {
    return tier === "premium" && isActive && !user
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
