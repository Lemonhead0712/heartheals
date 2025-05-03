"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type QuizProgressIndicatorProps = {
  quizType: "emotional-awareness" | "self-compassion"
  currentQuizQuestions?: string[]
  quizCompleted?: boolean // Add this new prop
}

export function QuizProgressIndicator({
  quizType,
  currentQuizQuestions = [],
  quizCompleted = false, // Add this new prop with default value
}: QuizProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])
  const [categoryCoverage, setCategoryCoverage] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      // Load all questions for the current quiz type
      const storageKey =
        quizType === "self-compassion" ? "heartsHeal_selfCompassionQuestions" : "heartsHeal_emotionalAwarenessQuestions"

      const allQuestions = JSON.parse(localStorage.getItem(storageKey) || "[]")
      setTotalQuestions(allQuestions.length)

      // Load quiz history to see which questions have been answered
      const quizHistory = JSON.parse(localStorage.getItem("heartsHeal_quizHistory") || "[]")
      const typeHistory = quizHistory.filter((history: any) => history.quizType === quizType)

      // Get all unique question IDs that have been shown
      const allAnsweredQuestionIds = new Set<string>()
      typeHistory.forEach((history: any) => {
        history.questionIds.forEach((id: string) => allAnsweredQuestionIds.add(id))
      })

      setAnsweredQuestions(Array.from(allAnsweredQuestionIds))

      // Calculate progress
      if (totalQuestions > 0) {
        const progressValue = Math.min(100, Math.round((allAnsweredQuestionIds.size / totalQuestions) * 100))
        setProgress(progressValue)
      }

      // Calculate category coverage if we have questions with categories
      if (allQuestions.length > 0 && allQuestions[0].category) {
        // Get categories from the quiz type
        const categories =
          quizType === "self-compassion"
            ? ["self-kindness", "common-humanity", "mindfulness"]
            : ["recognition", "expression", "regulation"]

        // Count questions by category
        const categoryCounts: Record<string, number> = {}
        categories.forEach((category) => {
          categoryCounts[category] = allQuestions.filter((q: any) => q.category === category).length
        })

        // Count answered questions by category
        const coveredQuestions: Record<string, number> = {}
        categories.forEach((category) => {
          coveredQuestions[category] = 0
        })

        // Find which questions have been answered
        allAnsweredQuestionIds.forEach((id) => {
          const question = allQuestions.find((q: any) => q.id === id)
          if (question && question.category) {
            coveredQuestions[question.category] = (coveredQuestions[question.category] || 0) + 1
          }
        })

        // Calculate percentages
        const coverage: Record<string, number> = {}
        categories.forEach((category) => {
          coverage[category] = Math.round((coveredQuestions[category] / categoryCounts[category]) * 100)
        })

        setCategoryCoverage(coverage)
      }
    } catch (error) {
      console.error(`Error loading ${quizType} quiz progress:`, error)
    }
  }, [totalQuestions, currentQuizQuestions, quizType])

  if (totalQuestions === 0) return null

  const formatCategory = (category: string): string => {
    switch (category) {
      case "self-kindness":
        return "Self-Kindness"
      case "common-humanity":
        return "Common Humanity"
      case "mindfulness":
        return "Mindfulness"
      case "recognition":
        return "Emotion Recognition"
      case "expression":
        return "Emotion Expression"
      case "regulation":
        return "Emotion Regulation"
      default:
        return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-purple-700">
          {quizType === "emotional-awareness" ? "Emotional Awareness" : "Self-Compassion"} Progress
        </CardTitle>
        <CardDescription className="text-purple-600">
          Track your progress in assessing different aspects of{" "}
          {quizType === "emotional-awareness" ? "emotional awareness" : "self-compassion"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Overall Coverage</span>
            <span className="text-sm text-purple-600">
              {currentQuizQuestions.length > 0 && quizCompleted ? progress : 0}%
            </span>
          </div>
          <Progress value={currentQuizQuestions.length > 0 && quizCompleted ? progress : 0} className="h-2" />
        </div>

        {Object.keys(categoryCoverage).length > 0 && currentQuizQuestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(categoryCoverage).map(([category, value]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-purple-700">{formatCategory(category)}</span>
                  <span className="text-sm text-purple-600">{quizCompleted ? value : 0}%</span>
                </div>
                <Progress value={quizCompleted ? value : 0} className="h-2" />
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm text-purple-600">
            <span className="font-medium">Questions in current quiz:</span> {currentQuizQuestions.length}
          </p>
          {currentQuizQuestions.length > 0 && !quizCompleted && (
            <p className="text-xs text-purple-500 mt-1">Complete the quiz to see your progress.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
