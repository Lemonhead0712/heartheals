"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageContainer } from "@/components/page-container"
import { ActivationSuccess } from "@/components/activation-success"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"
import { useSubscription } from "@/contexts/subscription-context"
import { useAuth } from "@/contexts/auth-context"
import { resetActivationStatus } from "@/lib/activation-utils"

export default function ActivationSuccessPage() {
  const searchParams = useSearchParams()
  const [userName, setUserName] = useState<string | null>(null)
  const [redirectPath, setRedirectPath] = useState<string>("/")
  const { immediatelyActivatePremium } = useSubscription()
  const { user } = useAuth()

  useEffect(() => {
    // Get parameters from URL
    const nameParam = searchParams.get("name")
    const redirectParam = searchParams.get("redirect")

    if (nameParam) setUserName(nameParam)
    if (redirectParam) setRedirectPath(redirectParam)

    // If user is logged in, use their name
    if (user?.name) {
      setUserName(user.name)
    } else if (user?.email) {
      setUserName(user.email.split("@")[0])
    }

    // Immediately activate premium features
    immediatelyActivatePremium()

    // Clear activation status after successful activation
    resetActivationStatus()

    return () => {
      // Clean up any remaining activation data when leaving the page
      resetActivationStatus()
    }
  }, [searchParams, immediatelyActivatePremium, user])

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
            <ActivationSuccess userName={userName || undefined} redirectPath={redirectPath} />
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
