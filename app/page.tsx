"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookHeart, Clipboard, Wind } from "lucide-react"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/contexts/subscription-context"
import { SubscriptionStatus } from "@/components/subscription-status"
import { createDynamicComponent } from "@/components/dynamic-import"
import { PageContainer } from "@/components/page-container"
import type { EmotionEntry } from "@/utils/emotion-analytics"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Dynamically import heavy components
const WelcomeBanner = createDynamicComponent(
  () => import("@/components/welcome-banner").then((mod) => ({ default: mod.WelcomeBanner })),
  "WelcomeBanner",
)

const SnapshotsSection = createDynamicComponent(
  () => import("@/components/snapshots-section").then((mod) => ({ default: mod.SnapshotsSection })),
  "SnapshotsSection",
)

const QuickEmotionalLog = createDynamicComponent(
  () => import("@/components/quick-emotional-log").then((mod) => ({ default: mod.QuickEmotionalLog })),
  "QuickEmotionalLog",
)

const EmotionTrendsWidget = createDynamicComponent(
  () => import("@/components/emotion-trends-widget").then((mod) => ({ default: mod.EmotionTrendsWidget })),
  "EmotionTrendsWidget",
)

const InspirationalQuote = createDynamicComponent(
  () => import("@/components/inspirational-quote").then((mod) => ({ default: mod.InspirationalQuote })),
  "InspirationalQuote",
)

// Mock data types
type JournalEntry = {
  id: string
  prompt: string
  entry: string
  category: string
  date: Date
}

export default function Home() {
  const { tier, isActive, canUseFeature } = useSubscription()

  // Mock data for demonstration
  const [recentEmotions, setRecentEmotions] = useState<EmotionEntry[]>([])
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load real data from localStorage
  useEffect(() => {
    // Simulate network delay for demonstration
    const timer = setTimeout(() => {
      // Load emotion entries
      try {
        const storedEmotions = localStorage.getItem("heartsHeal_emotionLogs")
        if (storedEmotions) {
          const parsedEmotions = JSON.parse(storedEmotions)
          // Convert string timestamps back to Date objects
          const processedEmotions = parsedEmotions.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }))
          // Sort by timestamp (newest first) and take the first 3
          const sortedEmotions = processedEmotions
            .sort(
              (a: EmotionEntry, b: EmotionEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )
            .slice(0, 3)

          setRecentEmotions(sortedEmotions)
        }
      } catch (error) {
        console.error("Error loading emotion logs:", error)
      }

      // Load journal entries
      try {
        const storedJournals = localStorage.getItem("heartsHeal_journalEntries")
        if (storedJournals) {
          const parsedJournals = JSON.parse(storedJournals)
          // Convert string dates back to Date objects
          const processedJournals = parsedJournals.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
          }))
          // Sort by date (newest first) and take the first 2
          const sortedJournals = processedJournals
            .sort((a: JournalEntry, b: JournalEntry) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 2)

          setRecentJournals(sortedJournals)
        }
      } catch (error) {
        console.error("Error loading journal entries:", error)
      }

      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Staggered animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  // Helper function to format date
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      )
    }
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-gradient-to-br from-[#fce4ec] via-[#e0f7fa] to-[#ede7f6] pb-20 pt-4 md:pt-0">
        <motion.div className="container mx-auto px-4 py-12" variants={container} initial="hidden" animate="show">
          {/* Header Section */}
          <motion.div className="flex flex-col items-center mb-12" variants={item}>
            <Logo animate={true} size="large" showText={false} />

            <motion.h1 className="text-3xl font-bold text-purple-800 mt-6 mb-2 text-center" variants={item}>
              HeartsHeal
            </motion.h1>

            <motion.p
              className="text-lg text-center text-blue-700 max-w-md mx-auto mb-6 italic font-light tracking-wide"
              variants={item}
            >
              A sanctuary for emotional healing, reflection, and personal growth — guiding you gently through your
              journey of self-discovery and emotional renewal.
            </motion.p>

            <motion.div variants={item} className="mt-2">
              <SubscriptionStatus />
            </motion.div>
          </motion.div>

          {/* Welcome Banner for First-Time Users */}
          <motion.div className="mb-12" variants={item}>
            <Suspense
              fallback={
                <div className="h-32 flex items-center justify-center">
                  <LoadingSpinner size="medium" />
                </div>
              }
            >
              <WelcomeBanner />
            </Suspense>
          </motion.div>

          {/* Main Feature Cards */}
          <motion.div className="mb-12" variants={item}>
            <motion.h2 className="text-2xl font-semibold text-purple-800 mb-6 text-center" variants={item}>
              Explore Features
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="flex">
                <Link href="/emotional-log" className="block w-full">
                  <Card className="h-full border-pink-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
                      <Clipboard className="w-12 h-12 text-pink-500 mb-4" />
                      <h3 className="text-xl font-semibold text-pink-700 mb-2">Emotional State Log</h3>
                      <p className="text-pink-600 flex-grow">
                        Gently capture how you're feeling today and watch your healing unfold.
                      </p>
                      {!canUseFeature("emotional-log") && tier !== "premium" && (
                        <Badge variant="outline" className="mt-3 border-pink-300 text-pink-700">
                          Free uses: 0/3
                        </Badge>
                      )}
                      {tier === "premium" && !isActive && (
                        <Badge variant="outline" className="mt-3 border-yellow-300 text-yellow-700">
                          Premium inactive
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item} className="flex">
                <Link href="/breathe" className="block w-full">
                  <Card className="h-full border-blue-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
                      <Wind className="w-12 h-12 text-blue-500 mb-4" />
                      <h3 className="text-xl font-semibold text-blue-700 mb-2">Breathe With Me</h3>
                      <p className="text-blue-600 flex-grow">
                        Follow calming patterns and let soft animation guide your breath.
                      </p>
                      {!canUseFeature("breathing-exercise") && tier !== "premium" && (
                        <Badge variant="outline" className="mt-3 border-blue-300 text-blue-700">
                          Free uses: 0/3
                        </Badge>
                      )}
                      {tier === "premium" && !isActive && (
                        <Badge variant="outline" className="mt-3 border-yellow-300 text-yellow-700">
                          Premium inactive
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item} className="flex">
                <Link href="/thoughts" className="block w-full">
                  <Card className="h-full border-purple-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
                      <BookHeart className="w-12 h-12 text-purple-500 mb-4" />
                      <h3 className="text-xl font-semibold text-purple-700 mb-2">Emotional Thoughts</h3>
                      <p className="text-purple-600 flex-grow">
                        Journal your feelings and gain insights through reflective exercises
                      </p>
                      {!canUseFeature("journal-entry") && tier !== "premium" && (
                        <Badge variant="outline" className="mt-3 border-purple-300 text-purple-700">
                          Free uses: 0/3
                        </Badge>
                      )}
                      {tier === "premium" && !isActive && (
                        <Badge variant="outline" className="mt-3 border-yellow-300 text-yellow-700">
                          Premium inactive
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Inspirational Quote */}
          <motion.div className="mb-12" variants={item}>
            <Suspense
              fallback={
                <div className="h-24 flex items-center justify-center">
                  <LoadingSpinner size="small" />
                </div>
              }
            >
              <InspirationalQuote />
            </Suspense>
          </motion.div>

          {/* New Sections: Snapshots and Quick Emotional Log */}
          <motion.div className="mb-12" variants={item}>
            <motion.h2 className="text-2xl font-semibold text-purple-800 mb-6 text-center" variants={item}>
              Your Wellness Dashboard
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Snapshots Section */}
              <motion.div variants={item} className="flex">
                <div className="w-full">
                  <Suspense
                    fallback={
                      <div className="h-64 flex items-center justify-center">
                        <LoadingSpinner size="medium" />
                      </div>
                    }
                  >
                    <SnapshotsSection />
                  </Suspense>
                </div>
              </motion.div>

              {/* Quick Emotional Log */}
              <motion.div variants={item} className="flex">
                <div className="w-full">
                  <Suspense
                    fallback={
                      <div className="h-64 flex items-center justify-center">
                        <LoadingSpinner size="medium" />
                      </div>
                    }
                  >
                    <QuickEmotionalLog />
                  </Suspense>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Emotional Trends Widget */}
          <motion.div className="max-w-5xl mx-auto" variants={item} initial="hidden" animate="show">
            <Suspense
              fallback={
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="medium" />
                </div>
              }
            >
              <EmotionTrendsWidget />
            </Suspense>
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  )
}
