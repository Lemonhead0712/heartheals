"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useSubscription } from "@/contexts/subscription-context"
import { PageContainer } from "@/components/page-container"
import { Logo } from "@/components/logo"
import { SubscriptionStatus } from "@/components/subscription-status"

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth()
  const { tier, isActive, remainingDays } = useSubscription()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20">
        <motion.div
          className="container mx-auto px-4 py-8 max-w-4xl"
          initial="hidden"
          animate="show"
          variants={container}
        >
          <motion.div className="flex flex-col items-center mb-6" variants={item}>
            <Logo size="small" />
          </motion.div>

          <motion.div className="mb-8 flex justify-between items-center" variants={item}>
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-purple-700 hover:text-purple-900 transition-colors"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-purple-800 mt-4 mb-2">Your Profile</h1>
              <p className="text-purple-600">Manage your account and subscription</p>
            </div>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={container}>
            {/* Profile Card */}
            <motion.div className="md:col-span-1" variants={item}>
              <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-purple-800">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="bg-purple-100 p-6 rounded-full">
                      <User className="h-12 w-12 text-purple-600" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="text-purple-700">{user.name || "Not provided"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="text-purple-700">{user.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                    <p className="text-purple-700">{new Date().toLocaleDateString()}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Subscription Card */}
            <motion.div className="md:col-span-2" variants={item}>
              <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-purple-800">Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <SubscriptionStatus showDetailed={true} />

                  {tier === "premium" && (
                    <div className="bg-purple-50 p-4 rounded-md">
                      <h3 className="font-medium text-purple-800 mb-2">Premium Benefits</h3>
                      <ul className="space-y-2 text-purple-700">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Unlimited emotional log entries</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Unlimited breathing exercises</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Unlimited journal entries</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Advanced analytics</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => router.push("/subscription")}
                  >
                    {tier === "premium" && isActive
                      ? "Manage Subscription"
                      : tier === "premium" && !isActive
                        ? "Renew Subscription"
                        : "Upgrade to Premium"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
