"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { AppStatusDashboard } from "@/components/app-status-dashboard"
import { SubscriptionTestPanel } from "@/components/subscription-test-panel"
import { SubscriptionQRCode } from "@/components/subscription-qr-code"
import { HapticSettings } from "@/components/haptic-settings"
import { PageContainer } from "@/components/page-container"
import { HapticTabsTrigger } from "@/components/ui/haptic-tabs"

export default function AppStatusPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

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
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <HapticTabsTrigger value="dashboard" hapticIntensity="light">
                  Dashboard
                </HapticTabsTrigger>
                <HapticTabsTrigger value="subscription" hapticIntensity="light">
                  Subscription
                </HapticTabsTrigger>
                <HapticTabsTrigger value="settings" hapticIntensity="light">
                  Settings
                </HapticTabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <AppStatusDashboard />
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Test Panel</CardTitle>
                    <CardDescription>Test subscription features and functionality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionTestPanel />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription QR Code</CardTitle>
                    <CardDescription>Scan to test subscription on another device</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <SubscriptionQRCode />
                  </CardContent>
                </Card>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Reset Application</CardTitle>
                    <CardDescription>Clear all local data and reset to defaults</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will clear all your saved preferences, entries, and local data. This action cannot be undone.
                    </p>
                    <Button variant="destructive" className="w-full">
                      Reset Application
                    </Button>
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
