"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Application Error</h2>
          <p className="text-lg mb-8 max-w-md">
            We're sorry, but something went wrong with the application. Our team has been notified.
          </p>
          <Button onClick={reset} size="lg" className="bg-pink-600 hover:bg-pink-700">
            Try Again
          </Button>
        </div>
      </body>
    </html>
  )
}
