"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Heart, CheckCircle2 } from "lucide-react"
import Link from "next/link"

type WelcomeStep = {
  title: string
  description: string
  action: string
  link: string
}

export function WelcomeBanner() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [userName, setUserName] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [progress, setProgress] = useState(0)

  const welcomeSteps: WelcomeStep[] = [
    {
      title: "Track Your Emotions",
      description: "Begin by logging how you're feeling right now with our emotion tracker.",
      action: "Log an Emotion",
      link: "/emotional-log",
    },
    {
      title: "Take a Breathing Break",
      description: "Try a quick breathing exercise to center yourself and find calm.",
      action: "Start Breathing",
      link: "/breathe",
    },
    {
      title: "Reflect in Your Journal",
      description: "Write your first journal entry or take an emotional awareness quiz.",
      action: "Begin Journaling",
      link: "/thoughts",
    },
  ]

  useEffect(() => {
    // Check if this is the first visit
    const visitedBefore = localStorage.getItem("heartsHeal_visited")
    if (visitedBefore) {
      setIsFirstVisit(false)
      setIsVisible(false)
    } else {
      // Set flag for future visits
      localStorage.setItem("heartsHeal_visited", "true")

      // Try to get a name if the user has set one before
      const storedName = localStorage.getItem("heartsHeal_userName")
      if (storedName) {
        setUserName(storedName)
      }
    }

    // Check for completed steps
    const completed = JSON.parse(localStorage.getItem("heartsHeal_completedSteps") || "[]")
    setCompletedSteps(completed)
    updateProgress(completed)
  }, [])

  useEffect(() => {
    // Update progress whenever completedSteps changes
    updateProgress(completedSteps)
  }, [completedSteps])

  const updateProgress = (steps: number[]) => {
    const newProgress = Math.round((steps.length / welcomeSteps.length) * 100)
    setProgress(newProgress)
  }

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    if (name) {
      setUserName(name)
      localStorage.setItem("heartsHeal_userName", name)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const newCompletedSteps = [...completedSteps, stepIndex]
      setCompletedSteps(newCompletedSteps)
      localStorage.setItem("heartsHeal_completedSteps", JSON.stringify(newCompletedSteps))
    }
  }

  if (!isFirstVisit || !isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8"
    >
      <Card className="border-purple-200 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 shadow-md overflow-hidden">
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full text-purple-500 hover:text-purple-700 hover:bg-purple-100"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-purple-800 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500 fill-pink-500" />
            Welcome to HeartsHeal
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!userName ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <p className="text-purple-700 mb-4">
                We're so glad you're here. HeartsHeal is your safe space for emotional healing and growth. Let's start
                by getting to know you a little better.
              </p>

              <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    name="name"
                    placeholder="What should we call you?"
                    className="w-full px-3 py-2 rounded-md border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Continue
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="text-purple-700 mb-4">
                Hi {userName}! We're so glad you're here. HeartsHeal is your personal space for emotional wellness and
                healing. Here are a few ways to get started:
              </p>

              <div className="space-y-4 my-6">
                {welcomeSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.2 }}
                    className={`flex items-start p-3 rounded-lg ${
                      completedSteps.includes(index)
                        ? "bg-green-50 border border-green-100"
                        : "bg-white/70 border border-purple-100"
                    }`}
                  >
                    <div className="mr-3 mt-0.5">
                      {completedSteps.includes(index) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-purple-300 flex items-center justify-center">
                          <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-800">{step.title}</h4>
                      <p className="text-sm text-purple-600 mb-2">{step.description}</p>
                      <Link href={step.link}>
                        <Button
                          size="sm"
                          variant={completedSteps.includes(index) ? "outline" : "default"}
                          className={
                            completedSteps.includes(index)
                              ? "border-green-300 text-green-700 hover:bg-green-50"
                              : "bg-purple-600 hover:bg-purple-700"
                          }
                          onClick={() => markStepComplete(index)}
                        >
                          {completedSteps.includes(index) ? "Completed" : step.action}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-700">Your progress</span>
                  <span className="text-purple-700 font-medium">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-purple-100"
                  indicatorClassName="bg-gradient-to-r from-pink-500 to-purple-500"
                />
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-4">
          <p className="text-xs text-purple-600 italic">
            Your emotional wellness journey begins with small steps. We're here to support you every step of the way.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
