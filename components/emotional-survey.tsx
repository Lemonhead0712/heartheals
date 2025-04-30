"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSurveyQuestions } from "@/hooks/use-survey-questions"
import { useEmotionLogs } from "@/hooks/use-emotion-logs"
import { useToast } from "@/hooks/use-toast"

interface EmotionalSurveyProps {
  onComplete?: () => void
}

export function EmotionalSurvey({ onComplete }: EmotionalSurveyProps) {
  const { questions, answers, isComplete, selectAnswer, getFormattedAnswers, resetSurvey } = useSurveyQuestions(3)
  const { addSurveyAnswers } = useEmotionLogs()
  const { toast } = useToast()
  const [isSaved, setIsSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isComplete) {
      const formattedAnswers = getFormattedAnswers()
      const success = addSurveyAnswers(formattedAnswers)

      if (success) {
        setIsSaved(true)
        toast({
          title: "Survey Completed",
          description: "Thank you for providing additional insights about your emotional state.",
        })
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete()
        }
      }
    }
  }

  // If the survey has been saved, show a thank you message
  if (isSaved) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="mb-8 border-green-200 bg-white/90 backdrop-blur-sm shadow-md">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-green-800 mb-2">Survey Completed ✓</h3>
            <p className="text-green-600 mb-4">
              Thank you for providing additional insights about your emotional state.
            </p>
            <Button
              onClick={() => {
                resetSurvey()
                setIsSaved(false)
                // If onComplete is provided, call it when user chooses to take another survey
                if (onComplete) {
                  onComplete()
                }
              }}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              Take Another Survey
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 border-pink-200 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-pink-700">Quick Emotional Survey</CardTitle>
              <CardDescription className="text-pink-600">
                Help us understand your emotional state better by answering these 3 quick questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <h3 className="font-medium text-pink-800">{question.text}</h3>
                    <RadioGroup
                      value={answers[question.id] || ""}
                      onValueChange={(value) => selectAnswer(question.id, value)}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option}
                            id={`${question.id}-${option}`}
                            className="border-pink-300 text-pink-600"
                          />
                          <Label
                            htmlFor={`${question.id}-${option}`}
                            className="text-sm font-normal text-pink-700 cursor-pointer"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={!isComplete}
                  className={`w-full ${
                    isComplete
                      ? "bg-pink-600 hover:bg-pink-700 text-white"
                      : "bg-pink-200 text-pink-400 cursor-not-allowed"
                  }`}
                >
                  Submit Survey
                </Button>
                <p className="text-xs text-center text-pink-500">
                  {isComplete
                    ? "All questions answered! Click submit to continue."
                    : "Please answer all questions to continue."}
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
