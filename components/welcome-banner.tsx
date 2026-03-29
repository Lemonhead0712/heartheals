"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Heart, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

type WelcomeStep = {
  title: string
  description: string
  action: string
  link: string
}

const welcomeSteps: WelcomeStep[] = [
  {
    title:       "Track Your Emotions",
    description: "Begin by logging how you are feeling right now.",
    action:      "Log an Emotion",
    link:        "/emotional-log",
  },
  {
    title:       "Take a Breathing Break",
    description: "Try a quick breathing exercise to find calm.",
    action:      "Start Breathing",
    link:        "/breathe",
  },
  {
    title:       "Reflect in Your Journal",
    description: "Write your first journal entry or take an emotional quiz.",
    action:      "Begin Journaling",
    link:        "/thoughts",
  },
]

export function WelcomeBanner() {
  const [visible, setVisible]             = useState(false)
  const [userName, setUserName]           = useState("")
  const [completedSteps, setCompleted]    = useState<number[]>([])

  useEffect(() => {
    const visited = localStorage.getItem("heartsHeal_visited")
    if (!visited) {
      setVisible(true)
      localStorage.setItem("heartsHeal_visited", "true")
    }
    const storedName = localStorage.getItem("heartsHeal_userName")
    if (storedName) setUserName(storedName)
    const done = JSON.parse(localStorage.getItem("heartsHeal_completedSteps") || "[]")
    setCompleted(done)
  }, [])

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = (new FormData(e.currentTarget).get("name") as string).trim()
    if (name) {
      setUserName(name)
      localStorage.setItem("heartsHeal_userName", name)
    }
  }

  const markDone = (i: number) => {
    if (!completedSteps.includes(i)) {
      const updated = [...completedSteps, i]
      setCompleted(updated)
      localStorage.setItem("heartsHeal_completedSteps", JSON.stringify(updated))
    }
  }

  if (!visible) return null

  const progress = Math.round((completedSteps.length / welcomeSteps.length) * 100)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glass-card-elevated rounded-2xl overflow-hidden relative">
          {/* Top accent stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/70 transition-colors"
            aria-label="Dismiss welcome banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="p-6 sm:p-8">
            {!userName ? (
              /* Name capture */
              <div className="max-w-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Welcome to HeartsHeal
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {"We're so glad you're here. This is your safe space for emotional healing and growth. What should we call you?"}
                </p>
                <form onSubmit={handleNameSubmit} className="flex gap-2.5">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                    autoComplete="given-name"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/60"
                  />
                  <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4">
                    Continue
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </form>
              </div>
            ) : (
              /* Step checklist */
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Welcome back, {userName}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 ml-10">
                  Here are a few ways to start your wellness journey.
                </p>

                <div className="flex flex-col gap-2.5 mb-5">
                  {welcomeSteps.map((step, i) => {
                    const done = completedSteps.includes(i)
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                          done
                            ? "bg-surface border-border/30 opacity-70"
                            : "bg-card border-border/50 hover:border-primary/30 hover:bg-highlight/50"
                        }`}
                      >
                        {/* Step indicator */}
                        <div className="shrink-0">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center">
                              <span className="text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-none mb-0.5 ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>

                        {/* CTA */}
                        <Link href={step.link} onClick={() => markDone(i)} className="shrink-0">
                          <Button
                            size="sm"
                            variant={done ? "ghost" : "default"}
                            className={`text-xs h-8 rounded-lg ${
                              done
                                ? "text-muted-foreground"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {done ? "Done" : step.action}
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium tabular-nums">{progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
