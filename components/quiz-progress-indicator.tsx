"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type QuizHistory = {
  quizType: string
  questionIds: string[]
  timestamp: string
}

type CategoryCoverage = {
  "self-kindness": number
  "common-humanity": number
  mindfulness: number
  total: number
}

export function QuizProgressIndicator() {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [categoryCoverage, setCategoryCoverage] = useState<CategoryCoverage>({
    "self-kindness": 0,
    "common-humanity": 0,
    mindfulness: 0,
    total: 0,
  })

  useEffect(() => {
    try {
      // Load quiz history
      const history = JSON.parse(localStorage.getItem("heartHeals_quizHistory") || "[]") as QuizHistory[]
      setQuizHistory(history.filter((h) => h.quizType === "self-compassion"))

      // Calculate category coverage
      if (history.length > 0) {
        // Get all self-compassion questions
        const allQuestions = JSON.parse(localStorage.getItem("heartHeals_selfCompassionQuestions") || "[]")

        if (allQuestions.length > 0) {
          const categoryCounts = {
            "self-kindness": allQuestions.filter((q: any) => q.category === "self-kindness").length,
            "common-humanity": allQuestions.filter((q: any) => q.category === "common-humanity").length,
            mindfulness: allQuestions.filter((q: any) => q.category === "mindfulness").length,
          }

          // Get unique question IDs from history
          const uniqueQuestionIds = new Set(
            history.filter((h) => h.quizType === "self-compassion").flatMap((h) => h.questionIds),
          )

          // Count questions by category
          const coveredQuestions = {
            "self-kindness": 0,
            "common-humanity": 0,
            mindfulness: 0,
            total: uniqueQuestionIds.size,
          }

          uniqueQuestionIds.forEach((id) => {
            const question = allQuestions.find((q: any) => q.id === id)
            if (question && question.category) {
              coveredQuestions[question.category as keyof typeof coveredQuestions] += 1
            }
          })

          // Calculate percentages
          setCategoryCoverage({
            "self-kindness": Math.round((coveredQuestions["self-kindness"] / categoryCounts["self-kindness"]) * 100),
            "common-humanity": Math.round(
              (coveredQuestions["common-humanity"] / categoryCounts["common-humanity"]) * 100,
            ),
            mindfulness: Math.round((coveredQuestions["mindfulness"] / categoryCounts["mindfulness"]) * 100),
            total: Math.round((uniqueQuestionIds.size / allQuestions.length) * 100),
          })
        }
      }
    } catch (error) {
      console.error("Error loading quiz history:", error)
    }
  }, [])

  if (quizHistory.length === 0) {
    return null
  }

  return (
    <Card className="border-purple-200 bg-white/90 backdrop-blur-sm shadow-md mb-6">
      <CardHeader>
        <CardTitle className="text-purple-700">Self-Compassion Assessment Progress</CardTitle>
        <CardDescription className="text-purple-600">
          Track your progress in assessing different aspects of self-compassion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Overall Coverage</span>
            <span className="text-sm text-purple-600">{categoryCoverage.total}%</span>
          </div>
          <Progress value={categoryCoverage.total} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">Self-Kindness</span>
              <span className="text-sm text-purple-600">{categoryCoverage["self-kindness"]}%</span>
            </div>
            <Progress value={categoryCoverage["self-kindness"]} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">Common Humanity</span>
              <span className="text-sm text-purple-600">{categoryCoverage["common-humanity"]}%</span>
            </div>
            <Progress value={categoryCoverage["common-humanity"]} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">Mindfulness</span>
              <span className="text-sm text-purple-600">{categoryCoverage.mindfulness}%</span>
            </div>
            <Progress value={categoryCoverage.mindfulness} className="h-2" />
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-purple-600">
            <span className="font-medium">Quizzes taken:</span> {quizHistory.length}
          </p>
          <p className="text-xs text-purple-500 mt-1">
            Take the quiz regularly to get a comprehensive assessment of your self-compassion.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
