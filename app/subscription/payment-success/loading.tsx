import { PageContainer } from "@/components/page-container"
import { Logo } from "@/components/logo"
import { Loader2 } from "lucide-react"

export default function PaymentSuccessLoading() {
  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <Logo size="large" animate={false} />
          </div>

          <div className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
              <h2 className="text-2xl font-bold text-purple-800">Processing Payment</h2>
              <p className="text-purple-600">Please wait while we confirm your payment details...</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
