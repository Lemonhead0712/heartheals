"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageContainer } from "@/components/page-container"
import { PaymentConfirmation } from "@/components/payment-confirmation"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const { updateSubscriptionStatus } = useSubscription()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    try {
      // Get parameters from URL
      const emailParam = searchParams.get("email")
      const paymentIdParam = searchParams.get("payment_id")
      const amountParam = searchParams.get("amount")
      const redirectParam = searchParams.get("redirect")

      if (emailParam) setEmail(emailParam)
      if (paymentIdParam) setPaymentId(paymentIdParam)
      if (amountParam) setAmount(Number.parseInt(amountParam, 10))
      if (redirectParam) setRedirectPath(redirectParam)

      // Update subscription status if authenticated
      if (isAuthenticated) {
        updateSubscriptionStatus("premium", true)
      }
    } catch (error) {
      console.error("Error processing URL parameters:", error)
    }
  }, [searchParams, updateSubscriptionStatus, isAuthenticated])

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] flex flex-col items-center justify-center p-4">
        <motion.div className="w-full max-w-md" initial="hidden" animate="show" variants={container}>
          <motion.div className="flex justify-center mb-6" variants={item}>
            <Logo size="large" animate={true} />
          </motion.div>

          <motion.div variants={item}>
            <PaymentConfirmation
              paymentId={paymentId || undefined}
              email={email || undefined}
              amount={amount || undefined}
              redirectPath={redirectPath || undefined}
            />
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
