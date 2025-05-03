// This is a server component
import { serverEnv } from "@/lib/environment"
import { getEmailServiceConfiguration } from "@/lib/email-utils"
import { ClientEnvChecker } from "@/components/client-env-checker"

export default function EnvironmentTestPage() {
  // These values are only available on the server
  const serverEnvDetails = {
    nodeEnv: serverEnv.nodeEnv,
    hasStripeSecret: !!serverEnv.stripeSecretKey,
    hasWebhookSecret: !!serverEnv.stripeWebhookSecret,
    hasResendKey: !!serverEnv.resendApiKey,
  }

  const emailConfig = getEmailServiceConfiguration()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Test</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Server Environment</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
            {JSON.stringify(serverEnvDetails, null, 2)}
          </pre>

          <h3 className="text-lg font-semibold mt-6 mb-2">Email Configuration</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
            {JSON.stringify(emailConfig, null, 2)}
          </pre>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Client Environment</h2>
          <ClientEnvChecker />
        </div>
      </div>

      <div className="mt-8 p-6 border rounded-lg shadow-sm bg-yellow-50">
        <h2 className="text-xl font-semibold mb-4">Important Notes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Server-side variables should only be accessed in Server Components or API Routes</li>
          <li>Client-side variables must be prefixed with NEXT_PUBLIC_</li>
          <li>The NODE_ENV variable is special and cannot be directly accessed on the client</li>
          <li>Use the environment.ts utilities to safely access environment information</li>
        </ul>
      </div>
    </div>
  )
}
