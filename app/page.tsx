"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookHeart, Wind, BarChart3, ArrowRight, Sparkles, HeartHandshake } from "lucide-react"
import { WelcomeBanner } from "@/components/welcome-banner"
import { SnapshotsSection } from "@/components/snapshots-section"
import { QuickEmotionalLog } from "@/components/quick-emotional-log"
import { EmotionTrendsWidget } from "@/components/emotion-trends-widget"
import { InspirationalQuote } from "@/components/inspirational-quote"

/* ─── Animation variants ─── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

/* ─── Feature card data ─── */
const features = [
  {
    href:        "/emotional-log",
    icon:        BarChart3,
    title:       "Emotional Log",
    description: "Capture your feelings and watch patterns emerge over time.",
    iconBg:      "bg-primary/10 text-primary",
    accent:      "from-primary/6",
  },
  {
    href:        "/breathe",
    icon:        Wind,
    title:       "Guided Breathing",
    description: "Soft animations guide each breath toward calm and clarity.",
    iconBg:      "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",
    accent:      "from-sky-50/60 dark:from-sky-900/20",
  },
  {
    href:        "/thoughts",
    icon:        BookHeart,
    title:       "Thoughts Journal",
    description: "Reflect through guided journaling and self-compassion quizzes.",
    iconBg:      "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    accent:      "from-amber-50/60 dark:from-amber-900/20",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-page-gradient">
      <motion.div
        className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-10 md:pt-10 md:pb-16"
        variants={container}
        initial="hidden"
        animate="show"
      >

        {/* ── Hero ── */}
        <motion.section className="text-center max-w-2xl mx-auto mb-10 md:mb-14" variants={item}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-5">
            <HeartHandshake className="w-3.5 h-3.5" />
            Your space for healing
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-4 text-balance leading-tight">
            Heal, Breathe,{" "}
            <span className="text-primary">Grow.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed text-pretty max-w-xl mx-auto">
            A calming sanctuary for emotional reflection, guided breathing, and personal growth — gently supporting you on your journey.
          </p>
        </motion.section>

        {/* ── Inspirational Quote ── */}
        <motion.section className="mb-10 md:mb-14" variants={item}>
          <InspirationalQuote />
        </motion.section>

        {/* ── Welcome Banner (first visit only) ── */}
        <motion.section className="mb-10 md:mb-14" variants={item}>
          <WelcomeBanner />
        </motion.section>

        {/* ── Feature Cards ── */}
        <motion.section className="mb-12 md:mb-16" variants={item}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
              Your Wellness Tools
            </h2>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(({ href, icon: Icon, title, description, iconBg, accent }) => (
              <motion.div key={href} variants={item}>
                <Link href={href} className="group block h-full">
                  <div
                    className={`
                      feature-card h-full rounded-2xl bg-card border border-border/40
                      bg-gradient-to-br ${accent} to-transparent
                    `}
                  >
                    <div className="p-5 sm:p-6 flex flex-col h-full">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4 shrink-0`}>
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>

                      {/* Text */}
                      <h3 className="text-[15px] font-semibold text-foreground mb-1.5 leading-snug">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {description}
                      </p>

                      {/* CTA row */}
                      <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-primary/70 group-hover:text-primary transition-colors duration-200">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Dashboard Grid ── */}
        <motion.section className="mb-12 md:mb-16" variants={item}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-foreground">
              Your Dashboard
            </h2>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <SnapshotsSection />
            <QuickEmotionalLog />
          </div>
        </motion.section>

        {/* ── Trends ── */}
        <motion.section className="mb-12 md:mb-16" variants={item}>
          <EmotionTrendsWidget />
        </motion.section>

        {/* ── Premium upsell banner ── */}
        <motion.section variants={item}>
          <Link href="/subscription" className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 transition-all duration-300 hover:bg-primary/8 hover:border-primary/30 hover:shadow-md">
              {/* Background glow */}
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" aria-hidden="true" />

              <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold tracking-wide mb-3">
                    <Sparkles className="w-3 h-3" />
                    HeartsHeal Premium
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-1.5">
                    Unlock your full healing potential
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    Gain access to advanced journaling, unlimited emotional logs, progress insights, and exclusive guided exercises.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 transition-all duration-200 group-hover:shadow-md group-hover:shadow-primary/25 group-hover:-translate-y-0.5">
                  Explore Premium
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </Link>
        </motion.section>
      </motion.div>
    </div>
  )
}
