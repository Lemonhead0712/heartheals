"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookHeart, Clipboard, Wind, ArrowRight } from "lucide-react"
import { WelcomeBanner } from "@/components/welcome-banner"
import { SnapshotsSection } from "@/components/snapshots-section"
import { QuickEmotionalLog } from "@/components/quick-emotional-log"
import { EmotionTrendsWidget } from "@/components/emotion-trends-widget"
import { InspirationalQuote } from "@/components/inspirational-quote"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const features = [
  {
    href: "/emotional-log",
    icon: Clipboard,
    title: "Emotional State Log",
    description: "Gently capture how you are feeling today and watch your healing unfold over time.",
    accent: "bg-primary/10 text-primary",
  },
  {
    href: "/breathe",
    icon: Wind,
    title: "Breathe With Me",
    description: "Follow calming patterns and let soft animation guide your breath to find peace.",
    accent: "bg-sky-100 text-sky-600",
  },
  {
    href: "/thoughts",
    icon: BookHeart,
    title: "Emotional Thoughts",
    description: "Journal your feelings and gain insights through guided reflective exercises.",
    accent: "bg-amber-100 text-amber-600",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-page-gradient">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Hero section */}
        <motion.section className="mb-10" variants={item}>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3 text-balance">
              Your space for healing
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-pretty">
              A sanctuary for emotional reflection, guided breathing, and personal growth -- gently supporting you on your journey.
            </p>
          </div>
        </motion.section>

        {/* Inspirational Quote */}
        <motion.section className="mb-10" variants={item}>
          <InspirationalQuote />
        </motion.section>

        {/* Welcome Banner (shows for first-time users) */}
        <motion.section className="mb-10" variants={item}>
          <WelcomeBanner />
        </motion.section>

        {/* Feature Cards */}
        <motion.section className="mb-12" variants={item}>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-6 text-center">
            Explore Your Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <motion.div key={feature.href} variants={item}>
                <Link href={feature.href} className="block group h-full">
                  <Card className="h-full glass-card-elevated border-border/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6 flex flex-col items-start">
                      <div className={`w-11 h-11 rounded-xl ${feature.accent} flex items-center justify-center mb-4`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-1 mt-4 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span>Begin</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Dashboard section */}
        <motion.section className="mb-12" variants={item}>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-6 text-center">
            Your Wellness Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div variants={item}>
              <SnapshotsSection />
            </motion.div>
            <motion.div variants={item}>
              <QuickEmotionalLog />
            </motion.div>
          </div>
        </motion.section>

        {/* Emotion Trends */}
        <motion.section variants={item}>
          <EmotionTrendsWidget />
        </motion.section>
      </motion.div>
    </div>
  )
}
