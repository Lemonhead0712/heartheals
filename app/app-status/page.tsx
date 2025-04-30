"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { ChevronLeft, AlertTriangle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { AppStatusDashboard } from "@/components/app-status-dashboard"
import { HapticSettings } from "@/components/haptic-settings"
import { PageContainer } from "@/components/page-container"
import { HapticTabsTrigger } from "@/components/ui/haptic-tabs"
import { Progress } from "@/components/ui/progress"
import { SelectiveResetDialog } from "@/components/selective-reset-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSubscription } from "@/contexts/subscription-context"
import { useHaptic } from "@/hooks/use-haptic"
import { resetApplication, type ResetProgress } from "@/utils/reset-utils"

export default function AppStatusPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetProgress, setResetProgress] = useState<ResetProgress>({
    step: "",
    progress: 0,
    isComplete: false,
  })
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetComplete, setIsResetComplete] = useState(false)
  const { tier, isActive } = useSubscription()
  const { haptic, patternHaptic } = useHaptic()

  // Reset the progress state when dialog closes
  useEffect(() => {
    if (!isResetConfirmOpen) {
      setTimeout(() => {
        setResetProgress({
          step: "",
          progress: 0,
          isComplete: false,
        })
        setResetError(null)
      }, 300)
    }
  }, [isResetConfirmOpen])

  const handleCancelSubscription = async () => {
    haptic("medium")
    setIsCancelling(true)

    // Simulate API call to cancel subscription
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsCancelling(false)
    setIsCancelled(true)

    // Close dialog after showing success message
    setTimeout(() => {
      setIsConfirmOpen(false)
      // Reset state after dialog closes
      setTimeout(() => setIsCancelled(false), 300)
    }, 2000)
  }

  const handleResetApplication = async () => {
    setIsResetting(true)
    setResetError(null)
    patternHaptic("warning")

    try {
      const result = await resetApplication((progress) => {
        setResetProgress(progress)

        // Provide haptic feedback at key points
        if (progress.progress === 100) {
          patternHaptic("success")
        } else if (progress.progress % 25 === 0) {
          haptic("light")
        }
      })

      if (result.success) {
        setIsResetComplete(true)

        // Close dialog after showing success message
        setTimeout(() => {
          setIsResetConfirmOpen(false)

          // Reset state after dialog closes
          setTimeout(() => {
            setIsResetting(false)
            setIsResetComplete(false)

            // Reload the page to reflect reset state
            window.location.reload()
          }, 300)
        }, 2000)
      } else {
        setResetError(result.error || "An unknown error occurred")
        setIsResetting(false)
        patternHaptic("error")
      }
    } catch (error) {
      console.error("Error resetting application:", error)
      setResetError("An unexpected error occurred. Please try again.")
      setIsResetting(false)
      patternHaptic("error")
    }
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e4e7eb] to-[#f5f7fa]">
        <motion.div
          className="container mx-auto px-4 py-8 max-w-4xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="flex flex-col items-center mb-6" variants={item}>
            <Logo size="small" />
          </motion.div>

          <motion.div className="mb-8" variants={item}>
            <Link href="/" className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">App Status</h1>
            <p className="text-gray-600">Monitor app performance and test features</p>
          </motion.div>

          <motion.div variants={item}>
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <HapticTabsTrigger value="dashboard" hapticIntensity="light">
                  Dashboard
                </HapticTabsTrigger>
                <HapticTabsTrigger value="settings" hapticIntensity="light">
                  Settings
                </HapticTabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <AppStatusDashboard />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <HapticSettings />

                <Card>
                  <CardHeader>
                    <CardTitle>App Version</CardTitle>
                    <CardDescription>Current version and build information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Version</span>
                        <span className="text-sm text-muted-foreground">1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Build</span>
                        <span className="text-sm text-muted-foreground">2023.04.15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Environment</span>
                        <span className="text-sm text-muted-foreground">Production</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cancel Subscription Card */}
                <Card className={tier === "premium" && isActive ? "border-pink-200" : "opacity-70"}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span>Subscription Management</span>
                    </CardTitle>
                    <CardDescription>Manage your premium subscription settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {tier === "premium" && isActive
                          ? "You currently have an active premium subscription. You can cancel at any time."
                          : "You don't have an active premium subscription."}
                      </p>

                      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={!(tier === "premium" && isActive)}
                            onClick={() => haptic("light")}
                          >
                            Cancel Subscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                              Cancel Your Subscription?
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to cancel your premium subscription?
                            </DialogDescription>
                          </DialogHeader>

                          {!isCancelled ? (
                            <>
                              <div className="py-4">
                                <div className="rounded-md bg-amber-50 p-4 mb-4">
                                  <div className="flex">
                                    <div className="text-amber-800">
                                      <p className="text-sm font-medium">What happens when you cancel:</p>
                                      <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                                        <li>
                                          You'll continue to have premium access until the end of your current billing
                                          period
                                        </li>
                                        <li>You won't be charged again after your current period ends</li>
                                        <li>Your premium features will be disabled once your subscription expires</li>
                                        <li>You can resubscribe at any time</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <DialogFooter className="flex sm:justify-between">
                                <Button type="button" variant="outline" onClick={() => setIsConfirmOpen(false)}>
                                  Keep Subscription
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={handleCancelSubscription}
                                  disabled={isCancelling}
                                >
                                  {isCancelling ? (
                                    <>
                                      <span className="animate-spin mr-2">⟳</span>
                                      Cancelling...
                                    </>
                                  ) : (
                                    "Yes, Cancel Subscription"
                                  )}
                                </Button>
                              </DialogFooter>
                            </>
                          ) : (
                            <div className="py-6 text-center">
                              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                                <svg
                                  className="h-6 w-6 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">Subscription Cancelled</h3>
                              <p className="mt-2 text-sm text-gray-500">
                                Your subscription has been cancelled successfully. You'll continue to have access until
                                the end of your current billing period.
                              </p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Reset Application</CardTitle>
                    <CardDescription>Clear all local data and reset to defaults</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will clear all your saved preferences, entries, and local data. This action cannot be undone.
                    </p>
                    <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            haptic("medium")
                            setResetProgress({
                              step: "",
                              progress: 0,
                              isComplete: false,
                            })
                          }}
                        >
                          Reset Application
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                            Reset Application?
                          </DialogTitle>
                          <DialogDescription>
                            Are you sure you want to reset the application? This will clear all your data.
                          </DialogDescription>
                        </DialogHeader>

                        {!isResetComplete ? (
                          <>
                            <div className="py-4">
                              <div className="rounded-md bg-amber-50 p-4 mb-4">
                                <div className="flex">
                                  <div className="text-amber-800">
                                    <p className="text-sm font-medium">What happens when you reset:</p>
                                    <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                                      <li>All your saved emotional logs will be deleted</li>
                                      <li>Your breathing exercise history will be cleared</li>
                                      <li>All app settings will return to defaults</li>
                                      <li>Your subscription status will not be affected</li>
                                      <li>All cached data will be cleared</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {isResetting && (
                                <div className="mt-4 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>{resetProgress.step}</span>
                                    <span>{resetProgress.progress}%</span>
                                  </div>
                                  <Progress value={resetProgress.progress} className="h-2" />
                                </div>
                              )}

                              {resetError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                                  <p className="font-medium">Error during reset:</p>
                                  <p>{resetError}</p>
                                  <p className="mt-1">Please try again or contact support if the issue persists.</p>
                                </div>
                              )}
                            </div>

                            <DialogFooter className="flex sm:justify-between">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResetConfirmOpen(false)}
                                disabled={isResetting}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={handleResetApplication}
                                disabled={isResetting}
                              >
                                {isResetting ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Resetting...
                                  </>
                                ) : (
                                  "Yes, Reset Everything"
                                )}
                              </Button>
                            </DialogFooter>
                          </>
                        ) : (
                          <div className="py-6 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                              <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Reset Complete</h3>
                            <p className="mt-2 text-sm text-gray-500">
                              Your application has been reset successfully. The page will reload momentarily.
                            </p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {/* Selective Reset Option */}
                    <SelectiveResetDialog onComplete={() => window.location.reload()} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
