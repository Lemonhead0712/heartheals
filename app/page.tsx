"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookHeart, Clipboard, Wind } from "lucide-react"
import { Logo } from "@/components/logo"
import { SnapshotsSection } from "@/components/snapshots-section"
import { QuickEmotionalLog } from "@/components/quick-emotional-log"
import { EmotionTrendsWidget } from "@/components/emotion-trends-widget"
import { InspirationalQuote } from "@/components/inspirational-quote"
import { FreeModelBanner } from "@/components/free-model-banner"
import type { EmotionEntry } from "@/utils/emotion-analytics"
import { PageContainer } from "@/components/page-container"
import { LinkWrapper } from "@/components/ui/link-wrapper"
import { WelcomeBanner } from "@/components/welcome-banner"

// Mock data types
type JournalEntry = {
  id: string
  prompt: string
  entry: string
  category: string
  date: Date
}

export default function Home() {
  // Mock data for demonstration
  const [recentEmotions, setRecentEmotions] = useState<EmotionEntry[]>([])
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([])

  // Load real data from localStorage
  useEffect(() => {
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
          .sort((a: EmotionEntry, b: EmotionEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fce4ec]/80 via-[#e0f7fa]/80 to-[#ede7f6]/80">
      <PageContainer maxWidth="3xl" className="py-6 md:py-8">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Header Section */}
          <motion.div className="flex flex-col items-center mb-8 relative" variants={item}>
            {/* Decorative background elements */}
            <motion.div
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-60 blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            />
            <motion.div
              className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-200 to-teal-200 opacity-60 blur-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.5 }}
            />

            {/* Animated sparkles */}
            <motion.div
              className="absolute top-1/4 left-1/4 text-2xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: 45 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 2 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 right-1/4 text-2xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: -45 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
            >
              ✨
            </motion.div>

            {/* Enhanced logo with glow effect */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="absolute inset-0 bg-pink-300 rounded-full blur-xl opacity-40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              />
              <Logo animate={true} size="large" showText={false} />
            </motion.div>

            {/* Enhanced title with gradient text */}
            <motion.h1
              className="text-4xl font-bold mt-4 mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 drop-shadow-sm"
              variants={item}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              HeartsHeal
            </motion.h1>

            {/* Enhanced description with animated underline */}
            <motion.div className="relative">
              <motion.p
                className="text-lg text-center text-blue-700 max-w-md mx-auto mb-4 italic font-light tracking-wide"
                variants={item}
              >
                A sanctuary for emotional healing, reflection, and personal growth — guiding you gently through your
                journey of self-discovery and emotional renewal.
              </motion.p>
              <motion.div
                className="absolute -bottom-2 left-1/2 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent"
                initial={{ width: 0, x: "-50%" }}
                animate={{ width: "80%", x: "-50%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </motion.div>
          </motion.div>

          {/* Welcome Banner for First-Time Users */}
          <motion.div className="mb-8" variants={item}>
            <WelcomeBanner />
          </motion.div>

          {/* Main Feature Cards */}
          <motion.div className="mb-8" variants={item}>
            <motion.h2 className="text-2xl font-semibold text-purple-800 mb-4 text-center" variants={item}>
              Explore Features
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="flex">
                <LinkWrapper href="/emotional-log" className="block w-full">
                  <Card className="h-full border-pink-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center flex-grow">
                      <Clipboard className="w-10 h-10 text-pink-500 mb-3" />
                      <h3 className="text-xl font-semibold text-pink-700 mb-2">Emotional State Log</h3>
                      <p className="text-pink-600 flex-grow">
                        Gently capture how you're feeling today and watch your healing unfold.
                      </p>
                    </CardContent>
                  </Card>
                </LinkWrapper>
              </motion.div>

              <motion.div variants={item} className="flex">
                <LinkWrapper href="/breathe" className="block w-full">
                  <Card className="h-full border-blue-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center flex-grow">
                      <Wind className="w-10 h-10 text-blue-500 mb-3" />
                      <h3 className="text-xl font-semibold text-blue-700 mb-2">Breathe With Me</h3>
                      <p className="text-blue-600 flex-grow">
                        Follow calming patterns and let soft animation guide your breath.
                      </p>
                    </CardContent>
                  </Card>
                </LinkWrapper>
              </motion.div>

              <motion.div variants={item} className="flex sm:col-span-2 lg:col-span-1">
                <LinkWrapper href="/thoughts" className="block w-full">
                  <Card className="h-full border-purple-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
                    <CardContent className="p-4 sm:p-5 flex flex-col items-center text-center flex-grow">
                      <BookHeart className="w-10 h-10 text-purple-500 mb-3" />
                      <h3 className="text-xl font-semibold text-purple-700 mb-2">Emotional Thoughts</h3>
                      <p className="text-purple-600 flex-grow">
                        Journal your feelings and gain insights through reflective exercises
                      </p>
                    </CardContent>
                  </Card>
                </LinkWrapper>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Inspirational Quote */}
          <motion.div className="mb-8" variants={item}>
            <InspirationalQuote />
          </motion.div>

          {/* New Sections: Snapshots and Quick Emotional Log */}
          <motion.div className="mb-8" variants={item}>
            <motion.h2 className="text-2xl font-semibold text-purple-800 mb-4 text-center" variants={item}>
              Your Wellness Dashboard
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Snapshots Section */}
              <motion.div variants={item} className="flex">
                <div className="w-full">
                  <SnapshotsSection />
                </div>
              </motion.div>

              {/* Quick Emotional Log */}
              <motion.div variants={item} className="flex">
                <div className="w-full">
                  <QuickEmotionalLog />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Emotional Trends Widget */}
          <motion.div variants={item} initial="hidden" animate="show">
            <EmotionTrendsWidget />
          </motion.div>
        </motion.div>
      </PageContainer>

      {/* Free Model Banner */}
      <FreeModelBanner />
    </div>
  )
}
