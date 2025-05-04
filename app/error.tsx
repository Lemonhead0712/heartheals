"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <h2 className="text-3xl font-bold mb-4 font-playfair">Something Went Wrong</h2>
      <p className="text-lg mb-8 max-w-md">We apologize for the inconvenience. Please try again.</p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={reset} size="lg" className="bg-pink-600 hover:bg-pink-700">
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
