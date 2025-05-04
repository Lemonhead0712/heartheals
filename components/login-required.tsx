"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginRequiredProps {
  children: ReactNode
  title?: string
  description?: string
  showLoginButton?: boolean
  redirectPath?: string
}

export function LoginRequired({
  children,
  title = "Login Required",
  description = "Please log in to access this feature",
  showLoginButton = true,
  redirectPath,
}: LoginRequiredProps) {
  const { isAuthenticated, isLoading, setIntendedDestination } = useAuth()
  const router = useRouter()

  // If still loading auth state or user is authenticated, show the children
  if (isLoading || isAuthenticated) {
    return <>{children}</>
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Store the current path or provided redirect path
    if (redirectPath) {
      setIntendedDestination(redirectPath)
    } else if (typeof window !== "undefined") {
      setIntendedDestination(window.location.pathname)
    }

    // Redirect to login page
    router.push("/login")
  }

  // Otherwise, show login required message
  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-purple-800 flex items-center justify-center">
          <LogIn className="h-5 w-5 mr-2 text-purple-600" />
          {title}
        </CardTitle>
        <CardDescription className="text-purple-600">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-gray-600 mb-4">Please log in to access your personal data and settings.</p>
      </CardContent>
      {showLoginButton && (
        <CardFooter className="flex justify-center">
          <Button onClick={handleLoginRedirect} className="bg-purple-600 hover:bg-purple-700 text-white">
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
