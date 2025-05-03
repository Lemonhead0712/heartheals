"use client"

import { useEffect, useState } from "react"
import { clientEnv } from "@/lib/environment"
import { isTestMode } from "@/lib/test-mode"

export function ClientEnvChecker() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading client environment...</div>
  }

  const clientEnvDetails = {
    isDevelopment: clientEnv.isDevelopment,
    isProduction: clientEnv.isProduction,
    isTest: clientEnv.isTest,
    hasAppUrl: !!clientEnv.appUrl,
    appUrl: clientEnv.appUrl,
    hasStripePublishableKey: !!clientEnv.stripePublishableKey,
    isTestMode: isTestMode(),
  }

  return (
    <div>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
        {JSON.stringify(clientEnvDetails, null, 2)}
      </pre>

      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm">
          This component is rendered on the client side. It can only access environment variables prefixed with
          NEXT_PUBLIC_.
        </p>
      </div>
    </div>
  )
}
