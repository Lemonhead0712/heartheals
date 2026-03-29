"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Heart, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

type WelcomeStep = {
  title: string
  description: string
  action: string
  link: string
}

const welcomeSteps: WelcomeStep[] = [
  {
    title: "Track Your Emotions",
    description: "Begin by logging how you are feeling right now.",
    action: "Log an Emotion",
    link: "/emotional-log",
  },
  {
    title: "Take a Breathing Break",
    description: "Try a quick breathing exercise to find calm.",
    action: "Start Breathing",
    link: "/breathe",
  },
  {
    title: "Reflect in Your Journal",
    description: "Write your first journal entry or take an emotional quiz.",
    action: "Begin Journaling",
    link: "/thoughts",
  },
]

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [userName, setUserName] = useState("")
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const visitedBefore = localStorage.getItem("heartsHeal_visited")
    if (!visitedBefore) {
      setIsVisible(true)
      localStorage.setItem("heartsHeal_visited", "true")
    }

    const storedName = localStorage.getItem("heartsHeal_userName")
    if (storedName) setUserName(storedName)

    const completed = JSON.parse(localStorage.getItem("heartsHeal_completedSteps") || "[]")
    setCompletedSteps(completed)
  }, [])

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    if (name) {
      setUserName(name)
      localStorage.setItem("heartsHeal_userName", name)
    }
  }

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const updated = [...completedSteps, stepIndex]
      setCompletedSteps(updated)
      localStorage.setItem("heartsHeal_completedSteps", JSON.stringify(updated))
    }
  }

  if (!isVisible) return null

  const progress = Math.round((completedSteps.length / welcomeSteps.length) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="glass-card-elevated overflow-hidden relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Dismiss welcome banner"
        >
          <X className="h-4 w-4" />
        </button>

        <CardContent className="p-6 sm:p-8">
          {!userName ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-xl font-semibold text-foreground">Welcome to HeartsHeal</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {"We're so glad you're here. This is your safe space for emotional healing and growth. What should we call you?"}
              </p>
              <form onSubmit={handleNameSubmit} className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue
                </Button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Welcome, {userName}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                Here are a few ways to begin your wellness journey.
              </p>

              <div className="flex flex-col gap-3 mb-5">
                {welcomeSteps.map((step, i) => {
                  const done = completedSteps.includes(i)
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                        done
                          ? "bg-accent/50 border-border/30"
                          : "bg-card border-border/50"
                      }`}
                    >
                      <div className="mt-0.5">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                      <Link href={step.link} onClick={() => markStepComplete(i)}>
                        <Button
                          size="sm"
                          variant={done ? "ghost" : "default"}
                          className={`text-xs h-8 ${
                            done
                              ? "text-muted-foreground"
                              : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                        >
                          {done ? "Done" : step.action}
                          {!done && <ArrowRight className="w-3 h-3 ml-1" />}
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
